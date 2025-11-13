import "dotenv/config";
import express from "express";
import { Webhook } from "svix";
import { getOrCreateUser } from "../services/userService.js";
import { clerkClient } from '@clerk/clerk-sdk-node';

const router = express.Router();
const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

router.post("/clerk", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    const headers = req.headers;
    const body = req.body;

    console.log("📥 Clerk webhook called!");

    const wh = new Webhook(webhookSecret);
    const evt = wh.verify(body, {
      "svix-id": headers["svix-id"],
      "svix-timestamp": headers["svix-timestamp"],
      "svix-signature": headers["svix-signature"],
    });

    console.log("📥 Webhook event:", evt.type);

    if (evt.type === "user.created" || evt.type === "user.updated") {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;

      const email = email_addresses?.[0]?.email_address;
      if (!email) {
        console.error("❌ Webhook: No email address found for user", id);
        return res.status(400).json({ error: "No email address in webhook data" });
      }

      
      await getOrCreateUser(
        id,
        email,
        `${first_name || ""} ${last_name || ""}`.trim(),
        image_url
      );

    
      try {
        await clerkClient.users.updateUserMetadata(id, {
          publicMetadata: {
            plan: 'free_user'  
          }
        });
        console.log("✅ User webhook processed and plan set to 'free_user'");
      } catch (metadataError) {
        console.error("⚠️ Failed to set metadata:", metadataError.message);
      }
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return res.status(400).json({ error: error.message });
  }
});

export default router;
