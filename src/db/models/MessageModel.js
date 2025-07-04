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

class MessageClass {
  static async findMessagesByConversationId(conversationId) {
    return this.find({ conversationId }, { __v: 0, conversationId: 0 })
      .sort({ createdAt: -1 })
      .lean(); // Newest first
  }

  static async markMessagesAsRead(userId, conversationId) {
    return this.updateMany(
      { conversationId, senderId: { $ne: userId } },
      { isRead: true },
      { new: true, runValidators: true },
    );
  }
}

messageSchema.loadClass(MessageClass);

// This specific index is designed to make one type of query extremely fast: "Find all messages within a
// specific conversation, and show me the newest ones first."
messageSchema.index({ conversationId: 1, createdAt: -1 });
const MessageModel = mongoose.model("Message", messageSchema);

export { messageSchema, MessageModel };
