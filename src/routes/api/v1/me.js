import express from "express";
import yup from "yup";
import bcrypt from "bcrypt";

import authCookie from "#middleware/authCookie.js";
import attachUserId from "#middleware/attachUserId.js";
import messageRoutes from "./message.js";
import { UserModel } from "#db/models/UserModel.js";
const router = express.Router();
/**
 * Authenticate middleware for rest of the routes
 */
router.use(authCookie);
router.use(attachUserId);

// Get user own account information from cookie
router.get("/", async (req, res) => {
  const user = await UserModel.findUserById(req.userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  return res.json(user);
});

/**
 *  User schema validation
 *  userName is not allowed to be updated.
 */
const userYupSchema = yup.object({
  userPassword: yup
    .string()
    .trim()
    .min(6, "Password should be at least 6 characters")
    .max(64, "Password should not exceed 64 characters")
    .optional(),
  userType: yup
    .string()
    .trim()
    .lowercase()
    .oneOf(["recruiter", "applicant"], "User type must be either recruiter or applicant")
    .optional(),
  avatar: yup.string().trim().lowercase().optional(),
  jobPosition: yup.string().optional(),
  description: yup.string().optional(),
  company: yup.string().optional(),
  salary: yup.string().optional(),
  email: yup.string().email("Invalid email format").optional(),
  phone: yup
    .string()
    .matches(/^\d{9,11}$/, "Phone number must contain only digits and be 9-11 digits long")
    .optional(),
  address: yup.string().optional(),
  skills: yup.array().of(yup.string().trim()).optional(),
  education: yup.array().of(yup.string().trim()).optional(),
  experience: yup.array().of(yup.string().trim()).optional(),
});

// Update a user by id from cookie
router.patch("/", async (req, res) => {
  const { userId } = req;
  try {
    // Validate request body against schema
    const userData = await userYupSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    // If userPassword is provided, hash it
    if (userData.userPassword) {
      const salt = await bcrypt.genSalt(10);
      userData.userPassword = await bcrypt.hash(userData.userPassword, salt);
    }

    // Update user in the database
    const updatedUser = await UserModel.updateUserById(userId, userData);
    // Check if a user was found and updated
    if (!updatedUser) {
      return res.sendStatus(404);
    }
    return res.sendStatus(204);
  } catch (error) {
    // Handle validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Data Validation failed",
        errors: error.errors || error.message,
      });
    }

    // Handle other errors
    console.error("Error updating user:", error);
    return res.status(500).json({ message: "Failed to update user" });
  }
});

// Delete a user by id from cookie
router.delete("/", async (req, res) => {
  const { userId } = req;
  try {
    // Delete user from the database
    const deletedUser = await UserModel.deleteUserById(userId);
    // Check if a user was found and deleted
    if (!deletedUser) {
      return res.sendStatus(404);
    }
    return res.sendStatus(204);
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ message: "Failed to delete user" });
  }
});

router.use("/messages/", messageRoutes);

export default router;
