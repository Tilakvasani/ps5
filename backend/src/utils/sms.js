const axios = require("axios");

/**
 * Sends an SMS message using Google Firebase Identity Toolkit (10,000 free SMS/month)
 * or Twilio / console fallback.
 * 
 * Uses GOOGLE_MAPS_API_KEY / FIREBASE_API_KEY (same Google Cloud API key).
 * 
 * @param {string} to - Recipient phone number (e.g., 9876543210 or +919876543210)
 * @param {string} body - Message body containing OTP code
 * @returns {Promise<any>} - SMS response
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

  const googleApiKey = process.env.FIREBASE_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

  if (googleApiKey && !googleApiKey.startsWith("your-")) {
    try {
      // Send SMS via Google Firebase Identity Toolkit API
      const res = await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode?key=${googleApiKey}`,
        { phoneNumber: formattedTo },
        { headers: { "Content-Type": "application/json" } }
      );
      console.log(`✅ SMS sent via Google Firebase to ${formattedTo} | Session: ${res.data?.sessionInfo || "ok"}`);
      return res.data;
    } catch (err) {
      const errMsg = err.response?.data?.error?.message || err.message;
      console.log(`\n📢 [Google SMS / Local Fallback] SMS to ${formattedTo}: "${body}" (Notice: ${errMsg})\n`);
      return { status: "fallback", message: body };
    }
  } else {
    // Development / Test fallback logging
    console.log(`\n📢 [SMS Fallback] No Google API key configured. SMS to ${formattedTo}: "${body}"\n`);
    return { status: "logged-only", message: body };
  }
}

module.exports = {
  sendSMS
};
