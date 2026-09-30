import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import sendResponse from "../helpers/response.js";
import Appointment from "../models/appointment.model.js";

// Feature 4: sales analytics for ADMIN (every workshop, or one workshop via
// ?workshop=) and WORKSHOP_MANAGER (always scoped to their own workshop).
const getSalesAnalytics = asyncHandler(async (req, res) => {
  const matchWorkshop = {};

  if (req.user.role === "WORKSHOP_MANAGER") {
    if (!req.user.workshop) {
      return sendResponse(res, 200, "Sales analytics fetched", emptyAnalytics());
    }
    matchWorkshop.workshop = req.user.workshop;
  } else if (req.query.workshop) {
    matchWorkshop.workshop = new mongoose.Types.ObjectId(req.query.workshop);
  }

  const completedMatch = { ...matchWorkshop, status: "COMPLETED" };
  const revenueExpr = { $ifNull: ["$finalCost", "$estimatedCost"] };

  const [summaryResult, statusBreakdownRaw, monthlyRaw, topServices, byWorkshop] =
    await Promise.all([
      Appointment.aggregate([
        { $match: completedMatch },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: revenueExpr },
            completedCount: { $sum: 1 },
            avgTicket: { $avg: revenueExpr },
          },
        },
      ]),

      Appointment.aggregate([
        { $match: matchWorkshop },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),

      Appointment.aggregate([
        { $match: completedMatch },
        {
          $group: {
            _id: { year: { $year: "$appointmentDate" }, month: { $month: "$appointmentDate" } },
            revenue: { $sum: revenueExpr },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": -1, "_id.month": -1 } },
        { $limit: 12 },
      ]),

      Appointment.aggregate([
        { $match: completedMatch },
        { $unwind: "$services" },
        { $group: { _id: "$services", bookings: { $sum: 1 } } },
        { $sort: { bookings: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "services",
            localField: "_id",
            foreignField: "_id",
            as: "service",
          },
        },
        { $unwind: "$service" },
        { $project: { _id: 0, serviceId: "$_id", name: "$service.name", bookings: 1 } },
      ]),

      req.user.role === "ADMIN" && !req.query.workshop
        ? Appointment.aggregate([
            { $match: completedMatch },
            {
              $group: {
                _id: "$workshop",
                revenue: { $sum: revenueExpr },
                count: { $sum: 1 },
              },
            },
            { $sort: { revenue: -1 } },
            {
              $lookup: {
                from: "workshops",
                localField: "_id",
                foreignField: "_id",
                as: "workshop",
              },
            },
            { $unwind: "$workshop" },
            { $project: { _id: 0, workshopId: "$_id", name: "$workshop.name", revenue: 1, count: 1 } },
          ])
        : Promise.resolve([]),
    ]);

  const summary = summaryResult[0];
  const statusBreakdown = statusBreakdownRaw.reduce(
    (acc, s) => ({ ...acc, [s._id]: s.count }),
    { PENDING: 0, CONFIRMED: 0, IN_PROGRESS: 0, COMPLETED: 0, CANCELLED: 0 },
  );
  const monthly = monthlyRaw
    .map((m) => ({ year: m._id.year, month: m._id.month, revenue: m.revenue, count: m.count }))
    .reverse();

  return sendResponse(res, 200, "Sales analytics fetched", {
    totalRevenue: summary?.totalRevenue || 0,
    completedCount: summary?.completedCount || 0,
    avgTicket: Math.round((summary?.avgTicket || 0) * 100) / 100,
    statusBreakdown,
    monthly,
    topServices,
    byWorkshop,
  });
});

const emptyAnalytics = () => ({
  totalRevenue: 0,
  completedCount: 0,
  avgTicket: 0,
  statusBreakdown: { PENDING: 0, CONFIRMED: 0, IN_PROGRESS: 0, COMPLETED: 0, CANCELLED: 0 },
  monthly: [],
  topServices: [],
  byWorkshop: [],
});

export { getSalesAnalytics };
