import mongoose from "mongoose";

const chatSchema = mongoose.Schema(
  {
    from: { type: String, required: true },
    to: { type: String, required: true },
    chatID: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, required: true, default: false }
  },
  { timestamps: true }
);
const ChatModel = mongoose.model("Chat", chatSchema);

export { chatSchema, ChatModel };
