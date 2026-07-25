import mongoose from "mongoose";

const checkoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: Array,

    totalPrice: Number,

    reference: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Checkout",
  checkoutSchema
);