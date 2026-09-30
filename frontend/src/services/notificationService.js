import axiosInstance from "../api/axiosInstance.js";

// Feature 3: workshop-manager dashboard notifications, matching
// backend/routes/manager.route.js's /notifications endpoints.
const notificationService = {
  getMyNotifications: async () => (await axiosInstance.get("/manager/notifications")).data,
  markRead: async (id) => (await axiosInstance.patch(`/manager/notifications/${id}/read`)).data,
  markAllRead: async () => (await axiosInstance.patch("/manager/notifications/read-all")).data,
};

export default notificationService;
