import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { CartContext } from "../context/CartContext";
import API from "../services/api";

function PaymentSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useContext(CartContext);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Confirming your payment...");

  useEffect(() => {
    const verify = async () => {
      const reference = params.get("reference");

      if (!reference) {
        setStatus("error");
        setMessage("Payment reference is missing. Please contact support if you were charged.");
        return;
      }

      try {
        await API.get(`/payments/verify/${reference}`);
        clearCart();
        setStatus("success");
        setMessage("Your payment was successful and your order has been confirmed.");

        setTimeout(() => {
          navigate("/my-orders");
        }, 2000);
      } catch (error) {
        setStatus("error");
        setMessage(error.response?.data?.message || "We could not confirm your payment. Please contact support if you were charged.");
      }
    };

    verify();
  }, [clearCart, navigate, params]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl rounded-3xl border border-stone-300 bg-[#fbfaf7] p-8 text-center shadow-xl shadow-stone-300/50 sm:p-10">
        <h1 className="mb-3 text-3xl font-bold text-stone-950 sm:text-4xl">
          {status === "success" ? "Payment Successful" : status === "error" ? "Payment Needs Attention" : "Processing Payment"}
        </h1>

        <p className="mb-8 text-base leading-7 text-stone-600">
          {message}
        </p>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/my-orders"
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-amber-500 bg-amber-500 px-5 py-3 font-semibold text-black transition hover:bg-amber-400"
          >
            View My Orders
          </Link>
          <Link
            to="/"
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-stone-300 px-5 py-3 font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-stone-100"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;