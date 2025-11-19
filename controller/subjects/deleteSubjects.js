import { db } from "../../firebase.config.js";

export async function deleteSubject(req, res) {
  try {
    const { id, subjectId } = req.body;
    console.log("Delete subject request data:", { id, subjectId });
    if (!id || !subjectId) {
      return res.status(400).json({ error: "Missing user ID or subject ID" });
    }

    db.collection("users")
      .doc(id)
      .collection("subjects")
      .doc(subjectId)
      .delete();

    res.status(200).json({ message: "Subject deleted successfully" });
  } catch (error) {
    console.error("Error deleting subject:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
