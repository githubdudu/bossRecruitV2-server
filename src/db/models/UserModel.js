import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    userName: { type: String, required: true },
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
const UserModel = mongoose.model("User", userSchema);

export { userSchema, UserModel };
