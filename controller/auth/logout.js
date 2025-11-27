import { db } from "../../firebase.config.js";

export const handleLogout = async (req, res) => {
  const { id } = req.body;
  try {
    const userRef = db.collection("users").doc(id);

    if (!userRef) {
      return res.status(404).send({ message: "User not found" });
    }

    await userRef.update({ authenticated: false }).then(() => {
      res.status(200).send({ message: "Logout successful" });
    });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).send("Error during logout");
  }
};
