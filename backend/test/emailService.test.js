import test from "node:test";
import assert from "node:assert/strict";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendPasswordResetEmail,
  sendReceiptEmail,
} from "../services/emailService.js";

test("email helpers do not throw when email delivery is disabled", async () => {
  await assert.doesNotReject(() => sendVerificationEmail("user@example.com", "Test User", "token"));
  await assert.doesNotReject(() => sendWelcomeEmail("user@example.com", "Test User"));
  await assert.doesNotReject(() =>
    sendOrderConfirmationEmail("user@example.com", "Test User", {
      _id: "order123",
      totalPrice: 2500,
      items: [{ name: "Book", quantity: 1, price: 2500 }],
    })
  );
  await assert.doesNotReject(() => sendPasswordResetEmail("user@example.com", "Test User", "reset-token"));
  await assert.doesNotReject(() =>
    sendReceiptEmail("user@example.com", "Test User", {
      _id: "order123",
      totalPrice: 2500,
    })
  );
});
