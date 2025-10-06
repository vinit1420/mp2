import React, { useState, useEffect } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import "./Home.css";
import pokemonLogo from "../pages/pokemon_logo.svg";

interface Pokemon {
  name: string;
  url: string;
}

interface Type {
  name: string;
  url: string;
}

interface TypeResponse {
  pokemon: { pokemon: { name: string; url: string } }[];
}

interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
}

const statsCache: Record<string, PokemonStats> = {};

const Home: React.FC = () => {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [types, setTypes] = useState<Type[]>([]);
  const [selectedType, setSelectedType] = useState("");
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<Pokemon[]>([]);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);

  useEffect(() => {
    api.get("pokemon?limit=151").then((res) => setPokemons(res.data.results));
    api.get("type").then((res) => setTypes(res.data.results));
  }, []);

  useEffect(() => {
    const getFilteredResults = async () => {
      if (search.trim() === "" && selectedType === "") {
        setSuggestions([]);
        setNoResults(false);
        return;
      }

      setLoading(true);
      let results = pokemons;

      // Filter by name
      if (search.trim() !== "") {
        results = results.filter((p) =>
          p.name.toLowerCase().startsWith(search.toLowerCase())
        );
      }

      // Filter by type
      if (selectedType) {
        try {
          const typeRes = await api.get<TypeResponse>(`type/${selectedType}`);
          const typePokemonNames = typeRes.data.pokemon.map(
            (p) => p.pokemon.name
          );
          results = results.filter((p) => typePokemonNames.includes(p.name));
        } catch (err) {
          console.error("Error fetching type:", err);
        }
      }

      // Sorting
      if (sortBy === "name") {
        results = [...results].sort((a, b) =>
          sortOrder === "asc"
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name)
        );
      } else {
        results = await sortByStat(results, sortBy as keyof PokemonStats);
        if (sortOrder === "asc") results.reverse();
      }

      setSuggestions(results.slice(0, 20));
      setNoResults(results.length === 0);
      setLoading(false);
    };

    getFilteredResults();
  }, [search, selectedType, pokemons, sortBy, sortOrder]);

  const sortByStat = async (
    pokemonList: Pokemon[],
    statKey: keyof PokemonStats
  ): Promise<Pokemon[]> => {
    const detailedData = await Promise.all(
      pokemonList.map(async (p) => {
        if (!statsCache[p.name]) {
          try {
            const res = await api.get(`pokemon/${p.name}`);
            const statsArray = res.data.stats;
            statsCache[p.name] = {
              hp: statsArray.find((s: any) => s.stat.name === "hp").base_stat,
              attack: statsArray.find((s: any) => s.stat.name === "attack")
                .base_stat,
              defense: statsArray.find((s: any) => s.stat.name === "defense")
                .base_stat,
            };
          } catch {
            statsCache[p.name] = { hp: 0, attack: 0, defense: 0 };
          }
        }
        return { ...p, statValue: statsCache[p.name][statKey] };
      })
    );
    return detailedData.sort((a, b) => b.statValue - a.statValue);
  };

  const getPokemonId = (url: string): string => {
    const parts = url.split("/").filter(Boolean);
    return parts[parts.length - 1];
  };

  return (
  <div className="home">
    <div className="pokedex-container">
      {/* Pokémon Logo */}
      <img src={pokemonLogo} alt="Pokémon Logo" className="pokemon-logo" />

      {/* Filters Row */}
      <div className="filters top-filters">
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="">All Types</option>
          {types.map((t) => (
            <option key={t.name} value={t.name}>
              {t.name}
            </option>
          ))}
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">Sort by Name</option>
          <option value="hp">Sort by HP</option>
          <option value="attack">Sort by Attack</option>
          <option value="defense">Sort by Defense</option>
        </select>

        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search Pokémon by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Dropdown results */}
      <div className="dropdown">
        {loading && <p>Loading...</p>}
        {!loading && suggestions.length > 0 && (
          <ul className="suggestion-list">
            {suggestions.map((p) => {
              const id = getPokemonId(p.url);
              const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

              return (
                <li key={p.name}>
                  <Link to={`/pokemon/${p.name}`}>
                    <img
                      src={imageUrl}
                      alt={p.name}
                      width={40}
                      height={40}
                      className="sprite"
                    />
                    <span>{p.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        {noResults && !loading && <p>No Pokémon found!</p>}
      </div>
    </div>
  </div>
);
};

export default Home;
