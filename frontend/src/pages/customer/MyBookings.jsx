import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  AlertCircle,
  CalendarDays,
  CarFront,
  Clock,
  Download,
  MapPin,
  Wrench,
  XCircle,
} from "lucide-react";

import bookingService from "../../services/bookingService.js";
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_STYLES,
  CANCELLABLE_STATUSES,
} from "../../constants/status.js";

const FILTERS = ["ALL", "PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
      APPOINTMENT_STATUS_STYLES[status] || "bg-zinc-700/30 text-zinc-400 border-zinc-600"
    }`}
  >
    {APPOINTMENT_STATUS_LABELS[status] || status}
  </span>
);

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [cancellingId, setCancellingId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await bookingService.getMyBookings();
      const data = response?.data?.data || response?.data || [];

      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError(err.message || "Unable to load your bookings. Please try again.");
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

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this appointment? This cannot be undone.")) {
      return;
    }

    try {
      setActionError("");
      setCancellingId(id);

      await bookingService.cancelBooking(id);

      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: "CANCELLED" } : b))
      );
    } catch (err) {
      setActionError(err.message || "Unable to cancel this appointment.");
    } finally {
      setCancellingId(null);
    }
  };

  // Feature 4: download the invoice PDF once a repair is COMPLETED.
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

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto rounded-full border-4 border-zinc-700 border-t-yellow-500 animate-spin" />
          <p className="mt-5 text-zinc-400">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-yellow-500 flex items-center justify-center shadow-lg shadow-yellow-500/20 shrink-0">
            <CalendarDays className="w-7 h-7 text-black" />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black">My Bookings</h1>
            <p className="text-zinc-400 mt-1 text-sm">
              Track and manage your service appointments
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
                ? "You haven't booked any appointments yet."
                : `No ${APPOINTMENT_STATUS_LABELS[filter]?.toLowerCase()} bookings.`}
            </p>

            <NavLink
              to="/Workshop"
              className="inline-flex items-center gap-2 mt-6 px-5 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-semibold transition"
            >
              Browse Workshops
            </NavLink>
          </div>
        ) : (
          <div className="mt-8 space-y-5">
            {filteredBookings.map((booking) => {
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

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 pt-5 border-t border-zinc-700">
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

                  {/* Feature 4: estimate at booking, final cost + invoice
                      once the workshop marks the repair COMPLETED. */}
                  {booking.status === "COMPLETED" ? (
                    <div className="mt-5 pt-5 border-t border-zinc-700 flex flex-wrap items-center justify-between gap-3">
                      <span className="text-sm text-zinc-400">
                        Final Cost:{" "}
                        <span className="text-yellow-500 font-bold">
                          ₹{booking.finalCost ?? booking.estimatedCost ?? 0}
                        </span>
                      </span>
                      <button
                        onClick={() => handleDownloadInvoice(booking)}
                        disabled={downloadingId === booking._id}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600 text-sm font-semibold transition disabled:opacity-50"
                      >
                        <Download size={15} />
                        {downloadingId === booking._id ? "Downloading..." : "Download Invoice"}
                      </button>
                    </div>
                  ) : (
                    booking.estimatedCost != null && (
                      <p className="mt-4 text-xs text-zinc-500">
                        Estimated Cost:{" "}
                        <span className="text-yellow-500 font-semibold">
                          ₹{booking.estimatedCost}
                        </span>
                      </p>
                    )
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

export default MyBookings;
