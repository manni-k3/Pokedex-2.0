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

loadMoreBtn.addEventListener("click", async () => {
  loadMoreBtn.classList.add("d-none");

  pokemonShown += 20;
  const nextBatch = allPokemon.results.slice(pokemonShown - 20, pokemonShown);

  await withLoading(async () => {
    await displayPokemon(nextBatch, content, showPokemonDetails, true);
  });

  if (pokemonShown < allPokemon.results.length) {
    loadMoreBtn.classList.remove("d-none");
  }
});

headerTitle.addEventListener("click", (event) => {
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
});

searchInput.addEventListener("input", handleLiveSearch);

function handleLiveSearch() {
  const query = searchInput.value.toLowerCase();

  if (query === "") {
    resetDisplay();
    return;
  }

  if (query.length < 3) {
    clearContentAndHideLoadMore();
    return;
  }

  filterAndDisplay(query);
}

function resetDisplay() {
  content.innerHTML = "";
  displayPokemon(
    allPokemon.results.slice(0, pokemonShown),
    content,
    showPokemonDetails,
    true
  );
  loadMoreBtn.classList.remove("d-none");
}

function clearContentAndHideLoadMore() {
  content.innerHTML = "";
  loadMoreBtn.classList.add("d-none");
}

function filterAndDisplay(query) {
  const filteredPokemon = allPokemon.results.filter((pokemon) =>
    pokemon.name.toLowerCase().startsWith(query)
  );

  content.innerHTML = "";
  displayPokemon(filteredPokemon, content, showPokemonDetails, false);
  loadMoreBtn.classList.add("d-none");
}

async function handleSearch() {
  const term = searchInput.value.toLowerCase().trim();
  loadMoreBtn.classList.add("d-none");

  await withLoading(async () => {
    if (term === "") {
      await handleEmptySearch();
    } else if (!isNaN(parseInt(term))) {
      await handleNumericSearch(term);
    } else {
      await handleTextSearch(term);
    }
  });

  if (term === "") {
    loadMoreBtn.classList.remove("d-none");
  }
}

async function handleEmptySearch() {
  pokemonShown = 20;
  await displayPokemon(
    allPokemon.results.slice(0, pokemonShown),
    content,
    showPokemonDetails,
    true
  );
}

async function handleNumericSearch(term) {
  const pkm = await fetchPokemonByIdOrName(term);
  await displayPokemon([pkm], content, showPokemonDetails, true);
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
