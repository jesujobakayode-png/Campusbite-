import express from "express";
import {
  getProfile,
  loginUser,
  verifyEmail,
  registerUser,
  resendVerificationEmail,
  updateProfile,
  listVendors,
  getVendorById,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/resend-verification", resendVerificationEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/verify-email", verifyEmail);
router.get("/verify/:token", verifyEmail);
router.get("/me", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.get("/vendors", listVendors);
router.get("/vendor/:id", getVendorById);

export default router;
