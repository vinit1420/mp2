import React, { useState, useEffect } from "react";
import api from "../services/api";
import PokemonCard from "../components/PokemonCard";
import "./Gallery.css";

interface Type {
  name: string;
  url: string;
}

interface Pokemon {
  name: string;
  url: string;
}

interface TypeResponse {
  pokemon: { pokemon: { name: string; url: string } }[];
}

const Gallery: React.FC = () => {
  const [types, setTypes] = useState<Type[]>([]);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all types once
  useEffect(() => {
    api.get("type").then((res) => setTypes(res.data.results));
  }, []);

  // Fetch Pokémon list based on selected type
  useEffect(() => {
    const fetchPokemons = async () => {
      setLoading(true);
      try {
        if (selectedType === "all") {
          const res = await api.get("pokemon?limit=151");
          setPokemons(res.data.results);
        } else {
          const res = await api.get<TypeResponse>(`type/${selectedType}`);
          const typePokemons = res.data.pokemon.map((p) => p.pokemon);
          setPokemons(typePokemons);
        }
      } catch (err) {
        console.error("Error fetching Pokémon:", err);
      }
      setLoading(false);
    };

    fetchPokemons();
  }, [selectedType]);

  return (
    <div className="gallery">
      <h2>Pokémon Gallery</h2>

      {/* 🔥 Type Navigation Bar */}
      <div className="type-nav">
        <button
          className={selectedType === "all" ? "active" : ""}
          onClick={() => setSelectedType("all")}
        >
          All
        </button>

        {types.map((t) => (
          <button
            key={t.name}
            className={selectedType === t.name ? "active" : ""}
            onClick={() => setSelectedType(t.name)}
          >
            {t.name.charAt(0).toUpperCase() + t.name.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading Pokémon...</p>
      ) : (
        <div className="gallery-grid">
          {pokemons.slice(0, 60).map((p) => (
            <PokemonCard key={p.name} name={p.name} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery;
