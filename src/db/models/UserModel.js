import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    },
    userPassword: { type: String, required: true },
    userType: {
      type: String,
      enum: { values: ["applicant", "recruiter"], message: "{VALUE} is not a valid user type" },
      required: true,
    },

    avatar: { type: String },
    jobPosition: { type: String },
    description: { type: String },
    company: { type: String },
    salary: { type: String },
    email: { type: String },
    phone: { type: String },
    address: { type: String },
    skills: { type: [String] },
    education: { type: [String] },
    experience: { type: [String] },
  },
  { timestamps: true },
);

class UserClass {
  static findByUserType(userType) {
    const query = userType ? { userType } : {};
    return this.find(query).select("-userPassword -__v").lean();
  }

  static createUser(userData) {
    return this.create(userData);
  }

  static findUserById(userId) {
    return this.findById(userId).select("-userPassword -__v").lean();
  }

  static updateUserById(userId, updateData) {
    return this.findByIdAndUpdate(userId, updateData, { new: true })
      .select("-userPassword -__v")
      .lean();
  }

  static deleteUserById(userId) {
    return this.findByIdAndDelete(userId);
  }
}

userSchema.loadClass(UserClass);
const UserModel = mongoose.model("User", userSchema);

export { userSchema, UserModel };
