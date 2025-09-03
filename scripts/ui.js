// ui.js

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
    dark: "#4B4B4B",
    steel: "#afc4d5",
    ice: "#a1c4fd",
    ghost: "#7c538c",
  };
  return colors[type] || "#777";
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

async function displayPokemon(pokemonList, content, onCardClick, reset = true) {
  const fragment = document.createDocumentFragment();
  const needsDetails = pokemonList[0] && pokemonList[0].url;
  let detailsList = [];

  if (needsDetails) {
    const promises = pokemonList.map((p) => fetchPokemonDetails(p.url));
    detailsList = await Promise.all(promises);
  } else {
    detailsList = pokemonList;
  }

  detailsList.forEach((pokemon) => {
    const card = createPokemonCard(pokemon, () => onCardClick(pokemon));
    fragment.appendChild(card);
  });

  if (reset) content.innerHTML = "";
  content.appendChild(fragment);
}

function updateModalContent(modalTitle, modalBody, pokemon) {
  const typesHTML = pokemon.types
    .map(
      (typeInfo) => `
    <span class="badge rounded-pill m-1 type-badge-shadow" style="background-color: ${getTypeColor(
      typeInfo.type.name
    )};">
      ${typeInfo.type.name}
    </span>
  `
    )
    .join("");

  const statsHTML = pokemon.stats
    .map((statInfo) =>
      getStatBarHTML(statInfo, getStatColor(statInfo.base_stat))
    )
    .join("");

  modalTitle.textContent = `${pokemon.name} #${pokemon.id}`;
  modalBody.innerHTML = getModalBodyHTML(pokemon, typesHTML, statsHTML);
}

function setModalBackground(modalContent, pokemon) {
  modalContent.className = "modal-content";

  if (pokemon.types.length > 0) {
    const mainType = pokemon.types[0].type.name;
    modalContent.classList.add(`modal-bg-${mainType}`);
    const darkTextTypes = ["normal", "fairy", "poison", "flying"];
    if (darkTextTypes.includes(mainType)) {
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
