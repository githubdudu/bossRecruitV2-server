/**
 * Tests for ChatModel
 *
 */
import mongoose from "mongoose";
import { beforeAll, afterAll, describe, expect, it, beforeEach, afterEach } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { ChatModel } from "#db/models/ChatModel.js";

let mongoServer;

describe("ChatModel Tests", () => {
  const chatData = {
    from: "user1",
    to: "user2",
    chatID: "chat123",
    message: "Hello, how are you?",
    isRead: false
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
      // Clear the Chat collection after each test
      await ChatModel.deleteMany({});
    });

    it("should create a chat message with all required fields", async () => {
      const chat = new ChatModel(chatData);
      await chat.save();

      expect(chat.from).toBe("user1");
      expect(chat.to).toBe("user2");
      expect(chat.chatID).toBe("chat123");
      expect(chat.message).toBe("Hello, how are you?");
      expect(chat.isRead).toBe(false);
    });

    Object.keys(chatData)
      .filter((field) => field !== "isRead") // Filter out "isRead" explicitly
      .forEach((field) => {
        it(`should not create a chat without the ${field} field`, async () => {
          const invalidChatData = { ...chatData };
          delete invalidChatData[field];
          
          const chat = new ChatModel(invalidChatData);
          await expect(chat.save()).rejects.toThrow();
        });
      });
    
    it("should create a chat with isRead set to true", async () => {
      const chat = new ChatModel({ ...chatData, isRead: true });
      await chat.save();
      
      expect(chat.isRead).toBe(true);
    });
    
    it("should default isRead to false if not provided", async () => {
      const chatWithoutIsRead = { ...chatData };
      delete chatWithoutIsRead.isRead;
      
      const chat = new ChatModel(chatWithoutIsRead);
      await chat.save();
      
      expect(chat.isRead).toBe(false);
    });

    // Strict=true schema option ensures that only defined fields in the schema are saved
    it("should create a chat with an invalid property filtered out", async () => {
      const invalidChatData = { ...chatData, invalidProperty: "invalidValue" };
      const chat = new ChatModel(invalidChatData);

      await chat.save();
      expect(chat.invalidProperty).toBeUndefined();
    });
  });

  describe("update", () => {
    let chat;
    const updatedChatData = {
      from: "updatedUser1",
      to: "updatedUser2",
      chatID: "updatedChat123",
      message: "Updated message content",
      isRead: true
    };
    
    beforeEach(async () => {
      // Create a chat before each test
      chat = new ChatModel(chatData);
      await chat.save();
    });
    
    afterEach(async () => {
      // Clear the Chat collection after each test
      await ChatModel.deleteMany({});
    });

    Object.keys(chatData).forEach((field) => {
      it(`should update a chat's ${field} field`, async () => {
        chat[field] = updatedChatData[field];
        await chat.save();

        expect(chat[field]).toStrictEqual(updatedChatData[field]);
      });
    });
  });
  
  describe("timestamps", () => {
    let chat;
    beforeEach(async () => {
      chat = new ChatModel(chatData);
      await chat.save();
    });
    
    it("should have createdAt field and updatedAt field", async () => {
      expect(chat.createdAt).toBeDefined();
      expect(chat.createdAt).toBeInstanceOf(Date);
      expect(chat.updatedAt).toBeDefined();
      expect(chat.updatedAt).toBeInstanceOf(Date);
    });
    
    it("should update updatedAt field on update", async () => {
      const originalUpdatedAt = chat.updatedAt;
      chat.message = "Updated message";
      await new Promise((resolve) => setTimeout(resolve, 10)); // Add a brief delay
      await chat.save();

      expect(chat.updatedAt).toBeDefined();
      expect(chat.updatedAt).toBeInstanceOf(Date);
      expect(chat.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
});
