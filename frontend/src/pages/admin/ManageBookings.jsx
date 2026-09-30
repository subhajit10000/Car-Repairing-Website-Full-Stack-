import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CarFront,
  Clock,
  Download,
  Mail,
  MapPin,
  Phone,
  User,
  Wrench,
  XCircle,
} from "lucide-react";

import bookingService from "../../services/bookingService.js";
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_STYLES,
  CANCELLABLE_STATUSES,
} from "../../constants/status.js";
import { getCurrentUser } from "../../utils/storage.js";

const FILTERS = ["ALL", "PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

// The forward progression a workshop manager/admin can move a repair
// through. Matches backend/models/appointment.model.js status enum, minus
// CANCELLED (handled separately via the Cancel button).
const NEXT_STATUS = {
  PENDING: "CONFIRMED",
  CONFIRMED: "IN_PROGRESS",
  IN_PROGRESS: "COMPLETED",
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
      APPOINTMENT_STATUS_STYLES[status] || "bg-zinc-700/30 text-zinc-400 border-zinc-600"
    }`}
  >
    {APPOINTMENT_STATUS_LABELS[status] || status}
  </span>
);

// Lets an admin/workshop-manager see every appointment placed by every
// customer and cancel any of them. Backend enforces the role check on
// GET /appointments and PATCH /appointments/:id/cancel, so this page is
// only reachable by privileged roles anyway (see App.jsx's RoleRoute).
// A WORKSHOP_MANAGER only ever sees/edits their own workshop's bookings —
// GET /appointments already scopes that server-side.
const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [cancellingId, setCancellingId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [finalCostDrafts, setFinalCostDrafts] = useState({});

  const currentUser = getCurrentUser();
  const canManageStatus = ["ADMIN", "WORKSHOP_MANAGER"].includes(currentUser?.role);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await bookingService.getAllBookings();
      const data = response?.data?.data || response?.data || [];

      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching all bookings:", err);
      setError(err.message || "Unable to load appointments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    if (filter === "ALL") return bookings;
    return bookings.filter((b) => b.status === filter);
  }, [bookings, filter]);

  const counts = useMemo(() => {
    const c = { ALL: bookings.length };
    FILTERS.slice(1).forEach((s) => {
      c[s] = bookings.filter((b) => b.status === s).length;
    });
    return c;
  }, [bookings]);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this customer's appointment? This cannot be undone.")) {
      return;
    }

    try {
      setActionError("");
      setCancellingId(id);

      await bookingService.cancelBooking(id, "Cancelled by admin");

      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: "CANCELLED" } : b))
      );
    } catch (err) {
      setActionError(err.message || "Unable to cancel this appointment.");
    } finally {
      setCancellingId(null);
    }
  };

  // Feature 5: only a workshop manager (own workshop, enforced server-side)
  // or admin can advance a repair's status. Feature 4: on COMPLETED, this
  // also sends the customer their finalCost-based invoice.
  const handleAdvanceStatus = async (booking) => {
    const nextStatus = NEXT_STATUS[booking.status];
    if (!nextStatus) return;

    try {
      setActionError("");
      setUpdatingId(booking._id);

      const payload = { status: nextStatus };
      const draftCost = finalCostDrafts[booking._id];
      if (nextStatus === "COMPLETED" && draftCost) {
        payload.finalCost = Number(draftCost);
      }

      const response = await bookingService.updateStatus(booking._id, payload);
      const updated = response?.data?.data || response?.data;

      setBookings((prev) =>
        prev.map((b) => (b._id === booking._id ? updated || { ...b, status: nextStatus } : b))
      );
    } catch (err) {
      setActionError(err.message || "Unable to update this appointment's status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDownloadInvoice = async (booking) => {
    try {
      setActionError("");
      setDownloadingId(booking._id);

      const blob = await bookingService.downloadInvoice(booking._id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${booking.invoiceNumber || booking._id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setActionError(err.message || "Unable to download the invoice.");
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto rounded-full border-4 border-zinc-700 border-t-yellow-500 animate-spin" />
          <p className="mt-5 text-zinc-400">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-yellow-500 flex items-center justify-center shadow-lg shadow-yellow-500/20 shrink-0">
            <CalendarDays className="w-7 h-7 text-black" />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black">Manage Bookings</h1>
            <p className="text-zinc-400 mt-1 text-sm">
              Every appointment booked by every customer
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mt-8">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                filter === f
                  ? "bg-yellow-500 text-black border-yellow-500"
                  : "border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600"
              }`}
            >
              {f === "ALL" ? "All" : APPOINTMENT_STATUS_LABELS[f]}
              {typeof counts[f] === "number" ? ` (${counts[f]})` : ""}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <AlertCircle size={18} className="shrink-0" />
            {error}
          </div>
        )}

        {actionError && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <AlertCircle size={18} className="shrink-0" />
            {actionError}
          </div>
        )}

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="mt-10 bg-zinc-800 border border-zinc-700 rounded-3xl p-10 text-center">
            <Wrench className="mx-auto text-zinc-600" size={40} />
            <p className="text-zinc-400 mt-4">
              {filter === "ALL"
                ? "No appointments have been booked yet."
                : `No ${APPOINTMENT_STATUS_LABELS[filter]?.toLowerCase()} appointments.`}
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-5">
            {filteredBookings.map((booking) => {
              const customer =
                typeof booking.user === "object" ? booking.user : null;
              const customerName = customer
                ? `${customer.firstName || ""} ${customer.lastName || ""}`.trim()
                : "Customer";

              const workshopName =
                typeof booking.workshop === "object"
                  ? booking.workshop?.name
                  : "Workshop";

              const workshopLocation =
                typeof booking.workshop === "object" ? booking.workshop?.location : null;

              const serviceNames = Array.isArray(booking.services)
                ? booking.services
                    .map((s) => (typeof s === "object" ? s?.name : null))
                    .filter(Boolean)
                : [];

              const canCancel = CANCELLABLE_STATUSES.includes(booking.status);

              return (
                <div
                  key={booking._id}
                  className="bg-zinc-800 border border-zinc-700 rounded-3xl p-6 sm:p-7"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold text-white">{workshopName}</h3>
                        <StatusBadge status={booking.status} />
                      </div>

                      {workshopLocation && (
                        <p className="text-sm text-zinc-500 flex items-center gap-1.5 mt-1">
                          <MapPin size={14} className="text-yellow-500" />
                          {workshopLocation}
                        </p>
                      )}
                    </div>

                    {canCancel && (
                      <button
                        onClick={() => handleCancel(booking._id)}
                        disabled={cancellingId === booking._id}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-semibold transition disabled:opacity-50"
                      >
                        <XCircle size={16} />
                        {cancellingId === booking._id ? "Cancelling..." : "Cancel"}
                      </button>
                    )}
                  </div>

                  {/* Feature 5: repair-progress status control, workshop
                      manager/admin only. Feature 4: final cost + invoice. */}
                  {canManageStatus && NEXT_STATUS[booking.status] && (
                    <div className="mt-5 pt-5 border-t border-zinc-700 flex flex-wrap items-center gap-3">
                      {NEXT_STATUS[booking.status] === "COMPLETED" && (
                        <input
                          type="number"
                          min="0"
                          placeholder={`Final cost (est. ₹${booking.estimatedCost ?? 0})`}
                          value={finalCostDrafts[booking._id] || ""}
                          onChange={(e) =>
                            setFinalCostDrafts((prev) => ({ ...prev, [booking._id]: e.target.value }))
                          }
                          className="w-56 bg-zinc-900/80 border border-zinc-700 rounded-xl py-2 px-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-yellow-500"
                        />
                      )}
                      <button
                        onClick={() => handleAdvanceStatus(booking)}
                        disabled={updatingId === booking._id}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-semibold transition disabled:opacity-50"
                      >
                        {updatingId === booking._id
                          ? "Updating..."
                          : `Mark as ${APPOINTMENT_STATUS_LABELS[NEXT_STATUS[booking.status]]}`}
                      </button>
                    </div>
                  )}

                  {booking.status === "COMPLETED" && (
                    <div className="mt-5 pt-5 border-t border-zinc-700 flex flex-wrap items-center gap-3">
                      <span className="text-sm text-zinc-400">
                        Final Cost: <span className="text-yellow-500 font-bold">₹{booking.finalCost ?? booking.estimatedCost ?? 0}</span>
                      </span>
                      <button
                        onClick={() => handleDownloadInvoice(booking)}
                        disabled={downloadingId === booking._id}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600 text-sm font-semibold transition disabled:opacity-50"
                      >
                        <Download size={15} />
                        {downloadingId === booking._id ? "Downloading..." : "Invoice"}
                      </button>
                    </div>
                  )}

                  {/* Customer info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 pt-5 border-t border-zinc-700">
                    <div className="flex items-start gap-3">
                      <User size={18} className="text-yellow-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-zinc-500">Customer</p>
                        <p className="text-sm text-zinc-200 mt-0.5">
                          {customerName || "Unknown"}
                        </p>
                      </div>
                    </div>

                    {customer?.email && (
                      <div className="flex items-start gap-3">
                        <Mail size={18} className="text-yellow-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-zinc-500">Email</p>
                          <p className="text-sm text-zinc-200 mt-0.5">{customer.email}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <Phone size={18} className="text-yellow-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-zinc-500">Contact Phone</p>
                        <p className="text-sm text-zinc-200 mt-0.5">{booking.contactPhone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Appointment details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-zinc-700">
                    <div className="flex items-start gap-3">
                      <CalendarDays size={18} className="text-yellow-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-zinc-500">Date</p>
                        <p className="text-sm text-zinc-200 mt-0.5">
                          {new Date(booking.appointmentDate).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock size={18} className="text-yellow-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-zinc-500">Time Slot</p>
                        <p className="text-sm text-zinc-200 mt-0.5">{booking.timeSlot}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CarFront size={18} className="text-yellow-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-zinc-500">Vehicle</p>
                        <p className="text-sm text-zinc-200 mt-0.5">
                          {booking.vehicle?.make} {booking.vehicle?.model}
                          {booking.vehicle?.regNumber ? ` · ${booking.vehicle.regNumber}` : ""}
                        </p>
                      </div>
                    </div>
                  </div>

                  {serviceNames.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {serviceNames.map((name) => (
                        <span
                          key={name}
                          className="text-xs px-3 py-1.5 rounded-full bg-zinc-900/70 border border-zinc-700 text-zinc-300"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  )}

                  {booking.status === "CANCELLED" && booking.cancelReason && (
                    <p className="mt-4 text-xs text-zinc-500 italic">
                      Cancelled: {booking.cancelReason}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageBookings;
