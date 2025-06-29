import express from "express";
import bcrypt from "bcrypt";

import { UserModel } from "#db/models/UserModel.js";
import cookieTokenGenerator from "#utils/cookie-token.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { userName: inputUserName, userPassword: inputUserPassword } = req.body;

  // Validate user credentials
  const user = await UserModel.findOne({ userName: inputUserName });
  if (!user || !(await bcrypt.compare(inputUserPassword, user.userPassword))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = cookieTokenGenerator.sign({ userId: user._id, userName: user.userName });
  res.cookie("authToken", token, { httpOnly: true });

  return res.json({ message: "Login successful" });
});

router.post("/logout", async (req, res) => {
  res.clearCookie("authToken");
  return res.json({ message: "Logout successful" });
});

export default router;
