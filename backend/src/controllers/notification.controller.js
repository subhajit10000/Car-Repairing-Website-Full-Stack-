import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import sendResponse from "../helpers/response.js";
import Notification from "../models/notification.model.js";

// Feature 3: workshop manager dashboard notifications, scoped to the
// manager's own workshop.
const getMyNotifications = asyncHandler(async (req, res) => {
  if (!req.user.workshop) {
    return sendResponse(res, 200, "Notifications fetched", {
      notifications: [],
      unreadCount: 0,
    });
  }

  const [notifications, unreadCount] = await Promise.all([
    Notification.find({ workshop: req.user.workshop })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("appointment", "vehicle appointmentDate timeSlot status"),
    Notification.countDocuments({ workshop: req.user.workshop, isRead: false }),
  ]);

  return sendResponse(res, 200, "Notifications fetched", { notifications, unreadCount });
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, workshop: req.user.workshop },
    { isRead: true },
    { new: true },
  );
  if (!notification) throw new ApiError(404, "Notification not found.");
  return sendResponse(res, 200, "Notification marked as read", notification);
});

const markAllNotificationsRead = asyncHandler(async (req, res) => {
  if (req.user.workshop) {
    await Notification.updateMany(
      { workshop: req.user.workshop, isRead: false },
      { isRead: true },
    );
  }
  return sendResponse(res, 200, "All notifications marked as read");
});

export { getMyNotifications, markNotificationRead, markAllNotificationsRead };
