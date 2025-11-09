import { db } from "../../firebase.config.js";

export const handleVerifyAuthentication = async (req, res) => {
  const { id } = req.body;
  try {
    const userRef = db.collection("users").doc(id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).send({ message: "User not found" });
    }

    const isAuthenticated = userDoc.data().authenticated;
    res.status(200).send({ isAuthenticated });
  } catch (error) {
    console.error("Error during authentication verification:", error);
    res.status(500).send("Error during authentication verification");
  }
};
