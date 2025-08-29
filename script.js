let allPokemon = [];

const content = document.getElementById("content");
const searchInput = document.getElementById("searchInput");

let currentOffset = 0;

document.getElementById("searchInput").addEventListener("input", filterPokemon);
document.getElementById("searchBtn").addEventListener("click", searchPokemon);
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
  allPokemon = await renderPokemon(151, 0);
  displayPokemon(allPokemon.results.slice(0, 20));
}
init();

async function fetchPokemon(searchTerm) {
  const search = `https://pokeapi.co/api/v2/pokemon/${searchTerm}`;
  const resp = await fetch(search);
  const searchPkm = await resp.json();

  return searchPkm;
}

async function displayPokemon(pokemonList) {
  for (const pokemon of pokemonList) {
    const pokemonDetails = await getPokemonDetails(pokemon.url);
    const card = createPokemonCard(pokemon, pokemonDetails);
    content.appendChild(card);
  }
}

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

async function searchPokemon() {
  try {
    content.innerHTML = "";
    const searchTerm = searchInput.value.trim();
    const pokemonsearch = await fetchPokemon(searchTerm);

    const card = createPokemonCard(pokemonsearch, pokemonsearch);
    content.appendChild(card);
  } catch {
    document.getElementById(
      "content"
    ).innerHTML = `<h2>Pokemon nicht gefunden</h2>`;
  }
}

function filterPokemon() {
  content.innerHTML = "";
  const searchTerm = searchInput.value.toLowerCase();
  const filteredPokemon = allPokemon.results.filter((pokemon) => {
    return pokemon.name.toLowerCase().includes(searchTerm);
  });
  displayPokemon(filteredPokemon);
}
