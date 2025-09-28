import express from "express";
import Message from "../models/Message.js";

const router = express.Router();

// Get chat history between admin and tenant
router.get("/:tenantId", async (req, res) => {
  try {
    const { tenantId } = req.params;
    const messages = await Message.find({
      $or: [
        { senderId: "admin", receiverId: tenantId },
        { senderId: tenantId, receiverId: "admin" }
      ]
    }).sort({ timestamp: 1 }); // oldest → newest

    res.json(messages);
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
