import express from "express";
import Message from "../models/Message.js";
import User from "../models/User.js";

const router = express.Router();

// Get messages between tenant and admin
router.get("/:tenantId", async (req, res) => {
  try {
    const { tenantId } = req.params;

    const admin = await User.findOne({ role: "Admin" });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    // Find conversation between this tenant and the admin
    const messages = await Message.find({
      $or: [
        { senderId: tenantId, receiverId: admin._id.toString() },
        { senderId: admin._id.toString(), receiverId: tenantId },
      ],
    }).sort({ timestamp: 1 });

    // Attach tenant name only for tenant messages
    const enriched = await Promise.all(messages.map(async (msg) => {
      const plain = msg.toObject();
      if (msg.senderType === "tenant") {
        const tenant = await User.findById(msg.senderId).select("name");
        plain.senderName = tenant?.name || "Tenant";
      }
      return plain;
    }));

    res.json(enriched);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Save a new message
router.post("/", async (req, res) => {
  try {
    const { senderId, senderType, receiverId, receiverType, message } = req.body;

    const newMessage = new Message({
      senderId,
      senderType,
      receiverId,
      receiverType,
      message
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    console.error("Error saving message:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
