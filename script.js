// =======================================================
// === 1. Globale Variablen & DOM-Elemente
// =======================================================
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

// =======================================================
// === 2. Allgemeine Hilfsfunktionen (Utilities)
// =======================================================

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

// =======================================================
// === 3. Modal-Logik
// =======================================================

async function showPokemonDetails(pokemon) {
  currentPokemonIndex = allPokemon.results.findIndex(
    (p) => p.name === pokemon.name
  );
  updateModalContent(modalTitle, modalBody, pokemon);
  setModalBackground(modalContent, pokemon);
  updateModalNavigation(
    prevBtn,
    nextBtn,
    currentPokemonIndex,
    allPokemon.results.length
  );
  pokemonModal.show();
}

async function showNextPokemon() {
  const nextPokemon = allPokemon.results[currentPokemonIndex + 1];
  const details = await fetchPokemonDetails(nextPokemon.url);
  showPokemonDetails(details);
}

async function showPrevPokemon() {
  const prevPokemon = allPokemon.results[currentPokemonIndex - 1];
  const details = await fetchPokemonDetails(prevPokemon.url);
  showPokemonDetails(details);
}

// =======================================================
// === 4. Suchfunktionen
// =======================================================

async function handleSearch() {
  const term = searchInput.value.toLowerCase().trim();
  loadMoreBtn.classList.add("d-none");

  await withLoading(async () => {
    if (term === "") {
      pokemonShown = 20;
      await displayPokemon(
        allPokemon.results.slice(0, pokemonShown),
        content,
        showPokemonDetails,
        true
      );
      return;
    }

    if (!isNaN(parseInt(term))) {
      const pkm = await fetchPokemonByIdOrName(term);
      await displayPokemon([pkm], content, showPokemonDetails, true);
    } else {
      const filtered = allPokemon.results.filter((p) =>
        p.name.toLowerCase().includes(term)
      );
      if (filtered.length === 0) {
        content.innerHTML = `<h2 class="text-white text-center">Pokémon nicht gefunden</h2>`;
      } else {
        await displayPokemon(filtered, content, showPokemonDetails, true);
      }
    }
  });

  if (term === "") {
    loadMoreBtn.classList.remove("d-none");
  }
}

// =======================================================
// === 5. Initialisierung & Event-Listener
// =======================================================

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

searchInput.addEventListener("input", () => {
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
  loadMoreBtn.classList.add("d-done");
});
prevBtn.addEventListener("click", showPrevPokemon);
nextBtn.addEventListener("click", showNextPokemon);

function blalbabla() {}
