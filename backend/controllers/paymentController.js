import axios from "axios";
import crypto from "crypto";

import Checkout from "../models/Checkout.js";
import Order from "../models/Order.js";
import User from "../models/User.js";

import { sendReceiptEmail } from "../services/emailService.js";


// ============================
// INITIALIZE PAYMENT
// ============================

export const initializePayment = async (req, res) => {
  try {
    const { items, totalPrice } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    const amount = Number(totalPrice || 0);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        message: "A valid total price is required",
      });
    }

    const reference =
      "CB_" +
      Date.now() +
      crypto.randomBytes(4).toString("hex");

    await Checkout.create({
      user: req.user.id,
      items,
      totalPrice,
      reference,
    });

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: req.user.email,
        amount: Math.round(amount * 100),
        currency: "NGN",
        reference,
        callback_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/payment-success`,
        metadata: {
          userId: req.user.id,
          items: items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      {
        headers: {
          Authorization:
            `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type":
            "application/json",
        },
      }
    );

    res.json(response.data.data);

  } catch (error) {

    console.log(error.response?.data || error);

    res.status(500).json({
      message: "Payment initialization failed",
    });

  }
};


// ============================
// VERIFY PAYMENT
// ============================

export const verifyPayment = async (req, res) => {

  try {

    const { reference } = req.params;

    const existingOrder =
      await Order.findOne({
        paymentReference: reference,
      });

    if (existingOrder) {

      return res.json(existingOrder);

    }

    const response = await axios.get(

      `https://api.paystack.co/transaction/verify/${reference}`,

      {

        headers: {

          Authorization:
            `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,

        },

      }

    );

    const payment =
      response.data.data;

    if (payment.status !== "success") {

      return res.status(400).json({

        message: "Payment not successful",

      });

    }

    const checkout =
      await Checkout.findOne({
        reference,
      });

    if (!checkout) {

      return res.status(404).json({

        message: "Checkout not found",

      });

    }

    const order =
      await Order.create({

        user: checkout.user,

        items: checkout.items,

        totalPrice: checkout.totalPrice,

        paymentStatus: "paid",

        paymentReference: reference,

        paidAt: new Date(),

      });

    await Checkout.deleteOne({
      _id: checkout._id,
    });

    const buyer = await User.findById(order.user);

    try {
      if (buyer?.email) {
        await sendReceiptEmail(buyer.email, buyer.name, order);
      }
    } catch (emailError) {
      console.error("Receipt email failed", emailError?.message || emailError);
    }

    res.json(order);

  } catch (error) {

    console.log(error.response?.data || error);

    res.status(500).json({

      message: "Verification failed",

    });

  }

};