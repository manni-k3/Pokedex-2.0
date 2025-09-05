function getStatBarHTML(statInfo, color) {
  const widthPercentage = (statInfo.base_stat / 150) * 100;
  return `
      <div class="stat-row">
        <p class="stat-label">${statInfo.stat.name}</p>
        <div class="progress">
          <div class="progress-bar" role="progressbar" style="width: ${widthPercentage}%; background-color: ${color};"></div>
        </div>
        <p class="mb-0 ms-2 fw-bold stat-value">${statInfo.base_stat}</p>
      </div>
    `;
}

function getPokemonCardHTML(pokemon) {
  return `
      <div class="card shadow-lg bg-custom card-rounded cursor-pointer">
        <div class="p-2 text-center">
          <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" class="img-fluid" />
          <p class="fw-bold">${pokemon.name}</p>
          <p class="text-muted">#${pokemon.id}</p>
        </div>
      </div>
    `;
}

function getModalBodyHTML(pokemon, typesHTML, statsHTML) {
  return `
      <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" class="img-fluid pokemon-modal-img" />
      <div class="d-flex justify-content-center">${typesHTML}</div>
      <div class="stats-container mt-3">${statsHTML}</div>
    `;
}
