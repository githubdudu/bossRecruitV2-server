/**
 * Tests for ConversationModel
 */
import mongoose from "mongoose";
import { beforeAll, afterAll, describe, expect, it, afterEach } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { ConversationModel } from "#db/models/ConversationModel.js";

let mongoServer;

describe("ConversationModel Tests", () => {
  const participant1 = new mongoose.Types.ObjectId();
  const participant2 = new mongoose.Types.ObjectId();

  const conversationData = {
    participants: [participant1, participant2],
  };

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await ConversationModel.deleteMany({});
  });

  describe("creation", () => {
    it("should create a conversation with all required fields", async () => {
      const conversation = new ConversationModel(conversationData);
      await conversation.save();

      expect(conversation.participants).toHaveLength(2);
      expect(conversation.participants).toContainEqual(participant1);
      expect(conversation.participants).toContainEqual(participant2);

      const participant3 = new mongoose.Types.ObjectId();
      const conversation2 = new ConversationModel({ participants: [participant1, participant3] });
      await conversation2.save();
      expect(conversation2.participants).toHaveLength(2);
      expect(conversation2.participants).toContainEqual(participant1);
      expect(conversation2.participants).toContainEqual(participant3);
    });

    it("should not create a conversation without the participant field", async () => {
      const conversation = new ConversationModel({});
      await expect(conversation.save()).rejects.toThrow();
    });

    it("should not create a conversation with an empty participant array", async () => {
      const conversation = new ConversationModel({ participant: [] });
      await expect(conversation.save()).rejects.toThrow();
    });
  });

  describe("indexes", () => {
    it("should enforce a unique constraint on the participant array", async () => {
      // Create the first conversation
      const conversation1 = new ConversationModel({
        participants: [participant1, participant2],
      });
      await conversation1.save();

      // Attempt to create a second conversation with the same participants (order swapped)
      const conversation2 = new ConversationModel({
        participants: [participant2, participant1],
      });

      // MongoDB treats arrays as sets for indexing, so order doesn't matter
      await expect(conversation2.save()).rejects.toThrow(/E11000 duplicate key error/);
    });
  });

  describe("timestamps", () => {
    it("should have createdAt and updatedAt fields", async () => {
      const conversation = new ConversationModel(conversationData);
      await conversation.save();

      expect(conversation.createdAt).toBeDefined();
      expect(conversation.createdAt).toBeInstanceOf(Date);
      expect(conversation.updatedAt).toBeDefined();
      expect(conversation.updatedAt).toBeInstanceOf(Date);
    });

    it("should update updatedAt field on update", async () => {
      const conversation = new ConversationModel(conversationData);
      await conversation.save();
      const originalCreatedAt = conversation.createdAt;
      const originalUpdatedAt = conversation.updatedAt;

      // Add a brief delay to ensure the timestamp changes
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Mongoose updates `updatedAt` on `save` even if no fields changed
      conversation.markModified("participant"); // Marking as modified to be explicit
      await conversation.save();

      expect(conversation.createdAt).toEqual(originalCreatedAt);
      expect(conversation.updatedAt).toBeDefined();
      expect(conversation.updatedAt).toBeInstanceOf(Date);
      expect(conversation.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
});
