import { db } from "../../firebase.config.js";
import { handlePassword } from "../../utils/password.js";

export const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const trimmedEmail = email.trim();
    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("email", "==", trimmedEmail).get();

    if (snapshot.empty) {
      return res.status(404).send({ message: "Usuário não encontrado" });
    }

    let userData = null;
    snapshot.forEach((doc) => {
      userData = {
        id: doc.id,
        ...doc.data(),
      };
    });
    const hashedPassword = userData.password;
    const isMatchedPassword = handlePassword(password, hashedPassword);

    if (isMatchedPassword) {
      const userRef = db.collection("users").doc(userData.id);
      await userRef.update({ authenticated: true }).then(() => {
        return res.status(200).send({
          id: userData.id,
          email: userData.email,
          authenticated: userData.authenticated,
        });
      });
    } else {
      return res.status(404).send({
        message: "Usuário não encontrado, verifique suas credenciais",
      });
    }
  } catch (error) {
    console.error(error);
  }
};
