import { useEffect, useState } from "react";
import { CreditCard, Star, LoaderCircle } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import bookingService from "../../services/bookingService.js";
import paymentService from "../../services/paymentService.js";
import { loadRazorpay } from "../../utils/razorpay.js";
import axiosInstance from "../../api/axiosInstance.js";

const getData = (response) => response?.data?.data || response?.data || [];

export default function PaymentFeedback() {
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const response = await bookingService.getMyBookings();
      setItems(getData(response));
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => { load(); }, []);

  const pay = async (appointment, stage) => {
    const key = `${appointment._id}-${stage}`;
    setBusy(key);
    setError("");

    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Razorpay Checkout could not be loaded.");

      const response = await paymentService.createOrder(appointment._id, stage);
      const data = getData(response);

      if (data.alreadyPaid) {
        await load();
        return;
      }

      const options = {
        key: data.keyId,
        amount: Math.round(Number(data.amount) * 100),
        currency: data.currency || "INR",
        name: "Car Detailing",
        description: stage === "ESTIMATE" ? "Estimated service payment" : "Remaining service payment",
        order_id: data.orderId,
        prefill: {
          name: `${appointment.user?.firstName || ""} ${appointment.user?.lastName || ""}`.trim(),
          email: appointment.user?.email || "",
          contact: appointment.contactPhone || "",
        },
        theme: { color: "#eab308" },
        handler: async (result) => {
          try {
            await paymentService.verify(appointment._id, {
              stage,
              razorpay_order_id: result.razorpay_order_id,
              razorpay_payment_id: result.razorpay_payment_id,
              razorpay_signature: result.razorpay_signature,
            });
            await load();
          } catch (e) {
            setError(e.message);
          } finally {
            setBusy(null);
          }
        },
        modal: {
          ondismiss: () => setBusy(null),
        },
      };

      const checkout = new window.Razorpay(options);
      checkout.on("payment.failed", (event) => {
        setError(event?.error?.description || "Razorpay payment failed.");
        setBusy(null);
      });
      checkout.open();
    } catch (e) {
      setError(e.message);
      setBusy(null);
    }
  };

  const feedback = async (id) => {
    try {
      await axiosInstance.post(`/stakeholder/appointments/${id}/feedback`, { rating, comment });
      setComment("");
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-black">Payments & Feedback</h1>
        <p className="text-zinc-500 mt-1">
          Pay your estimate before repair starts and the remaining balance after completion.
        </p>

        {error && (
          <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="mt-8 space-y-5">
          {items.map((appointment) => {
            const estimatePaid = appointment.estimatePayment?.status === "PAID";
            const finalPaid = appointment.finalPayment?.status === "PAID";
            const estimateAmount = Number(appointment.estimatedCost || 0);
            const finalAmount = Math.max(
              Number(appointment.finalCost || 0) - Number(appointment.estimatePayment?.amount || estimateAmount),
              0,
            );

            const canPayEstimate =
              appointment.status !== "CANCELLED" &&
              !estimatePaid &&
              appointment.status !== "COMPLETED";

            const canPayFinal =
              appointment.status === "COMPLETED" && !finalPaid;

            return (
              <div key={appointment._id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <div className="flex flex-wrap justify-between gap-5">
                  <div>
                    <h2 className="font-bold text-xl">{appointment.workshop?.name}</h2>
                    <p className="text-zinc-500 mt-1">
                      {appointment.vehicle?.make} {appointment.vehicle?.model} · {appointment.status}
                    </p>
                  </div>
                  <span className="text-xs text-zinc-500">
                    Razorpay Test Mode
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-5">
                  <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-4">
                    <p className="text-xs text-zinc-500">Estimated payment</p>
                    <p className="text-xl font-black text-yellow-500 mt-1">₹{estimateAmount.toLocaleString("en-IN")}</p>
                    <p className={`text-xs mt-2 ${estimatePaid ? "text-green-400" : "text-zinc-500"}`}>
                      {estimatePaid ? "Paid — repair can proceed" : "Required before repair starts"}
                    </p>
                    {canPayEstimate && (
                      <button
                        onClick={() => pay(appointment, "ESTIMATE")}
                        disabled={busy === `${appointment._id}-ESTIMATE`}
                        className="mt-4 px-4 py-2.5 rounded-xl bg-yellow-500 text-zinc-950 font-bold flex items-center gap-2 disabled:opacity-50"
                      >
                        {busy === `${appointment._id}-ESTIMATE` && <LoaderCircle size={16} className="animate-spin" />}
                        Pay Estimate
                      </button>
                    )}
                  </div>

                  <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-4">
                    <p className="text-xs text-zinc-500">Remaining after completion</p>
                    <p className="text-xl font-black text-yellow-500 mt-1">
                      ₹{finalAmount.toLocaleString("en-IN")}
                    </p>
                    <p className={`text-xs mt-2 ${finalPaid ? "text-green-400" : "text-zinc-500"}`}>
                      {finalPaid ? "Paid" : appointment.status === "COMPLETED" ? "Payment required to receive invoice" : "Available after completion"}
                    </p>
                    {canPayFinal && (
                      <button
                        onClick={() => pay(appointment, "FINAL")}
                        disabled={busy === `${appointment._id}-FINAL`}
                        className="mt-4 px-4 py-2.5 rounded-xl bg-yellow-500 text-zinc-950 font-bold flex items-center gap-2 disabled:opacity-50"
                      >
                        {busy === `${appointment._id}-FINAL` && <LoaderCircle size={16} className="animate-spin" />}
                        Pay Remaining
                      </button>
                    )}
                  </div>
                </div>

                {appointment.status === "COMPLETED" && finalPaid && !appointment.feedback?.rating && (
                  <div className="mt-6 border-t border-zinc-800 pt-5">
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button key={n} onClick={() => setRating(n)}>
                          <Star size={24} fill={n <= rating ? "currentColor" : "none"} className={n <= rating ? "text-yellow-500" : "text-zinc-600"} />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Tell us about your workshop experience"
                      className="w-full mt-3 bg-zinc-950 border border-zinc-800 rounded-xl p-3"
                      rows="3"
                    />
                    <button onClick={() => feedback(appointment._id)} className="mt-3 px-4 py-2.5 rounded-xl border border-zinc-700 font-semibold">
                      Submit feedback
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
