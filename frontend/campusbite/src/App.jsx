import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Cart from "./pages/Cart";
import VendorDashboard from "./pages/VendorDashboard";
import Orders from "./pages/Orders";
import VendorOrders from "./pages/VendorOrders";
import VendorProfile from "./pages/VendorProfile";
import VendorProfilePublic from "./pages/VendorProfilePublic";
import Vendors from "./pages/Vendors";
import Notifications from "./pages/Notifications";

import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ProtectedRoute from "./components/ProtectedRoute";

import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import MyOrders from "./pages/MyOrders";
import PaymentSuccess from "./pages/PaymentSuccess";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";



function App() {
  const { user, loading } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-[#eef1f4] text-stone-950">

      <Navbar />

      <div className="mx-auto max-w-7xl px-3 py-5 sm:px-4 sm:py-6 lg:py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/dashboard" element={
            <ProtectedRoute user={user} loading={loading}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute user={user} loading={loading}>
              <Orders />
            </ProtectedRoute>
          } />
          <Route path="/vendor-dashboard" element={
            <ProtectedRoute user={user} role="vendor" loading={loading}>
              <VendorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/vendor-dashboard/:section" element={
            <ProtectedRoute user={user} role="vendor" loading={loading}>
              <VendorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/verify/:token" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/vendor/orders" element={
            <ProtectedRoute
              user={user}
              role="vendor"
              loading={loading}
            >
              <VendorOrders />
            </ProtectedRoute>
            } />
          <Route
            path="/vendor-profile"
            element={
              <ProtectedRoute user={user} role="vendor" loading={loading}>
                <VendorProfile />
              </ProtectedRoute>
            }
          />
          <Route path="/vendors" element={<Vendors />} />
          <Route path="/vendor/:id" element={<VendorProfilePublic />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route
              path="/my-orders"
              element={
                <ProtectedRoute user={user} loading={loading}>
                  <MyOrders />
                </ProtectedRoute>
            } />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute user={user} loading={loading}>
                <Notifications />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
