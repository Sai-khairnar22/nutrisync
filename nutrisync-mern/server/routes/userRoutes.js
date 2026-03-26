import express from "express";
import User from "../models/User.js";

const router = express.Router();

// POST /api/user/onboard - Create or update user
router.post("/onboard", async (req, res) => {
  const { name, email, age, weight, height, gender, bmi } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Name and Email are required" });
  }

  try {
    const user = await User.findOneAndUpdate(
      { email },
      { name, email, age, weight, height, gender, bmi },
      { upsert: true, new: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    console.error("Onboard error:", error);
    res.status(500).json({ error: "Failed to save user data" });
  }
});

// GET /api/user/profile?email=...
router.get("/profile", async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "Email required" });

  try {
    const user = await User.findOne({ email });
    res.json(user || null);
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

export default router;
