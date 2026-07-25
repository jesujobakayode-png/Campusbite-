import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Loader from "../components/Loader";
import { AuthContext } from "../context/AuthContext";
import { ToastContext } from "../context/ToastContext";
import API from "../services/api";

function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post("/auth/login", formData);

      login(res.data);

      if (showToast) {
        showToast({
          message: "Login successful",
          type: "success",
        });
      }

      if (res.data.user.role?.toLowerCase() === "vendor") {
        navigate("/vendor-dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.log(error.response || error);

      if (showToast) {
        showToast({
          message: error.response?.data?.message || "Invalid credentials",
          type: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center px-2 py-6 text-gray-950 sm:px-4">
      {loading && <Loader />}

      <div className="w-full max-w-md rounded-2xl border border-stone-300 bg-[#fbfaf7] p-5 shadow-xl shadow-stone-300/60 sm:p-8">
        <h1 className="mb-2 text-center text-3xl font-bold text-stone-950 sm:text-4xl">
          Welcome Back
        </h1>

        <p className="mb-8 text-center text-sm text-gray-600 sm:text-base">
          Login to continue shopping
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            name="email"
            value={formData.email}
            placeholder="Email"
            onChange={handleChange}
            className="min-h-12 w-full rounded-lg border border-stone-200 bg-stone-50 p-3 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-100"
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              placeholder="Password"
              onChange={handleChange}
              className="min-h-12 w-full rounded-lg border border-stone-200 bg-stone-50 p-3 pr-20 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-100"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-3 flex items-center text-sm font-semibold text-amber-600"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="min-h-12 w-full rounded-lg border border-amber-500 bg-amber-500 py-3 font-bold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Login"}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-2 text-center text-gray-700">
          <Link
            to="/forgot-password"
            className="font-semibold text-amber-600 hover:text-amber-500"
          >
            Forgot password?
          </Link>
          <p>
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-amber-600 hover:text-amber-500"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
