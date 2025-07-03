import mongoose from "mongoose";

const messageSchema = mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    conversationId: {
      type: String,
      ref: "Conversation",
      required: true,
    },
    text: { type: String, required: true },
    isRead: { type: Boolean, required: true, default: false },
  },
  { timestamps: true },
);
// This specific index is designed to make one type of query extremely fast: "Find all messages within a
// specific conversation, and show me the newest ones first."
messageSchema.index({ conversationId: 1, createdAt: -1 });
const MessageModel = mongoose.model("Message", messageSchema);

export { messageSchema, MessageModel };
