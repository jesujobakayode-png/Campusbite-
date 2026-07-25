function CheckoutSummary({
  cart,
  totalPrice,
  placeOrder,
  paying,
}) {

  const deliveryFee = totalPrice > 0 ? 500 : 0;

  const finalTotal = totalPrice + deliveryFee;

  const totalItems = cart.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  return (
    <div className="h-fit rounded-2xl border border-stone-300 bg-[#fbfaf7] p-5 shadow-sm lg:sticky lg:top-28 lg:p-6">

      <h2 className="mb-6 text-2xl font-bold text-stone-950 sm:text-3xl">
        Checkout Summary
      </h2>

      <div className="space-y-4 text-base text-stone-700 sm:text-lg">

        <div className="flex justify-between">
          <span>Total Items</span>
          <span>{totalItems}</span>
        </div>

        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>NGN {totalPrice}</span>
        </div>

        <div className="flex justify-between">
          <span>Delivery Fee</span>
          <span>NGN {deliveryFee}</span>
        </div>

        <div className="flex justify-between border-t border-stone-200 pt-4 text-xl font-bold text-amber-700 sm:text-2xl">
          <span>Total</span>
          <span>NGN {finalTotal}</span>
        </div>

      </div>

      <button
        onClick={placeOrder}
        disabled={paying}
        className="mt-8 min-h-12 w-full rounded-xl border border-amber-500 bg-amber-500 py-3 text-base font-bold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-70 sm:py-4 sm:text-lg"
      >
        {paying ? "Redirecting..." : `Pay ₦${finalTotal}`}
      </button>

    </div>
  );
}

export default CheckoutSummary;
