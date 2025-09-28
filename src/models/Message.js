import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  senderType: { type: String, enum: ["tenant", "admin"], required: true },
  receiverId: { type: String, required: true },
  receiverType: { type: String, enum: ["tenant", "admin"], required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});


export default mongoose.model("Message", messageSchema);
