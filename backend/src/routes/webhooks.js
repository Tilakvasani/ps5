const router = require("express").Router();

/**
 * WhatsApp Cloud API Webhooks Handler
 * =====================================
 * GET  /api/webhooks/whatsapp — Meta challenge verification
 * POST /api/webhooks/whatsapp — Message status & inbound message events
 */

// ── GET: Webhook Verification ────────────────────────────────────────────────
router.get("/whatsapp", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "zupwell_whatsapp_verify_token_2026";

  if (mode && token) {
    if (mode === "subscribe" && token === verifyToken) {
      console.log("✅ [WhatsApp Webhook] Verified successfully by Meta!");
      return res.status(200).send(challenge);
    } else {
      console.error("❌ [WhatsApp Webhook] Verification failed — token mismatch.");
      return res.sendStatus(403);
    }
  }

  res.sendStatus(400);
});

// ── POST: Webhook Notification Handler ────────────────────────────────────────
router.post("/whatsapp", (req, res) => {
  try {
    const body = req.body;

    if (body.object === "whatsapp_business_account") {
      body.entry?.forEach((entry) => {
        entry.changes?.forEach((change) => {
          const value = change.value;
          if (value?.messages) {
            const message = value.messages[0];
            const from = message.from;
            const text = message.text?.body || message.type;
            console.log(`📩 [WhatsApp Webhook Inbound] From +${from}: "${text}"`);
          }

          if (value?.statuses) {
            const status = value.statuses[0];
            console.log(`📊 [WhatsApp Webhook Status] Message ${status.id} -> ${status.status} (recipient: +${status.recipient_id})`);
          }
        });
      });

      // Always return 200 OK to Meta to acknowledge event receipt
      return res.status(200).send("EVENT_RECEIVED");
    }

    res.sendStatus(404);
  } catch (error) {
    console.error("⚠️ [WhatsApp Webhook Error]:", error.message);
    res.status(200).send("EVENT_RECEIVED");
  }
});

module.exports = router;
