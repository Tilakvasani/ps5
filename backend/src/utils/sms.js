const twilio = require("twilio");

let client = null;

function getTwilioClient() {
  if (!client) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (accountSid && authToken) {
      client = twilio(accountSid, authToken);
    }
  }
  return client;
}

/**
 * Sends an SMS message using Twilio
 * @param {string} to - Recipient phone number (e.g., 9876543210 or +919876543210)
 * @param {string} body - Message body
 * @returns {Promise<any>} - Twilio message response or simulated response
 */
async function sendSMS(to, body) {
  let formattedTo = to.trim();

  // Format international number (default to +91 if length is 10)
  if (!formattedTo.startsWith("+")) {
    if (formattedTo.length === 10) {
      formattedTo = `+91${formattedTo}`;
    } else {
      formattedTo = `+${formattedTo}`;
    }
  }

  const twilioClient = getTwilioClient();

  if (twilioClient) {
    // Send real SMS via Twilio
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;
    if (!fromNumber) {
      console.error("❌ TWILIO_PHONE_NUMBER env variable is not set");
      throw new Error("SMS sender number not configured");
    }
    const message = await twilioClient.messages.create({
      body,
      from: fromNumber,
      to: formattedTo,
    });
    console.log(`✅ SMS sent via Twilio to ${formattedTo} | SID: ${message.sid}`);
    return message;
  } else {
    // No credentials — log to console (dev/test fallback)
    console.log(`\n📢 [SMS Fallback] No Twilio credentials. SMS to ${formattedTo}: "${body}"\n`);
    return { sid: "no-credentials", status: "logged-only" };
  }
}

module.exports = {
  sendSMS
};
