import axiosInstance from "../api/axiosInstance.js";

// Routed through the shared axiosInstance (see api/axiosInstance.js) instead
// of a hardcoded URL, so this always hits the same backend as every other
// service call, and any auth/CORS/network errors get the same normalized
// error.message shape.
const workshopService = {
  getServices: async () => {
    const response = await axiosInstance.get("/services");
    return response.data;
  },
};

const workshopDetails = {
  getworkshopDetails: async () => {
    const response = await axiosInstance.get("/workshops");
    return response.data;
  },
};

export { workshopService, workshopDetails };
