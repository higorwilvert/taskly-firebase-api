import admin from "firebase-admin";
import { readFileSync } from "fs";

const serviceAccount = JSON.parse(
  readFileSync(
    "./taskly-uno-app-firebase-adminsdk-fbsvc-7937724fc0.json",
    "utf8"
  )
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const db = admin.firestore();
export default admin;
