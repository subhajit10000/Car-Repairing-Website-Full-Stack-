import axiosInstance from "../api/axiosInstance.js";

// Endpoints used by the WORKSHOP_MANAGER dashboard
// (pages/workshop/WorkshopDashboard.jsx). Every one of these is scoped
// server-side to the manager's own workshop — see
// backend/middlewares/workshopOwnership.middleware.js — so a manager can
// never touch another workshop's data (feature 6) no matter what id is
// passed here.
const managerService = {
  getMyWorkshop: async () => (await axiosInstance.get("/manager/me")).data,
  addService: async (serviceId) => (await axiosInstance.post("/manager/services", { serviceId })).data,
  removeService: async (serviceId) => (await axiosInstance.delete(`/manager/services/${serviceId}`)).data,
  addEmployee: async (payload) => (await axiosInstance.post("/manager/employees", payload, {
    headers: payload instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined,
  })).data,
  removeEmployee: async (employeeId) => (await axiosInstance.delete(`/manager/employees/${employeeId}`)).data,
  getInventory: async () => (await axiosInstance.get("/manager/inventory")).data,
  addInventory: async (payload) => (await axiosInstance.post("/manager/inventory", payload)).data,
  removeInventory: async (id) => (await axiosInstance.delete(`/manager/inventory/${id}`)).data,

  // ---- Workshop (feature 6: operational fields only) ----
  getWorkshop: async (workshopId) => {
    const response = await axiosInstance.get(`/workshops/${workshopId}`);
    return response.data;
  },
  updateWorkshop: async (workshopId, payload) => {
    const response = await axiosInstance.patch(`/workshops/${workshopId}`, payload);
    return response.data;
  },

  // ---- Employees (feature 6, workshop-scoped: WorkshopDashboard.jsx) ----
  getWorkshopEmployees: async (workshopId) => {
    const response = await axiosInstance.get(`/workshops/${workshopId}/employees`);
    return response.data;
  },
  addWorkshopEmployee: async (workshopId, payload) => {
    const response = await axiosInstance.post(`/workshops/${workshopId}/employees`, payload);
    return response.data;
  },
  removeWorkshopEmployee: async (workshopId, employeeId) => {
    const response = await axiosInstance.delete(
      `/workshops/${workshopId}/employees/${employeeId}`,
    );
    return response.data;
  },

  // ---- Inventory (feature 6, workshop-scoped: WorkshopDashboard.jsx) ----
  getWorkshopInventory: async (workshopId) => {
    const response = await axiosInstance.get(`/workshops/${workshopId}/inventory`);
    return response.data;
  },
  addInventoryItem: async (workshopId, payload) => {
    const response = await axiosInstance.post(`/workshops/${workshopId}/inventory`, payload);
    return response.data;
  },
  updateInventoryItem: async (id, payload) => {
    const response = await axiosInstance.patch(`/inventory/${id}`, payload);
    return response.data;
  },
  deleteInventoryItem: async (id) => {
    const response = await axiosInstance.delete(`/inventory/${id}`);
    return response.data;
  },

  // ---- Services (feature 2) ----
  getAllServices: async () => {
    const response = await axiosInstance.get("/services");
    return response.data;
  },
  createService: async (payload) => {
    const response = await axiosInstance.post("/services", payload);
    return response.data;
  },
  updateService: async (id, payload) => {
    const response = await axiosInstance.patch(`/services/${id}`, payload);
    return response.data;
  },
  deleteService: async (id) => {
    const response = await axiosInstance.delete(`/services/${id}`);
    return response.data;
  },

  // ---- Mechanic assignment (feature 2) ----
  assignMechanic: async (appointmentId, mechanicId) => {
    const response = await axiosInstance.patch(
      `/stakeholder/appointments/${appointmentId}/mechanic`,
      { mechanicId },
    );
    return response.data;
  },
};

export default managerService;
