import express from "express";

import { MessageModel } from "#db/models/MessageModel.js";

const router = express.Router();

// Retrieve messages for a specific conversation for the authenticated user
router.get("/:conversationId", async (req, res) => {
  const { conversationId } = req.params;
  const { userId } = req;

  const messages = await MessageModel.findMessagesByConversationId(conversationId);
  if (!messages || messages.length === 0) {
    return res.sendStatus(404);
  }
  return res.json(messages);
});

// Mark all messages in the specified conversation as "read",
// indicating that the user has viewed them.
router.patch("/:conversationId", async (req, res) => {
  const { conversationId } = req.params;
  const { userId } = req;
  try {
    await MessageModel.markMessagesAsRead(userId, conversationId);
    return res.status(204).send();
  } catch (error) {
    console.error("Error updating messages to read for conversation:", error);
    return res.status(500).json({ error: "Failed to update messages to read for conversation" });
  }
});

export default router;
