import express from "express";
import { PrismaClient } from "@prisma/client";
import { getRandomArbitrary } from "../utils/index.js";
const pokemonRouter = express.Router();
const prisma = new PrismaClient();

const cache = {
  pokemonCount: 1114,
};

const getPokemonCount = async () => {
  const { pokemonCount } = cache;

  if (!pokemonCount) {
    const { id } = await prisma.pokemon.findFirst({
      select: {
        id: true,
      },
      orderBy: [{ id: "desc" }],
    });

    cache.pokemonCount = id;
  }

  return cache.pokemonCount;
};

pokemonRouter.get("/", async (req, res) => {
  const [pokemonCount, results] = await Promise.all([
    getPokemonCount(),
    prisma.pokemon.findMany(),
  ]);

  res.json({ pokemonCount, results });
});

pokemonRouter.get("/get-random-pokemons", async (req, res) => {
  const pokemonCount = (await getPokemonCount()) + 1;
  const firstId = getRandomArbitrary(1, pokemonCount);
  const secondId = getRandomArbitrary(firstId, pokemonCount);

  const pokemons = await prisma.pokemon.findMany({
    where: {
      OR: [{ id: firstId }, { id: secondId }],
    },
    select: {
      name: true,
      img_url: true,
      url: true,
      voted_for: true,
      voted_against: true,
    },
  });

  res.json(pokemons);
});

export default pokemonRouter;
