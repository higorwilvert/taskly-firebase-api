import dotenv from "dotenv";
import express, { json } from "express";
import { routes } from "./routes/index.js";
dotenv.config();
const port = process.env.PORT;
const app = express();
app.use(json());

routes(app);

app.listen(port, () => {
  console.log(`Taskly API on port ${port}`);
});
