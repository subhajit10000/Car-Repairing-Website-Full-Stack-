import axiosInstance from "../api/axiosInstance.js";

// Matches backend/routes/appointment.route.js, mounted at /api/v1/appointments
// (see api/axiosInstance.js, whose baseURL already includes /api/v1, and which
// attaches the Bearer token + normalizes errors for every call below).
const bookingService = {
  // Create a new appointment booking.
  bookAppointment: async (payload) => {
    const response = await axiosInstance.post("/appointments", payload);
    return response.data;
  },

  // Get the logged-in user's own appointments. Used by MyBookings.jsx.
  getMyBookings: async () => {
    const response = await axiosInstance.get("/appointments/my");
    return response.data;
  },

  // Cancel an appointment by id. Used by MyBookings.jsx.
  cancelBooking: async (id, cancelReason) => {
    const response = await axiosInstance.patch(`/appointments/${id}/cancel`, {
      ...(cancelReason && { cancelReason }),
    });
    return response.data;
  },

  // Fetch a single appointment by id.
  getAppointmentById: async (id) => {
    const response = await axiosInstance.get(`/appointments/${id}`);
    return response.data;
  },

  // Admin/workshop-manager only: fetch every appointment, optionally
  // filtered by status. Used by admin/ManageBookings.jsx.
  getAllBookings: async (status) => {
    const response = await axiosInstance.get("/appointments", {
      params: status && status !== "ALL" ? { status } : {},
    });
    return response.data;
  },

  // Workshop-manager/admin only: move a repair through PENDING -> CONFIRMED
  // -> IN_PROGRESS -> COMPLETED (or CANCELLED). Triggers a progress email to
  // the customer, and on COMPLETED generates + emails the invoice.
  updateProgress: async (id, payload) => {
    const response = await axiosInstance.patch(`/appointments/${id}/status`, payload);
    return response.data;
  },

  updateStatus: async (id, payload) => {
    const response = await axiosInstance.patch(`/appointments/${id}/status`, payload);
    return response.data;
  },

  // Downloads the invoice PDF for a COMPLETED appointment as a Blob.
  downloadInvoice: async (id) => {
    const response = await axiosInstance.get(`/appointments/${id}/invoice`, {
      responseType: "blob",
    });
    return response.data;
  },
};

export default bookingService;
