import crypto from "crypto";

const getCredentials = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error(
      "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env",
    );
  }

  return { keyId, keySecret };
};

const createRazorpayOrder = async ({ amount, receipt, notes = {} }) => {
  const { keyId, keySecret } = getCredentials();

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(`${keyId}:${keySecret}`).toString("base64"),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: Math.round(Number(amount)),
      currency: "INR",
      receipt,
      notes,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.description || "Unable to create Razorpay order.");
  }

  return { ...data, key_id: keyId };
};

const verifyRazorpaySignature = ({ orderId, paymentId, signature }) => {
  const { keySecret } = getCredentials();

  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const received = Buffer.from(signature || "", "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");

  if (received.length !== expectedBuffer.length) return false;

  return crypto.timingSafeEqual(expectedBuffer, received);
};

export { createRazorpayOrder, verifyRazorpaySignature };
