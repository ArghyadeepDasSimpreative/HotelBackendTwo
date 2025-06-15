import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['user', 'propertyOwner', 'admin'], default: 'user' },
    phoneNumber: { type: String, required: true, unique: true}
  },
  { timestamps: true }
)

export const User = mongoose.model("User", userSchema)
