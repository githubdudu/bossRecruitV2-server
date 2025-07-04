import express from "express";

import { ConversationModel } from "#db/models/ConversationModel.js";
const router = express.Router();

router.get("/", async (req, res) => {
  const { userId } = req;
  try {
    const conversations =
      await ConversationModel.findConversationsWithLatestMessagesByUserId(userId);
    if (!conversations || conversations.length === 0) {
      return res.status(404).json({ message: "No conversations found" });
    }
    return res.json(conversations);
  } catch (error) {
    console.error("Error retrieving conversations:", error);
    return res.status(500).json({ message: "Failed to retrieve conversations" });
  }
});

export default router;
