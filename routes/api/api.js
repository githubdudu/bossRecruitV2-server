import express from "express";
import { NameModel } from "../../db/schema.js";

const router = express.Router();

//TODO: implement child routes
router.get("/names", async (req, res) => {
  const names = await NameModel.find({});
  res.status(200).json(names);
});

export default router;
