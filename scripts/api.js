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
