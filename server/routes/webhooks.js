import "dotenv/config";
import express from "express";
import { Webhook } from "svix";
import { getOrCreateUser } from "../services/userService.js";


const router = express.Router();

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

router.post("/clerk", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    const headers = req.headers;
    const body = req.body;

    const wh = new Webhook(webhookSecret);
    const evt = wh.verify(body, {
      "svix-id": headers["svix-id"],
      "svix-timestamp": headers["svix-timestamp"],
      "svix-signature": headers["svix-signature"],
    });

    console.log("📥 Webhook event:", evt.type);

    if (evt.type === "user.created" || evt.type === "user.updated") {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;

      await getOrCreateUser(
        id,
        email_addresses[0]?.email_address,
        `${first_name || ""} ${last_name || ""}`.trim(),
        image_url
      );

      console.log("✅ User webhook processed");
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return res.status(400).json({ error: error.message });
  }
});

export default router;
