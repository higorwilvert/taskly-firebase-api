import { db } from "../../firebase.config.js";

export const createSubjects = (req, res) => {
  const { id, subject } = req.body;
  console.log(subject);
  if (
    !subject.classTime ||
    !subject.collegePeriod ||
    !subject.subjectName ||
    !subject.teacherName ||
    !subject.color
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  db.collection("users")
    .doc(id)
    .collection("subjects")
    .add({
      classTime: subject.classTime,
      collegePeriod: subject.collegePeriod,
      subjectName: subject.subjectName,
      teacherName: subject.teacherName,
      color: subject.color,
    })
    .then(() => {
      res.status(201).json({ message: "Subject created successfully" });
    })
    .catch((error) => {
      console.error("Error creating subject:", error);
      res.status(500).json({ error: "Failed to create subject" });
    });
};
// {"classTime": "4", "collegePeriod": "6", "subjectName": "Math", "teacherName": "João"}
