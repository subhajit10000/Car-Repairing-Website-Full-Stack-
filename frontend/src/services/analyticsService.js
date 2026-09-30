import axiosInstance from "../api/axiosInstance.js";

// Feature 4: sales analytics, matching backend/routes/analytics.route.js.
// WORKSHOP_MANAGER is always scoped server-side to their own workshop;
// ADMIN can optionally pass a workshopId to focus on one workshop.
const analyticsService = {
  getSalesAnalytics: async (workshopId) => {
    const response = await axiosInstance.get("/analytics/sales", {
      params: workshopId ? { workshop: workshopId } : {},
    });
    return response.data;
  },
};

export default analyticsService;
