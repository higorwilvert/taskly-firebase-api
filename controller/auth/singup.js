import { hashPassword } from "../../utils/password.js";
import { db } from "../../firebase.config.js";

export const handleSignup = async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await hashPassword(password);
  console.log(`Hashed password for ${email}: ${hashedPassword}`);
  try {
    const userRef = db.collection("users").doc();
    await userRef.set({
      email,
      password: hashedPassword,
      authenticated: true,
    });
    res.status(201).send({ id: userRef.id, email });
    console.log(`User created with ID: ${userRef.id} and email: ${email}`);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).send("Error creating user");
  }
};
