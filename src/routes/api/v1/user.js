import express from 'express';
import chatRoutes from './chat.js';

const router = express.Router();


// Get all users
router.get("/", async (req, res) => {
    return res.json({ message: "List of all users" });
});

// Create a new user
router.post("/", async (req, res) => {
    return res.json({ message: "User created successfully" });
});

// Get user own account information from cookie
router.get("/me", async (req, res) => {
  return res.json({ message: "Authenticated user information" });
});


// Update a user by id from cookie
router.patch("/me", async (req, res) => {
    return res.json({ message: "User updated successfully" });
});

// Delete a user by id from cookie
router.delete("/me", async (req, res) => {
    return res.json({ message: "User deleted successfully" });
});

router.use("/me/chats/", chatRoutes);

export default router;