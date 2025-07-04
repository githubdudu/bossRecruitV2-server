import mongoose from "mongoose";
import { MessageModel } from "./MessageModel.js";

const conversationSchema = mongoose.Schema(
  {
    _id: {
      type: String,
    },
    participants: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "Participant array cannot be empty.",
      },
    },
  },
  { timestamps: true },
);

// This index is designed to make queries that find conversations by participant fast.
conversationSchema.index({ participants: 1 });

// Add a pre-save hook to sort the participants array
// This ensures the array is always stored in a canonical order, which is essential for the unique index to work correctly.
conversationSchema.pre("save", function (next) {
  if (this.participants) {
    this.participants.sort();
    this._id = this._id ? this._id : this.participants.join("_");
  }
  next();
});

class ConversationClass {
  static async findConversationsWithLatestMessagesByUserId(userId) {
    // Use a single aggregation pipeline starting from the Conversation collection
    const result = await this.aggregate([
      // 1. Match conversations where the user is a participant
      { $match: { participants: new mongoose.Types.ObjectId(userId) } },

      // 2. Lookup messages for each conversation
      {
        $lookup: {
          from: "messages", // The MongoDB collection name for messages
          localField: "_id",
          foreignField: "conversationId",
          as: "messages",
        },
      },

      // 3. Unwind the messages array to work with individual messages
      { $unwind: { path: "$messages", preserveNullAndEmptyArrays: true } },

      // 4. Sort messages by timestamp (descending) for each conversation
      { $sort: { conversationId: 1, "messages.createdAt": -1 } },

      // 5. Group back by conversation to get only the first (latest) message for each
      {
        $group: {
          _id: "$_id",
          latestMessage: { $first: "$messages" },
        },
      },

      // 6. Project to clean up and include only needed fields
      {
        $project: {
          _id: 1,
          participants: 1,
          latestMessage: {
            _id: 1,
            conversationId: 1,
            text: 1,
            isRead: 1,
            updatedAt: 1,
            createdAt: 1,
            senderId: 1,
          },
        },
      },

      // 7. Sort the final results by the latest message timestamp
      { $sort: { "latestMessage.createdAt": -1 } },
    ]);

    return result;
  }
}
conversationSchema.loadClass(ConversationClass);

const ConversationModel = mongoose.model("Conversation", conversationSchema);

export { conversationSchema, ConversationModel };
