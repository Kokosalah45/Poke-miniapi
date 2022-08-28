import axios from "axios";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getPokemonImg = async (pokemon) => {
  const {
    data: {
      sprites: { front_shiny, front_default, back_default, back_shiny },
    },
  } = await axios(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);
  if (!!front_default) {
    return front_default;
  }
  if (!!front_shiny) {
    return front_shiny;
  }
  if (!!back_default) {
    return back_default;
  }
  if (!!back_shiny) {
    back_shiny;
  }
  return null;
};

const getPokemons = async (results) => {
  const pokemons = [];
  for (let i = 0; i < results.length; i++) {
    const { name } = results[i];

    const imgURL = await getPokemonImg(name);
    const pokemon = { ...results[i], name, img_url: imgURL };

    if (imgURL) {
      pokemons.push(pokemon);
    }
  }

  return pokemons;
};

const insertPokemons = async () => {
  const {
    data: { results },
  } = await axios("https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0");
  const pokemons = await getPokemons(results);

  await prisma.pokemon.createMany({ data: pokemons });
};

insertPokemons()
  .catch((e) => {
    console.log(e.message);
    process.exit();
  })
  .finally(() => {
    prisma.$disconnect();
  });
