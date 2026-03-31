"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { signIn } from "next-auth/react";

export default function SignupPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<"user" | "vendor" | "admin" | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await axios.post("/api/auth/register", {
        name,
        email,
        password,
        role,
      });

      console.log(result.data);

      setName("");
      setEmail("");
      setPassword("");
      setRole(null);
      router.push("/login");
    } catch (error: any) {
      console.log(error.response?.data || error.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-6">
      <AnimatePresence mode="wait">

        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-lg text-center bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-10 border border-white/20"
          >
            <h1 className="text-4xl font-bold mb-4 text-blue-400">
              Welcome to MultiCart
            </h1>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: "User", icon: "👤", value: "user" },
                { label: "Vendor", icon: "🏪", value: "vendor" },
                { label: "Admin", icon: "👨‍💼", value: "admin" },
              ].map((item) => (
                <motion.div
                  key={item.value}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setRole(item.value as any)}
                  className={`p-4 cursor-pointer rounded-xl border border-white/30 shadow-lg flex flex-col items-center transition ${
                    role === item.value
                      ? "bg-blue-500"
                      : "bg-white/5 hover:bg-white/20"
                  }`}
                >
                  <span className="text-4xl mb-2">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </motion.div>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              className="mt-4 px-8 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl font-medium"
            >
              Next ➤
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20"
          >
            <h2 className="text-2xl font-semibold text-center mb-6 text-blue-300">
              Create Your Account
            </h2>

            <form onSubmit={handleSignup} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Full Name"
                required
                className="bg-white/10 border border-white/30 rounded-lg p-3"
                onChange={(e) => setName(e.target.value)}
                value={name}
              />

              <input
                type="email"
                placeholder="Email Address"
                required
                className="bg-white/10 border border-white/30 rounded-lg p-3"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  required
                  className="w-full bg-white/10 border border-white/30 rounded-lg p-3 pr-10"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <AiOutlineEyeInvisible size={22} />
                  ) : (
                    <AiOutlineEye size={22} />
                  )}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-blue-700 py-3 rounded-xl"
              >
                {loading ? (
                  <ClipLoader size={30} color="white" />
                ) : (
                  "Register Now ➤"
                )}
              </button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => signIn("google", { callbackUrl: "/" })}
                className="flex items-center justify-center gap-3 py-3 bg-white/10 border border-white/30 rounded-xl"
              >
                <FcGoogle className="w-5 h-5" />
                <span className="font-medium">Continue with Google</span>
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}