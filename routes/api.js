import pokemonRouter from "./pokemon.js";
import express from "express";

const apiRouter = express.Router();

apiRouter.use("/pokemon", pokemonRouter);

apiRouter.get("/", (req, res) => {
  res.json("Hi API !");
});

export default apiRouter;
