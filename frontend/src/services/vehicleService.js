import axiosInstance from "../api/axiosInstance.js";

// Matches backend/routes/vehicle.route.js, mounted at /api/v1/vehicles
// (see api/axiosInstance.js, whose baseURL already includes /api/v1, and which
// attaches the Bearer token + normalizes errors for every call below).
const vehicleService = {
  // Get the logged-in user's saved vehicles. Used by MyVehicles.jsx and the
  // vehicle picker in BookService.jsx.
  getMyVehicles: async () => {
    const response = await axiosInstance.get("/vehicles/my");
    return response.data;
  },

  // Add a new vehicle to the user's garage.
  addVehicle: async (payload) => {
    const response = await axiosInstance.post("/vehicles", payload);
    return response.data;
  },

  // Update an existing vehicle.
  updateVehicle: async (id, payload) => {
    const response = await axiosInstance.patch(`/vehicles/${id}`, payload);
    return response.data;
  },

  // Remove a vehicle from the user's garage.
  deleteVehicle: async (id) => {
    const response = await axiosInstance.delete(`/vehicles/${id}`);
    return response.data;
  },

  // Feature 3: upload/replace a vehicle's photo. Backend stores it on
  // Cloudinary and saves the resulting URL on the Vehicle document.
  uploadImage: async (id, file) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await axiosInstance.post(`/vehicles/${id}/image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};

export default vehicleService;
