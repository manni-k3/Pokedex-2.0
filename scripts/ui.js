function capitalizeName(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function fetchDetailsIfNeeded(pokemonList) {
  const needsDetails = pokemonList[0] && pokemonList[0].url;
  if (!needsDetails) return Promise.resolve(pokemonList);

  const promises = pokemonList.map((p) => fetchPokemonDetails(p.url));
  return Promise.all(promises);
}

function createCardElement(pokemon, onClick) {
  const column = createColumn();
  const pokemonCopy = { ...pokemon, name: capitalizeName(pokemon.name) };
  column.innerHTML = getPokemonCardHTML(pokemonCopy);

  const card = column.querySelector(".card");
  addCardClick(card, onClick);
  setCardBackground(card, pokemon);

  return column;
}

function createColumn() {
  const column = document.createElement("div");
  column.classList.add("col-12", "col-sm-6", "col-md-4", "col-lg-3");
  return column;
}

function addCardClick(card, onClick) {
  card.addEventListener("click", onClick);
}

function setCardBackground(card, pokemon) {
  if (!pokemon.types || pokemon.types.length === 0) return;
  const mainType = pokemon.types[0].type.name;
  card.classList.add(`modal-bg-${mainType}`);
  const bgColor =
    getComputedStyle(document.documentElement).getPropertyValue(
      `--type-color-${mainType}`
    ) || "#ffffff";
  if (isLightColor(bgColor)) {
    card.classList.add("text-dark");
    card.classList.remove("text-white");
  } else {
    card.classList.add("text-white");
    card.classList.remove("text-dark");
  }
}

function isLightColor(color) {
  const rgb = hexToRgb(color.trim());
  if (!rgb) return false;
  const brightness = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return brightness > 0.6;
}

function hexToRgb(hex) {
  const cleanHex = hex.replace("#", "");
  if (cleanHex.length !== 6) return null;
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return { r, g, b };
}

function renderPokemonCards(pokemonList, onCardClick) {
  const fragment = document.createDocumentFragment();
  pokemonList.forEach((pokemon) => {
    const card = createCardElement(pokemon, () => onCardClick(pokemon));
    fragment.appendChild(card);
  });
  return fragment;
}

async function displayPokemon(pokemonList, content, onCardClick, reset = true) {
  const detailsList = await fetchDetailsIfNeeded(pokemonList);
  const fragment = renderPokemonCards(detailsList, onCardClick);

  if (reset) content.innerHTML = "";
  content.appendChild(fragment);
}

function buildTypeBadges(pokemon) {
  return pokemon.types
    .map(
      (typeInfo) => `
        <span class="badge rounded-pill m-1 type-badge-shadow type-${
          typeInfo.type.name
        }">
          ${capitalizeName(typeInfo.type.name)}
        </span>
      `
    )
    .join("");
}

function getStatColor(value) {
  if (value < 40) return "#ff6b6b";
  if (value < 70) return "#ff9f43";
  if (value < 100) return "#ffe74e";
  return "#00b894";
}

function buildStatBars(pokemon) {
  return pokemon.stats
    .map((statInfo) =>
      getStatBarHTML(statInfo, getStatColor(statInfo.base_stat))
    )
    .join("");
}

function updateModalContent(modalTitle, modalBody, pokemon) {
  const typesHTML = buildTypeBadges(pokemon);
  const statsHTML = buildStatBars(pokemon);

  modalTitle.textContent = `${capitalizeName(pokemon.name)} #${pokemon.id}`;
  modalBody.innerHTML = getModalBodyHTML(pokemon, typesHTML, statsHTML);
  const modalContent = document.querySelector(".modal-content");
  setModalBackground(modalContent, pokemon);
}

function isDarkTextType(type) {
  const darkTextTypes = ["normal", "fairy", "poison", "flying"];
  return darkTextTypes.includes(type);
}

function setModalBackground(modalContent, pokemon) {
  modalContent.className = "modal-content";
  if (pokemon.types.length > 0) {
    const mainType = pokemon.types[0].type.name;
    modalContent.classList.add(`modal-bg-${mainType}`);
    if (isDarkTextType(mainType)) {
      modalContent.classList.remove("text-white");
      modalContent.classList.add("text-dark");
    } else {
      modalContent.classList.add("text-white");
    }
  }
}

function updateModalNavigation(prevBtn, nextBtn, currentIndex, totalPokemon) {
  prevBtn.classList.toggle("d-none", currentIndex <= 0);
  prevBtn.disabled = currentIndex <= 0;
  nextBtn.classList.toggle("d-none", currentIndex >= totalPokemon - 1);
  nextBtn.disabled = currentIndex >= totalPokemon - 1;
  document.onkeydown = function (e) {
    if (e.key === "ArrowLeft" && currentIndex > 0) {
      prevBtn.click();
    }
    if (e.key === "ArrowRight" && currentIndex < totalPokemon - 1) {
      nextBtn.click();
    }
  };
}
