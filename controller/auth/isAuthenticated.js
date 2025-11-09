import { db } from "../../firebase.config.js";

export const isAuthenticated = async (req, res) => {
  try {
    const { email } = req.query;
    const trimmedEmail = email.trim();
    const usersRef = db.collection("users");
    const snapshot = await usersRef
      .where("email", "==", trimmedEmail)
      .where("authenticated", "==", true)
      .get();

    if (snapshot.empty) {
      return res.status(404).send({ message: "Usuário não autenticado" });
    }

    let userData = null;
    snapshot.forEach((doc) => {
      userData = {
        id: doc.id,
        ...doc.data(),
      };
    });

    return res.status(200).send({
      id: userData.id,
      email: userData.email,
      authenticated: userData.authenticated,
    });
  } catch (error) {
    console.error("Error checking authentication:", error);
    res.status(500).send("Error checking authentication");
  }
};
