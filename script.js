let allPokemon = [];
let pokemonShown = 20;
let currentPokemonIndex = -1;

const content = document.getElementById("content");
const searchInput = document.getElementById("searchInput");
const loadingIndicator = document.getElementById("loadingIndicator");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const mainArea = document.getElementById("mainArea");
const headerTitle = document.getElementById("headerTitel");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const modalTitle = document.getElementById("pokemonModalLabel");
const modalBody = document.getElementById("modalBody");
const modalContent = document.querySelector("#pokemonModal .modal-content");

const pokemonModal = new bootstrap.Modal(
  document.getElementById("pokemonModal")
);

async function init() {
  await withLoading(async () => {
    allPokemon = await fetchPokemonList(151, 0);
    await displayBatch(allPokemon.results.slice(0, pokemonShown));
  });
  loadMoreBtn.classList.remove("d-none");
}

init();

loadMoreBtn.addEventListener("click", onLoadMoreClick);
headerTitle.addEventListener("click", onHeaderTitleClick);
searchInput.addEventListener("input", onSearchInput);
prevBtn.addEventListener("click", showPrevPokemon);
nextBtn.addEventListener("click", showNextPokemon);

function onLoadMoreClick() {
  loadMoreBtn.classList.add("d-none");
  pokemonShown += 20;
  const nextBatch = allPokemon.results.slice(pokemonShown - 20, pokemonShown);
  withLoading(async () => {
    await displayBatch(nextBatch);
  }).then(() => {
    if (pokemonShown < allPokemon.results.length) {
      loadMoreBtn.classList.remove("d-none");
    }
  });
}

function onHeaderTitleClick(event) {
  event.preventDefault();
  searchInput.value = "";
  pokemonShown = 20;
  withLoading(async () => {
    await displayBatch(allPokemon.results.slice(0, pokemonShown));
  });
  loadMoreBtn.classList.remove("d-none");
}

function onSearchInput() {
  const query = searchInput.value.toLowerCase().trim();
  if (query === "") {
    handleEmptyQuery();
  } else if (query.length < 3) {
    handleShortQuery();
  } else {
    handleValidQuery(query);
  }
}

function handleEmptyQuery() {
  content.innerHTML = "";
  displayBatch(allPokemon.results.slice(0, pokemonShown));
  loadMoreBtn.classList.remove("d-none");
}

function handleShortQuery() {
  content.innerHTML = "";
  loadMoreBtn.classList.add("d-none");
}

function handleValidQuery(query) {
  const filtered = allPokemon.results.filter((p) =>
    p.name.toLowerCase().startsWith(query)
  );
  content.innerHTML = "";
  if (filtered.length === 0) {
    content.innerHTML = `<h2 class="text-white text-center mt-4">Pokémon nicht gefunden</h2>`;
    loadMoreBtn.classList.add("d-none");
  } else {
    displayPokemon(filtered, content, showPokemonDetails, false);
    loadMoreBtn.classList.add("d-none");
  }
}

async function handleTextSearch(term) {
  const filtered = allPokemon.results.filter((p) =>
    p.name.toLowerCase().includes(term)
  );
  content.innerHTML = "";
  if (filtered.length === 0) {
    content.innerHTML = `<h2 class="text-white text-center">Pokémon nicht gefunden</h2>`;
    loadMoreBtn.classList.add("d-none");
  } else {
    await displayPokemon(filtered, content, showPokemonDetails, true);
    loadMoreBtn.classList.add("d-none");
  }
}

async function handleNumericSearch(term) {
  const pkm = await fetchPokemonByIdOrName(term);
  if (!pkm) {
    content.innerHTML = `<h2 class="text-white text-center">Pokémon nicht gefunden</h2>`;
    loadMoreBtn.classList.add("d-none");
    return;
  }
  await displayPokemon([pkm], content, showPokemonDetails, true);
  loadMoreBtn.classList.add("d-none");
}

async function showPokemonDetails(pokemon) {
  if (!pokemon) return;
  const index = allPokemon.results.findIndex((p) => p.name === pokemon.name);
  if (index === -1) return;
  currentPokemonIndex = index;
  updateModalContent(modalTitle, modalBody, pokemon);
  setModalBackground(modalContent, pokemon);
  updateModalNavigation(prevBtn, nextBtn, index, allPokemon.results.length);
  pokemonModal.show();
}

async function showPrevPokemon() {
  if (currentPokemonIndex <= 0) return;
  currentPokemonIndex--;
  const prevPokemon = allPokemon.results[currentPokemonIndex];
  const details = await fetchPokemonDetails(prevPokemon.url);
  showPokemonDetails(details);
}

async function showNextPokemon() {
  if (currentPokemonIndex >= allPokemon.results.length - 1) return;
  currentPokemonIndex++;
  const nextPokemon = allPokemon.results[currentPokemonIndex];
  const details = await fetchPokemonDetails(nextPokemon.url);
  showPokemonDetails(details);
}

async function displayBatch(pokemonList) {
  await displayPokemon(pokemonList, content, showPokemonDetails, true);
}

async function withLoading(task) {
  const start = Date.now();
  toggleLoading(true);
  try {
    await task();
  } catch (err) {
    console.error(err);
    content.innerHTML = `<h2 class="text-white text-center">Etwas ist schiefgelaufen.</h2>`;
  } finally {
    await hideLoadingAfterDelay(start);
  }
}

function toggleLoading(show) {
  loadingIndicator.classList.toggle("d-none", !show);
  mainArea.classList.toggle("d-none", show);
}

function hideLoadingAfterDelay(start) {
  return new Promise((resolve) => {
    const delay = Math.max(0, 1000 - (Date.now() - start));
    setTimeout(() => {
      toggleLoading(false);
      resolve();
    }, delay);
  });
}
