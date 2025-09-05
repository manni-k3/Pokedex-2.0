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

async function withLoading(task) {
  const start = Date.now();
  showLoading();
  try {
    await task();
  } catch (err) {
    handleError(err);
  } finally {
    await ensureMinimumLoadingTime(start);
  }
}

function showLoading() {
  loadingIndicator.classList.remove("d-none");
  mainArea.classList.add("d-none");
}

function hideLoading() {
  loadingIndicator.classList.add("d-none");
  mainArea.classList.remove("d-none");
}

function handleError(err) {
  console.error(err);
  content.innerHTML = `<h2 class="text-white text-center">Etwas ist schiefgelaufen.</h2>`;
}

function ensureMinimumLoadingTime(start) {
  return new Promise((resolve) => {
    const elapsed = Date.now() - start;
    const remaining = Math.max(0, 1000 - elapsed);
    setTimeout(() => {
      hideLoading();
      resolve();
    }, remaining);
  });
}

function resetSearch() {
  searchInput.value = "";
  pokemonShown = 20;
  loadMoreBtn.classList.remove("d-none");
}

function renderPokemonList(pokemonList, showDetailsOnClick = true) {
  return displayPokemon(
    pokemonList,
    content,
    showDetailsOnClick ? showPokemonDetails : null,
    true
  );
}

function updateModalNavigationButtons() {
  updateModalNavigation(
    prevBtn,
    nextBtn,
    currentPokemonIndex,
    allPokemon.results.length
  );
}

function updateModalForPokemon(pokemon) {
  updateModalContent(modalTitle, modalBody, pokemon);
  setModalBackground(modalContent, pokemon);
  updateModalNavigationButtons();
}

async function fetchAndShowPokemon(pokemon) {
  const details = await fetchPokemonDetails(pokemon.url);
  await showPokemonDetails(details);
}

async function showPokemonDetails(pokemon) {
  currentPokemonIndex = allPokemon.results.findIndex(
    (p) => p.name === pokemon.name
  );
  updateModalForPokemon(pokemon);
  pokemonModal.show();
}

async function showNextPokemon() {
  if (currentPokemonIndex + 1 >= allPokemon.results.length) return;
  const nextPokemon = allPokemon.results[currentPokemonIndex + 1];
  await fetchAndShowPokemon(nextPokemon);
}

async function showPrevPokemon() {
  if (currentPokemonIndex - 1 < 0) return;
  const prevPokemon = allPokemon.results[currentPokemonIndex - 1];
  await fetchAndShowPokemon(prevPokemon);
}

async function handleEmptySearch() {
  resetSearch();
  const initialBatch = allPokemon.results.slice(0, pokemonShown);
  await renderPokemonList(initialBatch);
}

async function handleNumericSearch(term) {
  const pkm = await fetchPokemonByIdOrName(term);
  await renderPokemonList([pkm]);
  loadMoreBtn.classList.add("d-none");
}

async function handleTextSearch(term) {
  const filtered = allPokemon.results.filter((p) =>
    p.name.toLowerCase().startsWith(term)
  );
  if (filtered.length === 0) {
    content.innerHTML = `<h2 class="text-white text-center">Pokémon nicht gefunden</h2>`;
  } else {
    await renderPokemonList(filtered);
  }
  loadMoreBtn.classList.add("d-none");
}

async function handleEmptyQuery() {
  resetSearch();
  await withLoading(async () => {
    await renderPokemonList(allPokemon.results.slice(0, pokemonShown));
  });
}

function handleShortQuery() {
  content.innerHTML = "";
  loadMoreBtn.classList.add("d-none");
}

function handleValidQuery(query) {
  const filteredPokemon = allPokemon.results.filter((pokemon) =>
    pokemon.name.toLowerCase().startsWith(query)
  );
  if (filteredPokemon.length === 0) {
    content.innerHTML = `<h2 class="text-white text-center">Pokémon nicht gefunden</h2>`;
  } else {
    content.innerHTML = "";
    displayPokemon(filteredPokemon, content, showPokemonDetails, false);
  }
  loadMoreBtn.classList.add("d-none");
}

function onSearchInput() {
  const query = searchInput.value.toLowerCase().trim();
  if (query.length === 0) {
    handleEmptyQuery();
  } else if (query.length < 3) {
    handleShortQuery();
  } else {
    handleValidQuery(query);
  }
}

async function handleSearch() {
  const term = searchInput.value.toLowerCase().trim();

  await withLoading(async () => {
    if (term === "") {
      await handleEmptySearch();
      return;
    }
    if (!isNaN(parseInt(term))) {
      await handleNumericSearch(term);
    } else {
      await handleTextSearch(term);
    }
  });
}

async function onLoadMoreClick() {
  loadMoreBtn.classList.add("d-none");

  const nextBatch = allPokemon.results.slice(pokemonShown, pokemonShown + 20);
  pokemonShown += 20;

  await withLoading(async () => {
    await renderPokemonList(nextBatch);
  });

  if (pokemonShown < allPokemon.results.length) {
    loadMoreBtn.classList.remove("d-none");
  }
}

function onHeaderTitleClick(event) {
  event.preventDefault();
  resetSearch();
  withLoading(async () => {
    await renderPokemonList(allPokemon.results.slice(0, pokemonShown));
  });
}

async function init() {
  await withLoading(async () => {
    allPokemon = await fetchPokemonList(151, 0);
    await renderPokemonList(allPokemon.results.slice(0, pokemonShown));
  });

  loadMoreBtn.classList.remove("d-none");
}

init();

loadMoreBtn.addEventListener("click", onLoadMoreClick);
headerTitle.addEventListener("click", onHeaderTitleClick);
searchInput.addEventListener("input", onSearchInput);
prevBtn.addEventListener("click", showPrevPokemon);
nextBtn.addEventListener("click", showNextPokemon);
