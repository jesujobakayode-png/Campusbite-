import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

console.log("Testing SMTP connection...\n");
console.log("Configuration:");
console.log("- Host:", process.env.SMTP_HOST);
console.log("- Port:", process.env.SMTP_PORT);
console.log("- User:", process.env.SMTP_USER);
console.log("- From:", process.env.EMAIL_FROM);
console.log("\n");

transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP Connection Failed:");
    console.error(error.message);
  } else {
    console.log("✓ SMTP Connection Verified Successfully!");
    console.log("\nYou can now:");
    console.log("1. Start the server: npm run dev");
    console.log("2. Test registration with a new email");
    console.log("3. Check your email for verification link");
  }
});
