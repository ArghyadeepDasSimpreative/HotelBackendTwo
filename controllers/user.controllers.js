import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const registerUser = async (req, res) => {
  const { firstname, lastname, email, password, role } = req.body;
console.log("role is role", role)
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    if(["user", "propertyOwner", "admin"].includes(role) == false) {
        return res.status(400).json({ message: "The role is not valid."})
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      role
    });

    res.status(201).json({ message: "User registered", userId: newUser._id });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ token, user: { id: user._id, firstname: user.firstname, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};
