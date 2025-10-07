import React, { useEffect, useState } from "react";
import axios from "axios";
import PokemonCard from "../components/PokemonCard";
import "../pages/Gallery.css";

interface Pokemon {
  name: string;
  url: string;
  stats?: {
    hp: number;
    attack: number;
    defense: number;
  };
  types?: string[];
}

const Gallery: React.FC = () => {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [filteredPokemons, setFilteredPokemons] = useState<Pokemon[]>([]);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [types, setTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<string>("asc");
  const [loading, setLoading] = useState(true);

  // 🧠 Fetch available Pokémon types for navbar
  useEffect(() => {
    const fetchTypes = async () => {
      const response = await axios.get("https://pokeapi.co/api/v2/type");
      const typeNames = response.data.results.map((t: any) => t.name);
      setTypes(["all", ...typeNames]);
    };
    fetchTypes();
  }, []);

  // 🧠 Fetch Pokémon data
  useEffect(() => {
    const fetchPokemons = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "https://pokeapi.co/api/v2/pokemon?limit=500"
        );
        const results = response.data.results;

        // Fetch each Pokémon’s stats & types
        const detailedData = await Promise.all(
          results.map(async (p: Pokemon) => {
            const detail = await axios.get(p.url);
            const stats = detail.data.stats;
            const types = detail.data.types.map((t: any) => t.type.name);

            return {
              name: p.name,
              url: p.url,
              stats: {
                hp: stats[0].base_stat,
                attack: stats[1].base_stat,
                defense: stats[2].base_stat,
              },
              types,
            };
          })
        );

        setPokemons(detailedData);
        setFilteredPokemons(detailedData);
      } catch (error) {
        console.error("Error fetching Pokémon:", error);
      }
      setLoading(false);
    };

    fetchPokemons();
  }, []);

  // 🧮 Handle type filtering
  useEffect(() => {
    if (selectedType === "all") {
      setFilteredPokemons(pokemons);
    } else {
      setFilteredPokemons(
        pokemons.filter((p) => p.types?.includes(selectedType))
      );
    }
  }, [selectedType, pokemons]);

  // 🧩 Handle sorting
  const sortedPokemons = [...filteredPokemons].sort((a, b) => {
    if (sortBy === "name") {
      return sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (a.stats && b.stats) {
      return sortOrder === "asc"
        ? a.stats[sortBy as keyof typeof a.stats] -
            b.stats[sortBy as keyof typeof b.stats]
        : b.stats[sortBy as keyof typeof b.stats] -
            a.stats[sortBy as keyof typeof a.stats];
    }
    return 0;
  });

  return (
    <div className="gallery">
      <h2>Pokémon Gallery</h2>

      {/* 🟨 Type Nav Bar */}
      <div className="type-navbar">
        {types.map((type) => (
          <button
            key={type}
            className={`type-btn ${
              selectedType === type ? "active-type" : ""
            }`}
            onClick={() => setSelectedType(type)}
          >
            {type.toUpperCase()}
          </button>
        ))}
      </div>

      {/* 🔽 Sort Filters */}
      <div className="filters top-filters">
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

      {/* 🧩 Pokémon Cards */}
      {loading ? (
        <p>Loading Pokémon...</p>
      ) : (
        <div className="gallery-grid">
          {sortedPokemons.map((p) => (
            <PokemonCard key={p.name} name={p.name} url={p.url} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery;
