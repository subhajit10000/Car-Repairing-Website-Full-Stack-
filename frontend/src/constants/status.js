// Mirrors backend/models/appointment.model.js status enum.

export const APPOINTMENT_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

export const APPOINTMENT_STATUS_LABELS = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

// Tailwind classes for status badges, keyed the same way.
export const APPOINTMENT_STATUS_STYLES = {
  PENDING: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  CONFIRMED: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  IN_PROGRESS: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  COMPLETED: "bg-green-500/10 text-green-400 border-green-500/30",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/30",
};

// Statuses the customer is still allowed to cancel from their side.
export const CANCELLABLE_STATUSES = ["PENDING", "CONFIRMED"];
