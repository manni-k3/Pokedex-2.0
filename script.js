let allPokemon = [];
let pokemonShown = 20;

const content = document.getElementById("content");
const searchInput = document.getElementById("searchInput");
const loadingIndicator = document.getElementById("loadingIndicator");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const mainArea = document.getElementById("mainArea");

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
    const remaining = Math.max(0, 2000 - elapsed); // mind. 2s
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
  card.classList.add("card", "shadow-lg", "bg-custom", "card-rounded");

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

  return card;
}

// ====================== SEARCH ======================
searchInput.addEventListener("input", handleSearch);

async function handleSearch() {
  const term = searchInput.value.toLowerCase().trim();

  if (term === "") {
    await withLoading(async () => {
      // zurück zur normalen Liste
      await displayPokemon(allPokemon.results.slice(0, pokemonShown), true);
      loadMoreBtn.classList.remove("d-none");
    });
    return;
  }

  await withLoading(async () => {
    // Im Suchmodus: Load-More ausblenden
    loadMoreBtn.classList.add("d-none");

    if (!isNaN(parseInt(term))) {
      // Suche per Nummer
      const pkm = await fetchPokemonByIdOrName(term);
      await displayPokemon([pkm], true);
    } else {
      // Suche per Name
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
      loadMoreBtn.classList.add("d-none"); // nichts mehr zu laden
    }
  });
}
