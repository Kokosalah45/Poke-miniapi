import express from "express";
import { PrismaClient } from "@prisma/client";
import { getRandomArbitrary } from "../utils/index.js";
const pokemonRouter = express.Router();
const prisma = new PrismaClient();

const cache = {
  pokemonCount: 1114,
};
pokemonRouter.use(express.json());
pokemonRouter.use(express.urlencoded({ extended: true }));

const getPokemonCount = async (req = null, res = null) => {
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
  if (req) {
    res.json(cache.pokemonCount);
  }
  return cache.pokemonCount;
};

pokemonRouter.get("/pokemon-count", getPokemonCount);

pokemonRouter.get("/", async (req, res) => {
  let { cursor, take } = req.query;
  cursor = cursor === "0" ? 1 : +cursor;
  take = +take;
  const [pokemonCount, results] = await Promise.all([
    getPokemonCount(),
    prisma.pokemon.findMany({
      take: take,
      skip: cursor === 1 ? undefined : 1, // Skip the cursor
      cursor: {
        id: cursor,
      },

      orderBy: {
        id: "asc",
      },
    }),
  ]);

  res.json({ pokemonCount, results });
});

pokemonRouter.get("/get-random-pokemons", async (req, res) => {
  const pokemonCount = (await getPokemonCount()) + 1;
  const firstId = getRandomArbitrary(1, pokemonCount);
  let lowerBound = firstId;
  let upperBound = pokemonCount;
  if (firstId === pokemonCount - 1) {
    lowerBound = 0;
    upperBound = pokemonCount - 1;
  }

  const secondId = getRandomArbitrary(lowerBound, upperBound);

  const pokemons = await prisma.pokemon.findMany({
    where: {
      OR: [{ id: firstId }, { id: secondId }],
    },
    select: {
      name: true,
      img_url: true,

      voted_for: true,
      voted_against: true,
    },
  });

  res.json(pokemons);
});

pokemonRouter.patch("/vote", async (req, res) => {
  const {
    body: { selectedPokemon, unselectedPokemon },
  } = req;

  Promise.allSettled([
    prisma.pokemon.update({
      where: {
        name: selectedPokemon.name,
      },
      data: {
        voted_for: selectedPokemon.voted_for + 1,
      },
    }),
    prisma.pokemon.update({
      where: {
        name: unselectedPokemon.name,
      },
      data: {
        voted_against: unselectedPokemon.voted_against + 1,
      },
    }),
  ]);

  res.json({ message: "updated !" });
});

export default pokemonRouter;
