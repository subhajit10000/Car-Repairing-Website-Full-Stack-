import axiosInstance from "../api/axiosInstance.js";

// Feature 1: persisted advisor <-> customer conversation, matching
// backend/routes/stakeholder.route.js's /messages endpoints.
const communityService = {
  // Service-advisor side: repairs assigned to their workshop, to pick who to
  // message (reuses the same endpoint the advisor dashboard already used).
  getAppointments: async () => (await axiosInstance.get("/stakeholder/appointments")).data,

  // Full thread for one appointment. Works for the customer who owns it, the
  // workshop's own advisor/manager, or an admin.
  getConversation: async (appointmentId) =>
    (await axiosInstance.get(`/stakeholder/appointments/${appointmentId}/messages`)).data,

  // Service-advisor only: send a message with optional text and/or an image.
  sendMessage: async (appointmentId, { text, subject, image } = {}) => {
    const body = new FormData();
    if (text) body.append("text", text);
    if (subject) body.append("subject", subject);
    if (image) body.append("image", image);

    const response = await axiosInstance.post(
      `/stakeholder/appointments/${appointmentId}/messages`,
      body,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data;
  },

  // Customer only: every message addressed to them, across every workshop —
  // powers the "Community" page.
  getMyConversations: async () => (await axiosInstance.get("/stakeholder/messages/my")).data,
};

export default communityService;
