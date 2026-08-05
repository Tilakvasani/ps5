const axios = require("axios");

/**
 * WhatsApp Cloud API v23.0 Utility
 * =================================
 * Official integration for sending WhatsApp messages & templates via Meta Graph API.
 * API Endpoint: https://graph.facebook.com/v23.0/<PHONE_NUMBER_ID>/messages
 */

function cleanPhoneNumber(phone) {
  let cleaned = String(phone || "").replace(/\D/g, "");
  if (cleaned.length === 10) {
    cleaned = `91${cleaned}`;
  }
  return cleaned;
}

/**
 * sendWhatsAppText
 * Sends a standard text message over WhatsApp.
 * (Requires an active 24-hour customer service window or test recipient)
 */
async function sendWhatsAppText(to, textBody) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const recipient = cleanPhoneNumber(to);

  if (!token || !phoneNumberId || token.startsWith("your-")) {
    console.log(`\n📢 [WhatsApp Cloud API Fallback] To: +${recipient} | Message: "${textBody}"\n`);
    return { status: "simulated", recipient };
  }

  const url = `https://graph.facebook.com/v23.0/${phoneNumberId}/messages`;
  try {
    const response = await axios.post(
      url,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: recipient,
        type: "text",
        text: { body: textBody },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(`✅ [WhatsApp Cloud API] Text message sent to +${recipient} | ID: ${response.data?.messages?.[0]?.id}`);
    return response.data;
  } catch (error) {
    const errMsg = error?.response?.data?.error?.message || error.message || "Failed to send WhatsApp message";
    console.error("⚠️ [WhatsApp Cloud API Error]:", errMsg);
    return { status: "failed", error: errMsg };
  }
}

/**
 * sendWhatsAppTemplate
 * Sends a pre-approved Meta WhatsApp template message (e.g., hello_world or custom OTP template).
 */
async function sendWhatsAppTemplate(to, templateName = "hello_world", languageCode = "en_US", components = []) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const recipient = cleanPhoneNumber(to);

  if (!token || !phoneNumberId || token.startsWith("your-")) {
    console.log(`\n📢 [WhatsApp Template Fallback] To: +${recipient} | Template: "${templateName}" (${languageCode})\n`);
    return { status: "simulated", recipient, templateName };
  }

  const url = `https://graph.facebook.com/v23.0/${phoneNumberId}/messages`;
  try {
    const payload = {
      messaging_product: "whatsapp",
      to: recipient,
      type: "template",
      template: {
        name: templateName,
        language: { code: languageCode },
      },
    };

    if (components && components.length > 0) {
      payload.template.components = components;
    }

    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log(`✅ [WhatsApp Cloud API] Template '${templateName}' sent to +${recipient} | ID: ${response.data?.messages?.[0]?.id}`);
    return response.data;
  } catch (error) {
    const errMsg = error?.response?.data?.error?.message || error.message || "Failed to send WhatsApp template";
    console.error("⚠️ [WhatsApp Template Error]:", errMsg);
    return { status: "failed", error: errMsg };
  }
}

/**
 * sendWhatsAppOtp
 * Helper to send a 6-digit OTP verification code over WhatsApp.
 * Tries template message if WHATSAPP_OTP_TEMPLATE is configured, otherwise sends direct text message.
 */
async function sendWhatsAppOtp(to, otpCode) {
  const recipient = cleanPhoneNumber(to);
  console.log(`\n=======================================================`);
  console.log(`🔑 [RENDER SERVER LOG] OTP FOR +${recipient}: ===> ${otpCode} <===`);
  console.log(`=======================================================\n`);

  const templateName = process.env.WHATSAPP_OTP_TEMPLATE;
  const body = `🔒 Your Zupwell verification code is: ${otpCode}\n\nValid for 10 minutes. Do not share this code with anyone.`;

  if (templateName) {
    const components = [
      {
        type: "body",
        parameters: [{ type: "text", text: String(otpCode) }],
      },
    ];
    try {
      const templateRes = await sendWhatsAppTemplate(to, templateName, "en", components);
      if (templateRes?.status !== "failed") return templateRes;
    } catch {}
  }

  // Send direct OTP text message into open WhatsApp conversation window
  return await sendWhatsAppText(to, body);
}

module.exports = {
  cleanPhoneNumber,
  sendWhatsAppText,
  sendWhatsAppTemplate,
  sendWhatsAppOtp,
};
