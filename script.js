const content = document.getElementById("content");

let currentOffset = 0;

document.getElementById("loadMoreBtn").addEventListener("click", () => {
  currentOffset += 20;
  init();
});

async function renderPokemon(limit, offset) {
  const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
  const response = await fetch(url);
  const data = await response.json();

  return data;
}

async function init() {
  content.innerHTML = "";
  const pokemonData = await renderPokemon(20, currentOffset);
  for (const pokemon of pokemonData.results) {
    const pokemonDetails = await getPokemonDetails(pokemon.url);
    const card = createPokemonCard(pokemon, pokemonDetails);
    console.log(pokemonDetails);

    content.appendChild(card);
  }
}
init();

function createPokemonCard(pokemonData, pokemonDetails) {
  const card = document.createElement("div");
  card.classList.add("pokemon-card");
  card.textContent = pokemonData.name;

  const pokemonImage = document.createElement("img");
  pokemonImage.src = pokemonDetails.sprites.front_default;
  pokemonImage.alt = pokemonDetails.name;

  const pokemonId = document.createElement("p");
  pokemonId.textContent = pokemonDetails.id;

  card.appendChild(pokemonImage);
  card.appendChild(pokemonId);

  return card;
}

async function getPokemonDetails(url) {
  const response = await fetch(url);
  const data = await response.json();

  return data;
}
