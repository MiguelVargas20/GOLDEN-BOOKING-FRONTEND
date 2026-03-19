import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CardReservaD from "../../components/CardReservas";

import golf from "../../assets/EspaciosDeportivos/golf.png";
import tenis from "../../assets/EspaciosDeportivos/tennis.png";
import futbol from "../../assets/EspaciosDeportivos/futbol.png";
import basquet from "../../assets/EspaciosDeportivos/basquet.png";
import piscina from "../../assets/EspaciosDeportivos/piscina.png";

import { BsCalendar4 } from "react-icons/bs";
import { BsArrowCounterclockwise } from "react-icons/bs";

function ReservasDCatalogo() {
  const [ruta, setRuta] = useState("");
  const [text, setText] = useState("");
  const navigate = useNavigate();

  const add = ({ img, text }) => {
    navigate("/reservas-deportivas/reservar-espacio", {
      state: {
        ruta: img,
        text: text,
      },
    });
  };

  return (
    <div className="reservas-container">

      {/* TITULO */}
        <h1 className="titulo-reservas">
        Reservas de <span>Espacios</span>
      </h1>

      {/* BOTONES */}
      <div className="botones-reservas">
        <button
          className="btn-reserva gestionar"
          onClick={() => navigate("/reservas-deportivas/gestionar")}>
            <BsCalendar4 />
          Gestionar Reservas
        </button>

        <button
          className="btn-reserva mis"
          onClick={() => navigate("/reservas-deportivas/mis-reservas")}
        > <BsArrowCounterclockwise />
          Mis Reservas
        </button>
      </div>

      {/* CATEGORIAS */}
      <div className="categorias-header">
        <h2>Categorías Deportivas</h2>
        <span
          className="ver-todo"
          onClick={() => navigate("/reservas-deportivas/categorias")}
        >
          Ver Todo →
        </span>
      </div>

      {/* CARDS */}
      <div className="cards-deportes">

        <CardReservaD
          img={futbol}
          titulo="Soccer"
          add={() => add({ img: futbol, text: "FUTBOL" })}
        />

        <CardReservaD
          img={basquet}
          titulo="Basketball"
          add={() => add({ img: basquet, text: "BALONCESTO" })}
        />

        <CardReservaD
          img={tenis}
          titulo="Tennis"
          add={() => add({ img: tenis, text: "TENIS" })}
        />

        <CardReservaD
          img={piscina}
          titulo="Swimming"
          add={() => add({ img: piscina, text: "PISCINA" })}
        />

        <CardReservaD
          img={golf}
          titulo="Golf"
          add={() => add({ img: golf, text: "GOLF" })}
        />

      </div>
    </div>
  );
}

export default ReservasDCatalogo;