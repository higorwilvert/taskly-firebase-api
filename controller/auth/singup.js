import { db } from "../../firebase.config.js";
import { hashPassword } from "../../utils/password.js";

export const handleSignup = async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await hashPassword(password);
  try {
    const userRef = db.collection("users").doc();
    await userRef.set({
      email,
      password: hashedPassword,
      authenticated: true,
    });
    res.status(201).send({ id: userRef.id, email });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).send("Error creating user");
  }
};
