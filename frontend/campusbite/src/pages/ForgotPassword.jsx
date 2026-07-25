import { useContext, useState } from "react";
import { Link } from "react-router-dom";

import API from "../services/api";
import { ToastContext } from "../context/ToastContext";

function ForgotPassword() {
  const { showToast } = useContext(ToastContext);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      if (showToast) {
        showToast({ message: "Please enter your email address", type: "error" });
      }
      return;
    }

    setLoading(true);

    try {
      await API.post("/auth/forgot-password", { email });

      if (showToast) {
        showToast({
          message: "If an account exists, a reset link has been sent to your email.",
          type: "success",
        });
      }

      setEmail("");
    } catch (error) {
      if (showToast) {
        showToast({
          message: error.response?.data?.message || "Unable to process your request right now.",
          type: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center px-2 py-6 sm:px-4">
      <div className="w-full max-w-md rounded-2xl border border-stone-300 bg-[#fbfaf7] p-6 shadow-xl shadow-stone-300/60 sm:p-8">
        <h1 className="mb-2 text-center text-3xl font-bold text-stone-950 sm:text-4xl">
          Forgot Password
        </h1>
        <p className="mb-7 text-center text-sm leading-6 text-stone-600 sm:text-base">
          Enter your email and we will send you a secure link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="min-h-12 w-full rounded-lg border border-stone-200 bg-stone-50 p-3 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-100"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="min-h-12 w-full rounded-lg border border-amber-500 bg-amber-500 py-3 font-bold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-700">
          Remembered your password?{" "}
          <Link to="/login" className="font-semibold text-amber-600 hover:text-amber-500">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
