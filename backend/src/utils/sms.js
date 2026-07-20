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

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  // Graceful simulation check
  if (!accountSid || !authToken || !fromNumber) {
    console.log(`\n📢 [SMS Simulator - Twilio not configured] SMS to ${formattedTo}: "${body}"\n`);
    return { sid: "simulated-sid", status: "simulated" };
  }

  const twilioClient = getTwilioClient();
  if (!twilioClient) {
    throw new Error("Failed to initialize Twilio client with provided credentials.");
  }

  console.log(`Sending real SMS via Twilio to ${formattedTo} from ${fromNumber}...`);
  return twilioClient.messages.create({
    body,
    from: fromNumber,
    to: formattedTo
  });
}

module.exports = {
  sendSMS
};
