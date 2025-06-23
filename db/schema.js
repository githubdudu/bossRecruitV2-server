import { Schema, model } from "mongoose";

const nameSchema = new Schema({ name: String });
const NameModel = model("Name", nameSchema);

export { NameModel };
