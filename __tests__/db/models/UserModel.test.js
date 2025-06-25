/**
 * Tests for UserModel
 *
 */
import mongoose from "mongoose";
import { beforeAll, afterAll, describe, expect, it, beforeEach, afterEach } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { UserModel, userSchema } from "#db/models/UserModel.js";

let mongoServer;

describe("UserModel Tests", () => {
  const userData = {
    userName: "testuser",
    userPassword: "testpassword",
    userType: "applicant"
  };
  const userDataOptionalFields = {
    avatar: "http://example.com/avatar.png",
    jobPosition: "Software Engineer",
    description: "A passionate software engineer",
    company: "Tech Company",
    expectSalary: "987654321",
    email: "testuser@example.com",
    phone: "1234567890",
    address: "123 Test St, Test City",
    skills: ["JavaScript", "Node.js"],
    education: ["Bachelor's in Computer Science"],
    experience: ["2 years at Tech Company"]
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
      // Clear the User collection after each test
      await UserModel.deleteMany({});
    });
    it("should create a user with only required fields", async () => {
      const user = new UserModel(userData);
      await user.save();

      expect(user.userName).toBe("testuser");
      expect(user.userType).toBe("applicant");
      expect(user.userPassword).toBe("testpassword");
    });

    Object.keys(userData).forEach((field) => {
      it(`should not create a user without the ${field} field`, async () => {
        const invalidUserData = { ...userData };
        delete invalidUserData[field];
        const user = new UserModel(invalidUserData);

        await expect(user.save()).rejects.toThrow();
      });
    });

    it("should create a user with all optional fields", async () => {
      const user = new UserModel({ ...userData, ...userDataOptionalFields });
      await user.save();

      Object.keys(userData).forEach((field) => {
        expect(user[field]).toBe(userData[field]);
      });
      Object.keys(userDataOptionalFields).forEach((field) => {
        expect(user[field]).toStrictEqual(userDataOptionalFields[field]);
      });
    });

    Object.keys(userDataOptionalFields).forEach((field) => {
      it(`should create a user with any optional field: ${field}`, async () => {
        const user = new UserModel({ ...userData, [field]: userDataOptionalFields[field] });
        await user.save();

        expect(user[field]).toStrictEqual(userDataOptionalFields[field]);
      });
    });

    it("should not create a user with an invalid userType", async () => {
      const invalidUserData = { ...userData, userType: "invalidType" };
      const user = new UserModel(invalidUserData);

      await expect(user.save()).rejects.toThrow();
    });


    // Strict=true schema option ensures that only defined fields in the schema are saved
    it("should create a user with an invalid property filtered out", async () => {
      const invalidUserData = { ...userData, invalidProperty: "invalidValue" };
      const user = new UserModel(invalidUserData);

      await user.save();
      expect(user.invalidProperty).toBeUndefined();
    });
  });

  describe("update", () => {
    let user;
    const updatedUserData = {
      userName: "updatedUser",
      userPassword: "updatedPassword",
      userType: "recruiter"
    };
    const updatedUserDataOptionalFields = {
      avatar: "http://example.com/updated_avatar.png",
      jobPosition: "updated Software Engineer",
      description: "An updated passionate software engineer",
      company: "Updated Tech Company",
      expectSalary: "updated_987654321",
      email: "updated_testuser@example.com",
      phone: "0987654321",
      address: "456 Updated St, Updated City",
      skills: ["updated JavaScript", "updated Node.js"],
      education: ["updated Bachelor's in Computer Science"],
      experience: ["3 years at Updated Tech Company"]
    };
    
    beforeEach(async () => {
      // Create a user before each test
      user = new UserModel({ ...userData, ...userDataOptionalFields });
      await user.save();
    });
    
    afterEach(async () => {
      // Clear the User collection after each test
      await UserModel.deleteMany({});
    });

    Object.keys(userData).forEach((field) => {
      it(`should update a user's ${field} field`, async () => {
        user[field] = updatedUserData[field];
        await user.save();

        expect(user[field]).toStrictEqual(updatedUserData[field]);
      });
    });

    Object.keys(userDataOptionalFields).forEach((field) => {
      it(`should update a user's optional field: ${field}`, async () => {
        user[field] = updatedUserDataOptionalFields[field];
        await user.save();

        expect(user[field]).toStrictEqual(updatedUserDataOptionalFields[field]);
      });
    });
  });
});
