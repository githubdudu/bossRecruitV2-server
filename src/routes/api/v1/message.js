import express from "express";

const router = express.Router();

router.get("/", async (req, res) => {
  return res.json({ message: "List of all messages" });
});

router.get("/:conversationId", async (req, res) => {
  const { conversationId } = req.params;
  return res.json({ message: `Messages for conversation ${conversationId}` });
});

router.patch("/", async (req, res) => {
  return res.json({ message: `Messages updated successfully` });
});

router.patch("/:conversationId", async (req, res) => {
  const { conversationId } = req.params;
  return res.json({ message: `Messages for conversation ${conversationId} updated successfully` });
});

export default router;
