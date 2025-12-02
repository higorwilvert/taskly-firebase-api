import { sendEmail } from "../../utils/smtp/nodemailer.js";
import admin from "../../firebase.config.js";
import { db } from "../../firebase.config.js";
export const resetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const newPassword = Math.random().toString(36).slice(-8);

    const sendEmailToRest = await sendEmail(email, newPassword);

    if (!sendEmailToRest) {
      return res.status(500).json({ message: "Erro ao enviar o e-mail." });
    }

    const userSnapshot = await db
      .collection("users")
      .where("email", "==", email)
      .get();

    if (userSnapshot.empty) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    const userId = userSnapshot.docs[0].id;

    await admin.auth().updateUser(userId, { password: newPassword });
    res.status(200).json({ message: "Nova senha enviada para o seu e-mail." });
  } catch (error) {
    console.error("Erro ao resetar a senha:", error);
    res.status(500).json({ message: "Erro ao resetar a senha." });
  }
};
