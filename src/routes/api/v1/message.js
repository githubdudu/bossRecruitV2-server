import express from "express";

const router = express.Router();

router.get("/", async (req, res) => {
  return res.json({ message: "List of all chats" });
});

router.patch("/", async (req, res) => {
  return res.json({ message: `Chat updated successfully` });
});

export default router;
