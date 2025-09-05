function buildTypeBadges(pokemon) {
  return pokemon.types
    .map(
      (typeInfo) => `
      <span class="badge rounded-pill m-1 type-badge-shadow type-${typeInfo.type.name}">
        ${typeInfo.type.name}
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

function createPokemonCard(pokemon, onClick) {
  const column = document.createElement("div");
  column.classList.add("col-12", "col-sm-6", "col-md-4", "col-lg-3");
  column.innerHTML = getPokemonCardHTML(pokemon);

  const card = column.querySelector(".card");
  card.addEventListener("click", onClick);

  return column;
}

async function fetchPokemonDetailsList(pokemonList) {
  const needsDetails = pokemonList[0] && pokemonList[0].url;
  if (!needsDetails) return pokemonList;

  const promises = pokemonList.map((p) => fetchPokemonDetails(p.url));
  return await Promise.all(promises);
}

function renderPokemonCards(pokemonList, onCardClick) {
  const fragment = document.createDocumentFragment();
  pokemonList.forEach((pokemon) => {
    const card = createPokemonCard(pokemon, () => onCardClick(pokemon));
    fragment.appendChild(card);
  });
  return fragment;
}

async function displayPokemon(pokemonList, content, onCardClick, reset = true) {
  const detailsList = await fetchPokemonDetailsList(pokemonList);
  const fragment = renderPokemonCards(detailsList, onCardClick);

  if (reset) content.innerHTML = "";
  content.appendChild(fragment);
}

function buildTypeBadges(pokemon) {
  return pokemon.types
    .map(
      (typeInfo) => `
        <span class="badge rounded-pill m-1 type-badge-shadow type-${typeInfo.type.name}">
          ${typeInfo.type.name}
        </span>
      `
    )
    .join("");
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

  modalTitle.textContent = `${pokemon.name} #${pokemon.id}`;
  modalBody.innerHTML = getModalBodyHTML(pokemon, typesHTML, statsHTML);
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
  nextBtn.classList.toggle("d-none", currentIndex >= totalPokemon - 1);
}
