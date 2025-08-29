let allPokemon = [];
let content = document.getElementById("content");
let searchInput = document.getElementById("searchInput");
let loadingIndicator = document.getElementById("loadingIndicator");
let loadMoreBtn = document.getElementById("loadMoreBtn");
let pokemonShown = 20;

document.getElementById("searchInput").addEventListener("input", filterPokemon);
document.getElementById("searchBtn").addEventListener("click", searchPokemon);
document.getElementById("loadMoreBtn").addEventListener("click", () => {
  toggleLoading(true);
  content.innerHTML = "";
  const nextPokemon = allPokemon.results.slice(pokemonShown, pokemonShown + 20);
  displayPokemon(nextPokemon);
  pokemonShown += 20;
});

async function renderPokemon(limit, offset) {
  const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
  const response = await fetch(url);
  const data = await response.json();

  return data;
}

async function init() {
  content.innerHTML = "";
  toggleLoading(true);
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
  const pokemonUrlList = pokemonList.map((pokemon) => pokemon.url);
  const promises = pokemonUrlList.map((url) => getPokemonDetails(url));
  const pokemonDetails = await Promise.all(promises);

  content.innerHTML = "";

  pokemonDetails.forEach((details) => {
    const card = createPokemonCard(details, details);
    const column = document.createElement("div");
    column.classList.add("col-12", "col-sm-6", "col-md-4", "col-lg-3");
    column.appendChild(card);
    content.appendChild(column);
  });
  toggleLoading(false);
}

function createPokemonCard(pokemonData, pokemonDetails) {
  const card = document.createElement("div");
  card.classList.add("card", "shadow-lg", "bg-custom", "card-rounded");

  const cardBody = document.createElement("div");
  cardBody.classList.add("p-2", "text-center");

  const pokemonName = document.createElement("p");
  pokemonName.classList.add("fw-bold");
  pokemonName.textContent = pokemonData.name;

  const pokemonImage = document.createElement("img");
  pokemonImage.src = pokemonDetails.sprites.front_default;
  pokemonImage.alt = pokemonDetails.name;
  pokemonImage.classList.add("img-fluid");

  const pokemonId = document.createElement("p");
  pokemonId.classList.add("text-muted");
  pokemonId.textContent = pokemonDetails.id;

  cardBody.appendChild(pokemonImage);
  cardBody.appendChild(pokemonName);
  cardBody.appendChild(pokemonId);
  card.appendChild(cardBody);

  return card;
}

async function getPokemonDetails(url) {
  const response = await fetch(url);
  const data = await response.json();
  await new Promise((resolve) => setTimeout(resolve, 500));
  return data;
}

async function searchPokemon() {
  toggleLoading(true);
  try {
    content.innerHTML = "";
    const searchTerm = searchInput.value.trim();
    const pokemonsearch = await fetchPokemon(searchTerm);

    const foundPokemonList = [pokemonsearch];
    await displayPokemon(foundPokemonList);

    toggleLoading(false);
  } catch {
    document.getElementById(
      "content"
    ).innerHTML = `<h2 class="text-white">Pokemon nicht gefunden</h2>`;
    toggleLoading(false);
  }
}

function filterPokemon() {
  toggleLoading(true);
  content.innerHTML = "";
  const searchTerm = searchInput.value.toLowerCase();
  const filteredPokemon = allPokemon.results.filter((pokemon) => {
    return pokemon.name.toLowerCase().includes(searchTerm);
  });
  displayPokemon(filteredPokemon);
}

function toggleLoading(show) {
  if (show) {
    loadingIndicator.classList.remove("hidden");
    loadMoreBtn.classList.add("hidden");
  } else {
    loadingIndicator.classList.add("hidden");
    loadMoreBtn.classList.remove("hidden");
  }
}
