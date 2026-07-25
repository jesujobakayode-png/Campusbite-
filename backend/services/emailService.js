import "../config/env.js";

const disabledEmailMessage = "Email delivery is temporarily disabled";

const sendEmail = async ({ email }) => {
  console.log(`[Email] ${disabledEmailMessage} for ${email}`);
  return {
    messageId: "disabled",
    accepted: [email],
  };
};

export const sendVerificationEmail = async (email, name, token) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const verificationLink = `${frontendUrl}/verify-email/${token}`;

  await sendEmail({
    email,
    name,
    subject: "Verify your CartHub account",
    htmlContent: `
      <div style="font-family:Arial;padding:30px">
        <h1 style="color:#facc15">Welcome to CartHub</h1>
        <p>Hello ${name},</p>
        <p>Click below to verify your email.</p>
        <a
          href="${verificationLink}"
          style="
            background:#facc15;
            color:black;
            padding:14px 22px;
            border-radius:8px;
            text-decoration:none;
            display:inline-block;
            font-weight:bold;
          "
        >
          Verify Email
        </a>
      </div>
    `,
  });
};

export const sendWelcomeEmail = async (email, name) => {
  await sendEmail({
    email,
    name,
    subject: "Welcome to CartHub 🎉",
    htmlContent: `
      <div style="font-family:Arial;padding:30px">
        <h1 style="color:#facc15">Welcome, ${name}!</h1>
        <p>Your account has been successfully verified.</p>
        <p>You can now start buying and selling on CartHub.</p>
      </div>
    `,
  });
};

export const sendOrderConfirmationEmail = async (email, name, order) => {
  const itemsHTML = (order.items || [])
    .map(
      (item) => `
      <tr>
        <td style="padding:10px">${item.name || "Item"}</td>
        <td style="padding:10px">${item.quantity || 1}</td>
        <td style="padding:10px">₦${Number(item.price || 0).toLocaleString()}</td>
      </tr>
    `
    )
    .join("");

  const orderNumber = order._id?.toString().slice(-6).toUpperCase() || "N/A";

  await sendEmail({
    email,
    name,
    subject: `Order Confirmed - ${orderNumber}`,
    htmlContent: `
      <div style="font-family:Arial;padding:40px;background:#fafafa">
        <h1 style="color:#f59e0b">🛒 Thank you for your order!</h1>
        <p>Hello <b>${name}</b>,</p>
        <p>Your order has been received successfully.</p>
        <table style="width:100%;border-collapse:collapse;margin-top:20px;background:white;">
          <tr style="background:#facc15">
            <th style="padding:10px;text-align:left">Item</th>
            <th style="padding:10px;text-align:left">Qty</th>
            <th style="padding:10px;text-align:left">Price</th>
          </tr>
          ${itemsHTML}
        </table>
        <h2 style="margin-top:30px">Total: ₦${Number(order.totalPrice || 0).toLocaleString()}</h2>
        <p>We will notify you when your vendor starts preparing it.</p>
      </div>
    `,
  });
};

export const sendNewOrderAlertEmail = async (email, name, order, vendorName) => {
  const itemsHTML = (order.items || [])
    .map((item) => `
      <tr>
        <td style="padding:10px">${item.name || "Item"}</td>
        <td style="padding:10px">${item.quantity || 1}</td>
        <td style="padding:10px">₦${Number(item.price || 0).toLocaleString()}</td>
      </tr>
    `)
    .join("");

  const orderNumber = order._id?.toString().slice(-6).toUpperCase() || "N/A";

  await sendEmail({
    email,
    name,
    subject: `New order received - ${orderNumber}`,
    htmlContent: `
      <div style="font-family:Arial;padding:40px;background:#fafafa">
        <h1 style="color:#f59e0b">📦 New order received</h1>
        <p>Hello <b>${name}</b>,</p>
        <p>You have a new order for ${vendorName || "your store"}.</p>
        <table style="width:100%;border-collapse:collapse;margin-top:20px;background:white;">
          <tr style="background:#facc15">
            <th style="padding:10px;text-align:left">Item</th>
            <th style="padding:10px;text-align:left">Qty</th>
            <th style="padding:10px;text-align:left">Price</th>
          </tr>
          ${itemsHTML}
        </table>
        <h2 style="margin-top:30px">Total: ₦${Number(order.totalPrice || 0).toLocaleString()}</h2>
        <p>Please update the order status once you begin processing it.</p>
      </div>
    `,
  });
};

export const sendOrderStatusUpdateEmail = async (email, name, order, status) => {
  const orderNumber = order._id?.toString().slice(-6).toUpperCase() || "N/A";

  await sendEmail({
    email,
    name,
    subject: `Order status updated - ${orderNumber}`,
    htmlContent: `
      <div style="font-family:Arial;padding:40px;background:#fafafa">
        <h1 style="color:#f59e0b">🚚 Your order status has changed</h1>
        <p>Hello <b>${name}</b>,</p>
        <p>Your order status is now <b>${status}</b>.</p>
        <p>Order ID: ${orderNumber}</p>
        <p>Thank you for shopping with CartHub.</p>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async (email, name, token) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetLink = `${frontendUrl}/reset-password?token=${token}`;

  await sendEmail({
    email,
    name,
    subject: "Reset your CartHub password",
    htmlContent: `
      <div style="font-family:Arial;padding:30px">
        <h1 style="color:#facc15">Reset your password</h1>
        <p>Hello ${name},</p>
        <p>We received a request to reset your CartHub password.</p>
        <a href="${resetLink}" style="background:#facc15;color:black;padding:14px 22px;border-radius:8px;text-decoration:none;display:inline-block;font-weight:bold;">Reset Password</a>
        <p style="margin-top:16px">If you did not request this, you can safely ignore this email.</p>
      </div>
    `,
  });
};

export const sendReceiptEmail = async (email, name, order) => {
  const orderNumber = order._id?.toString().slice(-6).toUpperCase() || "N/A";

  await sendEmail({
    email,
    name,
    subject: `Receipt for order ${orderNumber}`,
    htmlContent: `
      <div style="font-family:Arial;padding:40px;background:#fafafa">
        <h1 style="color:#f59e0b">💳 Payment received</h1>
        <p>Hello <b>${name}</b>,</p>
        <p>Your payment for order ${orderNumber} was successful.</p>
        <p>Total paid: <b>₦${Number(order.totalPrice || 0).toLocaleString()}</b></p>
        <p>Thank you for shopping with CartHub.</p>
      </div>
    `,
  });
};