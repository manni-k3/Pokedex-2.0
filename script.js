let allPokemon = [];
let pokemonShown = 20;
let currentPokemonIndex = -1;

const pokemonModal = new bootstrap.Modal(
  document.getElementById("pokemonModal")
);
const modalTitle = document.getElementById("pokemonModalLabel");
const modalBody = document.getElementById("modalBody");
const modalFooter = document.getElementById("modalFooter");
const content = document.getElementById("content");
const searchInput = document.getElementById("searchInput");
const loadingIndicator = document.getElementById("loadingIndicator");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const mainArea = document.getElementById("mainArea");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

// ====================== LOADING WRAPPER ======================
// Zeigt NUR den Loader und versteckt #mainArea.
// Stellt sicher, dass der Loader mindestens 2s sichtbar ist.
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
    const elapsed = Date.now() - start;
    const remaining = Math.max(0, 1000 - elapsed);
    setTimeout(() => {
      loadingIndicator.classList.add("d-none");
      mainArea.classList.remove("d-none");
    }, remaining);
  }
}

// ====================== INIT ======================
async function init() {
  await withLoading(async () => {
    allPokemon = await fetchPokemonList(151, 0);
    await displayPokemon(allPokemon.results.slice(0, pokemonShown), true);
    loadMoreBtn.classList.remove("d-none");
  });
}
init();

// ====================== FETCH FUNCTIONS ======================
async function fetchPokemonList(limit, offset) {
  const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Liste konnte nicht geladen werden");
  return await response.json();
}

async function fetchPokemonByIdOrName(searchTerm) {
  const url = `https://pokeapi.co/api/v2/pokemon/${searchTerm}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Pokemon not found");
  return await response.json();
}

async function fetchPokemonDetails(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Details konnten nicht geladen werden");
  return await response.json();
}

// ====================== DISPLAY ======================
async function displayPokemon(pokemonList, reset = true) {
  const fragment = document.createDocumentFragment();

  // Brauchen wir Details (URL-Objekte) oder sind Details schon da?
  const needsDetails = pokemonList[0] && pokemonList[0].url;
  let detailsList = [];

  if (needsDetails) {
    const promises = pokemonList.map((p) => fetchPokemonDetails(p.url));
    detailsList = await Promise.all(promises);
  } else {
    detailsList = pokemonList;
  }

  detailsList.forEach((pokemon) => {
    const card = createPokemonCard(pokemon);
    const column = document.createElement("div");
    column.classList.add("col-12", "col-sm-6", "col-md-4", "col-lg-3");
    column.appendChild(card);
    fragment.appendChild(column);
  });

  if (reset) content.innerHTML = "";
  content.appendChild(fragment);
}

// ====================== CARD ======================
function createPokemonCard(pokemon) {
  const card = document.createElement("div");
  card.classList.add(
    "card",
    "shadow-lg",
    "bg-custom",
    "card-rounded",
    "cursor-pointer"
  );

  const body = document.createElement("div");
  body.classList.add("p-2", "text-center");

  const name = document.createElement("p");
  name.classList.add("fw-bold");
  name.textContent = pokemon.name;

  const img = document.createElement("img");
  img.src = pokemon.sprites.front_default;
  img.alt = pokemon.name;
  img.classList.add("img-fluid");

  const id = document.createElement("p");
  id.classList.add("text-muted");
  id.textContent = `#${pokemon.id}`;

  body.appendChild(img);
  body.appendChild(name);
  body.appendChild(id);
  card.appendChild(body);

  card.addEventListener("click", () => showPokemonDetails(pokemon));

  return card;
}

// ================== DETAIL VIEW =====================
function showPokemonDetails(pokemon) {
  currentPokemonIndex = allPokemon.results.findIndex(
    (p) => p.name === pokemon.name
  );

  modalTitle.textContent = "";
  modalBody.innerHTML = "";

  const modalContent = document.querySelector("#pokemonModal .modal-content");

  modalContent.className = "modal-content";
  modalContent.classList.add("text-white");

  modalTitle.textContent = `${pokemon.name} #${pokemon.id}`;

  const img = document.createElement("img");
  img.src = pokemon.sprites.front_default;
  img.alt = pokemon.name;
  img.classList.add("img-fluid", "pokemon-modal-img");
  modalBody.appendChild(img);

  const typesContainer = document.createElement("div");
  typesContainer.classList.add("d-flex", "justify-content-center", "mt-3");
  pokemon.types.forEach((typeInfo) => {
    const typeBadge = document.createElement("span");
    typeBadge.classList.add(
      "badge",
      "rounded-pill",
      "m-1",
      "type-badge-shadow"
    );
    typeBadge.textContent = typeInfo.type.name;
    typeBadge.style.backgroundColor = getTypeColor(typeInfo.type.name);
    typesContainer.appendChild(typeBadge);
  });
  modalBody.appendChild(typesContainer);

  const statsContainer = document.createElement("div");
  statsContainer.classList.add("stats-container", "mt-3");
  pokemon.stats.forEach((statInfo) => {
    const statRow = document.createElement("div");
    statRow.classList.add("stat-row");

    const statLabel = document.createElement("p");
    statLabel.classList.add("stat-label");
    statLabel.textContent = statInfo.stat.name;

    const statValue = document.createElement("p");
    statValue.classList.add("mb-0", "ms-2", "fw-bold", "stat-value");
    statValue.textContent = statInfo.base_stat;

    const progressBarContainer = document.createElement("div");
    progressBarContainer.classList.add("progress", "ms-3");

    const progressBar = document.createElement("div");
    progressBar.classList.add("progress-bar");
    progressBar.setAttribute("role", "progressbar");
    progressBar.style.width = `${(statInfo.base_stat / 150) * 100}%`;
    progressBar.style.backgroundColor = getStatColor(statInfo.base_stat);

    progressBarContainer.appendChild(progressBar);
    statRow.appendChild(statLabel);
    statRow.appendChild(progressBarContainer);
    statRow.appendChild(statValue);
    statsContainer.appendChild(statRow);
  });
  modalBody.appendChild(statsContainer);

  if (pokemon.types.length > 0) {
    const mainType = pokemon.types[0].type.name;
    modalContent.classList.add(`modal-bg-${mainType}`);

    if (
      mainType === "normal" ||
      mainType === "fairy" ||
      mainType === "pison" ||
      mainType === "flying"
    ) {
      modalContent.classList.remove("text-white");
      modalContent.classList.add("text-dark");
    }
  }

  prevBtn.classList.add("d-none");
  nextBtn.classList.add("d-none");

  if (currentPokemonIndex > 0) {
    prevBtn.classList.remove("d-none");
  }
  if (currentPokemonIndex < allPokemon.results.length - 1) {
    nextBtn.classList.remove("d-none");
  }

  pokemonModal.show();
}

function getStatColor(value) {
  if (value < 40) return "#ff6b6b";
  if (value < 70) return "#ff9f43";
  if (value < 100) return "#ffe74e";
  return "#00b894";
}

function getTypeColor(type) {
  const colors = {
    fire: "#FDDFDF",
    grass: "#DEFDE0",
    electric: "#FCF7DE",
    water: "#DEF3FD",
    ground: "#f4e7da",
    rock: "#d5d5d4",
    fairy: "#fceaff",
    poison: "#98d7a5",
    bug: "#f8d5a3",
    dragon: "#97b3e6",
    psychic: "#eaeda1",
    flying: "#F5F5F5",
    fighting: "#E6E0D4",
    normal: "#F5F5F5",
  };
  return colors[type] || "#777";
}

// ====================== SEARCH ======================
searchInput.addEventListener("input", handleSearch);

async function handleSearch() {
  const term = searchInput.value.toLowerCase().trim();

  if (term === "") {
    await withLoading(async () => {
      pokemonShown += 20;
      await displayPokemon(allPokemon.results.slice(0, pokemonShown), true);
      loadMoreBtn.classList.remove("d-none");
    });
    return;
  }

  await withLoading(async () => {
    loadMoreBtn.classList.add("d-none");

    if (!isNaN(parseInt(term))) {
      const pkm = await fetchPokemonByIdOrName(term);
      await displayPokemon([pkm], true);
    } else {
      const filtered = allPokemon.results.filter((p) =>
        p.name.toLowerCase().includes(term)
      );
      if (filtered.length === 0) {
        content.innerHTML = `<h2 class="text-white text-center">Pokémon nicht gefunden</h2>`;
      } else {
        await displayPokemon(filtered, true);
      }
    }
  });
}

// ====================== LOAD MORE ======================
loadMoreBtn.addEventListener("click", loadMorePokemon);

async function loadMorePokemon() {
  await withLoading(async () => {
    pokemonShown += 20;

    const nextBatch = allPokemon.results.slice(pokemonShown - 20, pokemonShown);

    if (nextBatch.length > 0) {
      await displayPokemon(nextBatch, true);
    }

    if (pokemonShown >= allPokemon.results.length) {
      loadMoreBtn.classList.add("d-none");
    }
  });
}

const headerTitel = document.getElementById("headerTitel");

headerTitel.addEventListener("click", (event) => {
  event.preventDefault();
  pokemonShown = 20;
  withLoading(async () => {
    await displayPokemon(allPokemon.results.slice(0, pokemonShown), true);
    loadMoreBtn.classList.remove("d-none");
  });
});

async function showNextPokemon() {
  if (currentPokemonIndex < allPokemon.results.length - 1) {
    const nextPokemon = allPokemon.results[currentPokemonIndex + 1];
    const details = await fetchPokemonDetails(nextPokemon.url);
    showPokemonDetails(details);
  }
}

async function showPrevPokemon() {
  if (currentPokemonIndex > 0) {
    const prevPokemon = allPokemon.results[currentPokemonIndex - 1];
    const details = await fetchPokemonDetails(prevPokemon.url);
    showPokemonDetails(details);
  }
}

prevBtn.addEventListener("click", showPrevPokemon);
nextBtn.addEventListener("click", showNextPokemon);
