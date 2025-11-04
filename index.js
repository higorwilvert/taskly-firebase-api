import express, { json } from "express";
import { db } from "./firebase.config.js";

const port = 3001;
const app = express();

const hashPassword = async (password) => {
  return btoa(password);
};
app.use(json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await hashPassword(password);
  try {
    const userRef = db.collection("users").doc();
    await userRef.set({
      name,
      email,
      password: hashedPassword,
    });
    res.status(201).send({ id: userRef.id, name, email });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).send("Error creating user");
  }
});

app.get("/subjects", async (req, res) => {
  try {
    const snapshot = await db.collection("subjects").get();
    console.log("snapshot", snapshot);
    res.status(200).send(snapshot.docs);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).send("Error fetching subjects");
  }
});

app.listen(port, () => {
  console.log(`Taskly API listening on port ${port}`);
});
