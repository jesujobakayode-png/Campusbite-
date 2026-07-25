import "./config/env.js";
import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://carthub-one.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "CartHub API is running",
    routes: {
      products: "/api/products",
      orders: "/api/orders",
      health: "/api/health"
    }
  });
});

app.get("/api", (req, res) => {
  res.json({
    message: "CartHub API is running",
    routes: {
      products: "/api/products",
      orders: "/api/orders",
      health: "/api/health"
    }
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok"
  });
});

const requireDB = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    res.status(500).json({
      message: "Database connection failed"
    });
  }
};

app.use("/api/products", requireDB, productRoutes);
app.use("/api/orders", requireDB, orderRoutes);
app.use("/api/auth", requireDB, authRoutes);
app.use("/api/payments",requireDB,paymentRoutes);

export default app;