import { db } from "../../firebase.config.js";

export const getSubjects = async (req, res) => {
  const { id } = req.body;
  try {
    const snapshot = await db
      .collection("users")
      .doc(id)
      .collection("subjects")
      .get();
    const subjects = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).send({ newSubject: subjects });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).send("Error fetching subjects");
  }
};
