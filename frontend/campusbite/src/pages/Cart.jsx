import { useContext, useState } from "react";

import BackButton from "../components/BackButton";
import { CartContext } from "../context/CartContext";
import CartItem from "../components/CartItem";
import API from "../services/api";
import { ToastContext } from "../context/ToastContext";
import CheckoutSummary from "../components/CheckoutSummary";

function Cart() {
  const {
    cart,
    removeFromCart,
    increaseQty,
    decreaseQty,
    clearCart,
  } = useContext(CartContext);

  const { showToast } = useContext(ToastContext);
  const [paying, setPaying] = useState(false);

  const totalPrice = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const placeOrder = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      if (showToast) {
        showToast({
          message: "Please login to continue to payment",
          type: "error",
        });
      }
      return;
    }

    if (!cart.length) {
      if (showToast) {
        showToast({
          message: "Your cart is empty",
          type: "error",
        });
      }
      return;
    }

    setPaying(true);

    try {
      const orderData = {
        items: cart.map((item) => ({
          productId: item._id,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
        })),
        totalPrice,
      };

      const response = await API.post("/payments/initialize", orderData);

      if (response.data?.authorization_url) {
        window.location.href = response.data.authorization_url;
        return;
      }

      if (showToast) {
        showToast({
          message: "Payment could not be started. Please try again.",
          type: "error",
        });
      }
    } catch (error) {
      console.log(error);
      if (showToast) {
        showToast({
          message: error.response?.data?.message || "Payment initialization failed",
          type: "error",
        });
      }
    } finally {
      setPaying(false);
    }
  };

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-stone-950 sm:text-4xl">
          Your Cart
        </h1>
        <BackButton />
      </div>

      {cart.length === 0 ? (
        <div className="rounded-2xl border border-stone-300 bg-[#fbfaf7] p-8 text-center shadow-sm sm:p-12">
          <div className="mb-5 text-4xl font-bold text-amber-700 sm:text-5xl">
            Cart
          </div>

          <h2 className="mb-3 text-2xl font-bold text-stone-950 sm:text-3xl">
            Your Cart is Empty
          </h2>

            <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
            Looks like you have not added any products yet. Browse campus
            vendors and discover something useful.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          <div className="space-y-4 lg:col-span-2">
            {cart.map((item) => (
              <CartItem
                key={item._id}
                item={item}
                removeFromCart={removeFromCart}
                increaseQty={increaseQty}
                decreaseQty={decreaseQty}
              />
            ))}
          </div>

          <CheckoutSummary
            cart={cart}
            totalPrice={totalPrice}
            placeOrder={placeOrder}
            paying={paying}
          />
        </div>
      )}
    </div>
  );
}

export default Cart;
