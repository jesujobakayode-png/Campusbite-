import { useContext, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import API from "../services/api";
import { ToastContext } from "../context/ToastContext";

function ResetPassword() {
  const { showToast } = useContext(ToastContext);
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);

  const token = searchParams.get("token");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      if (showToast) {
        showToast({ message: "Reset token is missing", type: "error" });
      }
      return;
    }

    if (formData.password.length < 6) {
      if (showToast) {
        showToast({ message: "Password must be at least 6 characters", type: "error" });
      }
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      if (showToast) {
        showToast({ message: "Passwords do not match", type: "error" });
      }
      return;
    }

    setLoading(true);

    try {
      await API.post("/auth/reset-password", {
        token,
        password: formData.password,
      });

      if (showToast) {
        showToast({ message: "Password reset successful. Please sign in again.", type: "success" });
      }

      setFormData({ password: "", confirmPassword: "" });
    } catch (error) {
      if (showToast) {
        showToast({ message: error.response?.data?.message || "Unable to reset password", type: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center px-2 py-6 sm:px-4">
      <div className="w-full max-w-md rounded-2xl border border-stone-300 bg-[#fbfaf7] p-6 shadow-xl shadow-stone-300/60 sm:p-8">
        <h1 className="mb-2 text-center text-3xl font-bold text-stone-950 sm:text-4xl">
          Reset Password
        </h1>
        <p className="mb-7 text-center text-sm leading-6 text-stone-600 sm:text-base">
          Choose a new password for your account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="New password"
            className="min-h-12 w-full rounded-lg border border-stone-200 bg-stone-50 p-3 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-100"
            required
          />
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm password"
            className="min-h-12 w-full rounded-lg border border-stone-200 bg-stone-50 p-3 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-100"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="min-h-12 w-full rounded-lg border border-amber-500 bg-amber-500 py-3 font-bold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-700">
          <Link to="/login" className="font-semibold text-amber-600 hover:text-amber-500">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
  }

export default ResetPassword;
