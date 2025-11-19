import { db } from "../../firebase.config.js";

export const updateSubject = async (req, res) => {
  try {
    const { id, subject } = req.body;
    if (!id || !subject) {
      return res
        .status(400)
        .json({ error: "Missing user ID, subject ID, or updated data" });
    }
    const subjectId = subject.id;
    const updatedData = { ...subject };
    delete updatedData.id; // Remove id from the data to be updated
    await db
      .collection("users")
      .doc(id)
      .collection("subjects")
      .doc(subjectId)
      .update(updatedData);

    res.status(200).json({ message: "Subject updated successfully" });
  } catch (error) {
    console.error("Error updating subject:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
