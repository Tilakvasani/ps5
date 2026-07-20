const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
  if (!transporter) {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    }
  }
  return transporter;
}

/**
 * Sends an email
 * @param {object} mailOptions - Nodemailer mail options
 * @returns {Promise<any>}
 */
async function sendMail(mailOptions) {
  const mailTransporter = getTransporter();
  const from = mailOptions.from || process.env.SMTP_FROM || `"Zupwell" <${process.env.SMTP_USER || "noreply@zupwell.com"}>`;

  const finalOptions = {
    ...mailOptions,
    from,
  };

  if (!mailTransporter) {
    console.log(`\n📢 [Email Simulator - SMTP not configured] Sending Email:\n` +
      `  To: ${finalOptions.to}\n` +
      `  Subject: ${finalOptions.subject}\n` +
      `  Body: ${finalOptions.text || finalOptions.html}\n`);
    return { messageId: "simulated-email-id" };
  }

  return mailTransporter.sendMail(finalOptions);
}

async function sendOrderConfirmation(order, user) {
  if (!user.email && !order.address?.email) return;
  const html = `
    <h2>Order Confirmed!</h2>
    <p>Hi ${user.name},</p>
    <p>Your order <strong>${order.orderNumber}</strong> has been successfully confirmed.</p>
    <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
    <p><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
    <p>Thank you for shopping with Zupwell!</p>
  `;

  return sendMail({
    to: user.email || order.address?.email,
    subject: `Order Confirmed — ${order.orderNumber}`,
    html,
  });
}

async function sendPasswordReset(email, token, isAdmin = false) {
  const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/${isAdmin ? "admin/" : ""}reset-password?token=${token}`;
  const html = `
    <h2>Password Reset Request</h2>
    <p>You requested a password reset for your Zupwell ${isAdmin ? "Admin" : ""} account.</p>
    <p>Please click the link below to reset your password. This link is valid for 1 hour.</p>
    <p><a href="${resetUrl}" target="_blank" style="display:inline-block;background:#FF5C00;color:white;padding:10px 20px;text-decoration:none;border-radius:8px;font-weight:bold;">Reset Password</a></p>
    <p>If you did not request this, please ignore this email.</p>
  `;

  return sendMail({
    to: email,
    subject: `Reset Password — Zupwell`,
    html,
  });
}

module.exports = {
  sendMail,
  sendOrderConfirmation,
  sendPasswordReset,
};
