import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <h2>Pokedex</h2>
      <div>
        <Link to="/">Home</Link>
        <Link to="/gallery">Gallery</Link>
      </div>
    </nav>
  );
};

export default Navbar;