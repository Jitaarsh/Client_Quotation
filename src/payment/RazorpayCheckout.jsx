import { forwardRef, useImperativeHandle, useState } from "react";
import axiosInstance from "../api/axiosInstance";

const RAZORPAY_SCRIPT_ID = "razorpay-checkout-js";

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.getElementById(RAZORPAY_SCRIPT_ID);
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true), { once: true });
      existingScript.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = RAZORPAY_SCRIPT_ID;
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const RazorpayCheckout = forwardRef(function RazorpayCheckout(
  { amount, customer, description = "Subscription payment", onSuccess, onFailure },
  ref
) {
  const [loading, setLoading] = useState(false);

  const openCheckout = async () => {
    const publicKey = import.meta.env.VITE_RAZORPAY_KEY;

    if (!publicKey) {
      onFailure?.("Missing VITE_RAZORPAY_KEY in the frontend environment.");
      return false;
    }

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      onFailure?.("Please select a valid paid plan before payment.");
      return false;
    }

    setLoading(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Razorpay checkout script failed to load.");
      }

      const { data } = await axiosInstance.post("/company/payment/create-order", {
        amount: numericAmount,
        currency: "INR",
      });

      if (!data?.success || !data?.order) {
        throw new Error(data?.message || "Unable to create payment order.");
      }

      const order = data.order;

      const checkout = new window.Razorpay({
        key: publicKey,
        amount: order.amount,
        currency: order.currency,
        name: "UniCrop",
        description,
        order_id: order.id,
        prefill: {
          name: customer?.name || "",
          email: customer?.email || "",
          contact: customer?.contact || "",
        },
        theme: {
          color: "#145be9",
        },
        handler: async (response) => {
          try {
            const verifyResponse = await axiosInstance.post(
              "/company/payment/verify",
              response
            );

            if (verifyResponse.data?.success) {
              onSuccess?.({
                ...response,
                verification: verifyResponse.data,
              });
            } else {
              onFailure?.(verifyResponse.data?.message || "Payment verification failed.");
            }
          } catch (error) {
            onFailure?.(
              error.response?.data?.message ||
                error.message ||
                "Payment verification failed."
            );
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      });

      checkout.on("payment.failed", (response) => {
        setLoading(false);
        onFailure?.(
          response.error?.description ||
            response.error?.reason ||
            "Payment failed. Please try again."
        );
      });

      checkout.open();
      return true;
    } catch (error) {
      onFailure?.(
        error.response?.data?.message ||
          error.message ||
          "Unable to start Razorpay checkout."
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    openCheckout,
    loading,
  }));

  return null;
});

export default RazorpayCheckout;
