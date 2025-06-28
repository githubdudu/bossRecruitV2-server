import express from 'express';

const router = express.Router();

router.post("/login", async (req, res) => {
  return res.json({ message: "Login successful" });
});

router.post("/logout", async (req, res) => {
  return res.json({ message: "Logout successful" });
});

export default router;