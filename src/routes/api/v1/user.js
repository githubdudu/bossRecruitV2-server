import express from "express";
import yup from "yup";
import bcrypt from "bcrypt";

import { UserModel } from "#db/models/UserModel.js";
import authCookie from "#middleware/authCookie.js";

const router = express.Router();

/**
 *  Get all users
 */
router.get("/", authCookie, async (req, res) => {
  try {
    const { usertype } = req.query;
    const users = await UserModel.findByUserType(usertype);

    return res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ message: "Failed to fetch users" });
  }
});

/**
 *  User schema validation
 */
const userYupSchema = yup.object({
  userName: yup
    .string()
    .trim()
    .min(6, "Username should be at least 6 characters")
    .max(30, "Username should not exceed 30 characters")
    .lowercase()
    .required("Username is required"),
  userPassword: yup
    .string()
    .trim()
    .min(6, "Password should be at least 6 characters")
    .max(64, "Password should not exceed 64 characters")
    .required("Password is required"),
  userType: yup
    .string()
    .trim()
    .lowercase()
    .oneOf(["recruiter", "applicant"], "User type must be either recruiter or applicant")
    .required("User type is required"),
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

/**
 * Create a new user
 */
router.post("/", async (req, res) => {
  try {
    // Validate request body against schema
    const userData = await userYupSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    // Create and save new user
    const salt = await bcrypt.genSalt(10);
    userData.userPassword = await bcrypt.hash(userData.userPassword, salt);

    await UserModel.createUser(userData);

    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    // Handle validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Data Validation failed",
        errors: error.errors || error.message,
      });
    }

    // Handle MongoDB duplicate key errors (including unique userName constraint)
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Username already exists",
        field: Object.keys(error.keyPattern)[0],
      });
    }

    // Handle other errors
    console.error("Error creating user:", error);
    return res.status(500).json({ message: "Failed to create user" });
  }
});

/**
 * users/me sub-routes
 */
import meRouter from "./me.js";
router.use("/me", meRouter);

export default router;
