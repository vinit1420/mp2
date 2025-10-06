import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./PokemonDetail.css";

interface Pokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string;
  };
  types: { type: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
  abilities: { ability: { name: string } }[];
}

const PokemonDetail: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!name) return;
    api
      .get(`pokemon/${name}`)
      .then((res) => {
        setPokemon(res.data);
        setError(false);
      })
      .catch(() => setError(true));
  }, [name]);

  const goToPrev = () => {
    if (pokemon && pokemon.id > 1) {
      navigate(`/pokemon/${pokemon.id - 1}`);
    }
  };

  const goToNext = () => {
    if (pokemon) {
      navigate(`/pokemon/${pokemon.id + 1}`);
    }
  };

  if (error) {
    return <p style={{ textAlign: "center" }}>Pokémon not found!</p>;
  }

  if (!pokemon) {
    return <p style={{ textAlign: "center" }}>Loading...</p>;
  }

  return (
    <div className="detail-container">
      <h2>
        #{pokemon.id} {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
      </h2>
      <img src={pokemon.sprites.front_default} alt={pokemon.name} />

      <div className="info-section">
        <h3>Types:</h3>
        <p>{pokemon.types.map((t) => t.type.name).join(", ")}</p>

        <h3>Abilities:</h3>
        <p>{pokemon.abilities.map((a) => a.ability.name).join(", ")}</p>

        <h3>Stats:</h3>
        <ul>
          {pokemon.stats.map((s) => (
            <li key={s.stat.name}>
              {s.stat.name}: {s.base_stat}
            </li>
          ))}
        </ul>
      </div>

      <div className="nav-buttons">
        <button onClick={goToPrev}>⬅ Prev</button>
        <button onClick={goToNext}>Next ➡</button>
      </div>
    </div>
  );
};

export default PokemonDetail;

