import axiosInstance from "../api/axiosInstance.js";

const paymentService = {
  createOrder: async (appointmentId, stage) => {
    const response = await axiosInstance.post(
      `/stakeholder/appointments/${appointmentId}/payment/order`,
      { stage },
    );
    return response.data;
  },

  verify: async (appointmentId, payload) => {
    const response = await axiosInstance.post(
      `/stakeholder/appointments/${appointmentId}/payment/verify`,
      payload,
    );
    return response.data;
  },
};

export default paymentService;
