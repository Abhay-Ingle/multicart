"use client";

import { motion } from "framer-motion";
import { FaTimesCircle } from "react-icons/fa";
import { useRouter, useSearchParams } from "next/navigation";

export default function PaymentFailedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-black to-gray-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white/10 backdrop-blur-xl border border-red-400/20 shadow-2xl rounded-2xl p-10 max-w-md w-full text-center"
      >
        {/* Failed Icon */}
        <motion.div
          initial={{ rotate: -180, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="flex justify-center"
        >
          <FaTimesCircle className="text-red-500" size={120} />
        </motion.div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-white mt-6">
          Payment Failed
        </h1>

        {/* Sub Message */}
        <p className="text-gray-300 mt-3">
          Something went wrong. Your payment could not be processed.
        </p>
        <p className="text-gray-400 text-sm mt-1">
          Please try again or choose another payment method.
        </p>

        {/* Order ID if available */}
        {orderId && (
          <div className="mt-4 bg-black/40 p-3 rounded-lg border border-red-400/20">
            <p className="text-gray-400 text-xs">Order ID</p>
            <p className="text-white font-mono text-sm break-all">{orderId}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => router.push("/cart")}
            className="flex-1 py-3 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white font-semibold"
          >
            Back to Cart
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => router.push("/orders")}
            className="flex-1 py-3 rounded-lg bg-white/20 hover:bg-white/30 text-white font-semibold"
          >
            View Orders
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
