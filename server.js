import express from "express";
import apiRouter from "./routes/api.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(helmet());
app.use(compression());
app.use(cors());

app.use("/api", apiRouter);

app.get("/", (req, res) => {
  res.json("hi");
});

app.listen(process.env.PORT || 5000, () => {
  console.log("we listenin baby");
});
