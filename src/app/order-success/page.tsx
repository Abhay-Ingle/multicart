"use client";

import { motion } from "framer-motion";
import { FaCheckCircle, FaBox } from "react-icons/fa";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

export default function OrderSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get("session_id");
      const orderIdParam = searchParams.get("order_id");

      if (!sessionId || !orderIdParam) {
        setError("Invalid payment params");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `/api/order/verify-session?session_id=${sessionId}&order_id=${orderIdParam}`
        );

        if (response.data.success) {
          setVerified(true);
          setOrderId(orderIdParam);
        } else {
          setError("Payment verification failed");
        }
      } catch (err: any) {
        console.error("Verification error:", err);
        setError(err.response?.data?.message || "Payment verification failed");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-gray-900 flex items-center justify-center px-4">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-white text-2xl font-semibold"
        >
          Verifying payment...
        </motion.div>
      </div>
    );
  }

  if (error || !verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-black to-gray-900 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-xl border border-red-400/20 shadow-2xl rounded-2xl p-10 max-w-md w-full text-center"
        >
          <h1 className="text-3xl font-bold text-red-400 mt-6">Payment Error</h1>
          <p className="text-gray-300 mt-4">{error || "Payment verification failed"}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => router.push("/orders")}
            className="mt-8 w-full py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold"
          >
            Go to Orders
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-gray-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-10 max-w-md w-full text-center"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ rotate: -180, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="flex justify-center"
        >
          <FaCheckCircle className="text-green-400" size={120} />
        </motion.div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-white mt-6">
          Payment Successful!
        </h1>

        {/* Sub Message */}
        <div className="flex flex-col items-center gap-2 mt-4 text-gray-300">
          <FaBox size={32} className="text-blue-300" />
          <p>Your order has been confirmed and is now being processed.</p>
        </div>

        {/* Order ID */}
        <div className="mt-6 bg-black/40 p-4 rounded-lg border border-white/10">
          <p className="text-gray-400 text-sm">Order ID</p>
          <p className="text-white font-mono text-lg break-all">{orderId}</p>
        </div>

        {/* Buttons */}
        <div className="mt-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => router.push("/orders")}
            className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold"
          >
            Go to Orders
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
