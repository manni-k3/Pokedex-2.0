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
  loadingIndicator.classList.remove("d-none");
  mainArea.classList.add("d-none");
  try {
    await task();
  } catch (err) {
    console.error(err);
    content.innerHTML = `<h2 class="text-white text-center">Etwas ist schiefgelaufen.</h2>`;
  } finally {
    return new Promise((resolve) => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 1000 - elapsed);
      setTimeout(() => {
        loadingIndicator.classList.add("d-none");
        mainArea.classList.remove("d-none");
        resolve();
      }, remaining);
    });
  }
}

function updateModalForPokemon(pokemon) {
  updateModalContent(modalTitle, modalBody, pokemon);
  setModalBackground(modalContent, pokemon);
  updateModalNavigation(
    prevBtn,
    nextBtn,
    currentPokemonIndex,
    allPokemon.results.length
  );
}

async function fetchAndShowPokemon(pokemon) {
  const details = await fetchPokemonDetails(pokemon.url);
  showPokemonDetails(details);
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
  pokemonShown = 20;
  await displayPokemon(
    allPokemon.results.slice(0, pokemonShown),
    content,
    showPokemonDetails,
    true
  );
  loadMoreBtn.classList.remove("d-none");
}

async function handleNumericSearch(term) {
  const pkm = await fetchPokemonByIdOrName(term);
  await displayPokemon([pkm], content, showPokemonDetails, true);
  loadMoreBtn.classList.add("d-none");
}

async function handleTextSearch(term) {
  const filtered = allPokemon.results.filter((p) =>
    p.name.toLowerCase().includes(term)
  );
  if (filtered.length === 0) {
    content.innerHTML = `<h2 class="text-white text-center">Pokémon nicht gefunden</h2>`;
  } else {
    await displayPokemon(filtered, content, showPokemonDetails, true);
  }
  loadMoreBtn.classList.add("d-none");
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

  pokemonShown += 20;
  const nextBatch = allPokemon.results.slice(pokemonShown - 20, pokemonShown);

  await withLoading(async () => {
    await displayPokemon(nextBatch, content, showPokemonDetails, true);
  });

  if (pokemonShown < allPokemon.results.length) {
    loadMoreBtn.classList.remove("d-none");
  }
}

function onHeaderTitleClick(event) {
  event.preventDefault();
  searchInput.value = "";
  pokemonShown = 20;
  withLoading(() =>
    displayPokemon(
      allPokemon.results.slice(0, pokemonShown),
      content,
      showPokemonDetails,
      true
    )
  );
  loadMoreBtn.classList.remove("d-none");
}

function onSearchInput() {
  const query = searchInput.value.toLowerCase();

  if (query.length < 3) {
    content.innerHTML = "";
    loadMoreBtn.classList.add("d-none");
    return;
  }
  const filteredPokemon = allPokemon.results.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(query)
  );

  content.innerHTML = "";
  displayPokemon(filteredPokemon, content, showPokemonDetails, false);
  loadMoreBtn.classList.add("d-none");
}

async function init() {
  await withLoading(async () => {
    allPokemon = await fetchPokemonList(151, 0);
    await displayPokemon(
      allPokemon.results.slice(0, pokemonShown),
      content,
      showPokemonDetails,
      true
    );
  });

  loadMoreBtn.classList.remove("d-none");
}

init();

loadMoreBtn.addEventListener("click", onLoadMoreClick);
headerTitle.addEventListener("click", onHeaderTitleClick);
searchInput.addEventListener("input", onSearchInput);
prevBtn.addEventListener("click", showPrevPokemon);
nextBtn.addEventListener("click", showNextPokemon);

function blalbabla() {}
