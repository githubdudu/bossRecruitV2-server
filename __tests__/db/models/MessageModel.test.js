/**
 * Tests for MessageModel
 *
 */
import mongoose from "mongoose";
import { beforeAll, afterAll, describe, expect, it, beforeEach, afterEach } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MessageModel } from "#db/models/MessageModel.js";

let mongoServer;

describe("MessageModel Tests", () => {
  const senderId = new mongoose.Types.ObjectId();
  const messageData = {
    senderId,
    conversationId: "conversationId123",
    text: "Hello, how are you?",
    isRead: false,
  };

  beforeAll(async () => {
    // Create a new MongoDB Memory Server
    mongoServer = await MongoMemoryServer.create();
    // Get the connection string for the in-memory MongoDB instance
    const uri = mongoServer.getUri();
    // Connect Mongoose to the MongoDB Memory Server
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    // Clean up by disconnecting Mongoose and stopping the Memory Server
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe("creation", () => {
    afterEach(async () => {
      // Clear the Message collection after each test
      await MessageModel.deleteMany({});
    });

    it("should create a message with all required fields", async () => {
      const message = new MessageModel(messageData);
      await message.save();

      expect(message.senderId).to.equal(senderId);
      expect(message.conversationId).to.equal("conversationId123");
      expect(message.text).toBe("Hello, how are you?");
      expect(message.isRead).toBe(false);
    });

    Object.keys(messageData)
      .filter((field) => field !== "isRead") // Filter out "isRead" explicitly
      .forEach((field) => {
        it(`should not create a message without the ${field} field`, async () => {
          const invalidMessageData = { ...messageData };
          delete invalidMessageData[field];

          const message = new MessageModel(invalidMessageData);
          await expect(message.save()).rejects.toThrow();
        });
      });

    it("should create a message with isRead set to true", async () => {
      const message = new MessageModel({ ...messageData, isRead: true });
      await message.save();

      expect(message.isRead).toBe(true);
    });

    it("should default isRead to false if not provided", async () => {
      const messageWithoutIsRead = { ...messageData };
      delete messageWithoutIsRead.isRead;

      const message = new MessageModel(messageWithoutIsRead);
      await message.save();

      expect(message.isRead).toBe(false);
    });

    // Strict=true schema option ensures that only defined fields in the schema are saved
    it("should create a message with an invalid property filtered out", async () => {
      const invalidMessageData = { ...messageData, invalidProperty: "invalidValue" };
      const message = new MessageModel(invalidMessageData);

      await message.save();
      expect(message.invalidProperty).toBeUndefined();
    });
  });

  describe("update", () => {
    let message;
    const updatedMessageData = {
      senderId: new mongoose.Types.ObjectId(),
      conversationId: "conversationId456",
      text: "Updated message content",
      isRead: true,
    };

    beforeEach(async () => {
      // Create a message before each test
      message = new MessageModel(messageData);
      await message.save();
    });

    afterEach(async () => {
      // Clear the Message collection after each test
      await MessageModel.deleteMany({});
    });

    Object.keys(messageData).forEach((field) => {
      it(`should update a message's ${field} field`, async () => {
        message[field] = updatedMessageData[field];
        await message.save();

        expect(message[field]).toStrictEqual(updatedMessageData[field]);
      });
    });
  });

  describe("timestamps", () => {
    let message;
    beforeEach(async () => {
      message = new MessageModel(messageData);
      await message.save();
    });

    it("should have createdAt field and updatedAt field", async () => {
      expect(message.createdAt).toBeDefined();
      expect(message.createdAt).toBeInstanceOf(Date);
      expect(message.updatedAt).toBeDefined();
      expect(message.updatedAt).toBeInstanceOf(Date);
    });

    it("should update updatedAt field on update", async () => {
      const originalUpdatedAt = message.updatedAt;
      message.text = "Updated message";
      await new Promise((resolve) => setTimeout(resolve, 10)); // Add a brief delay
      await message.save();

      expect(message.updatedAt).toBeDefined();
      expect(message.updatedAt).toBeInstanceOf(Date);
      expect(message.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
});
