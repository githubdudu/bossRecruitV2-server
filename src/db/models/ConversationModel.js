import mongoose from "mongoose";

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

const ConversationModel = mongoose.model("Conversation", conversationSchema);

export { conversationSchema, ConversationModel };
