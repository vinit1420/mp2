import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import "./PokemonCard.css";

interface Props {
  name: string;
  url: string;
}

interface PokemonData {
  sprites: { front_default: string };
}

const PokemonCard: React.FC<Props> = ({ name }) => {
  const [data, setData] = useState<PokemonData | null>(null);

  useEffect(() => {
    api.get(`pokemon/${name}`).then((res) => setData(res.data));
  }, [name]);

  return (
    <Link to={`/pokemon/${name}`} className="pokemon-card">
      {data ? (
        <>
          <img src={data.sprites.front_default} alt={name} />
          <p>{name}</p>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </Link>
  );
};

export default PokemonCard;
