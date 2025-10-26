import { Sorteo } from "./Sorteo";
import { Participante } from "./Participante";

const sorteo = new Sorteo();

document.addEventListener("DOMContentLoaded", () => {
  const tablero = document.getElementById("tablero") as HTMLElement;
  const formParticipante = document.getElementById("form-participante") as HTMLFormElement;
  const selectorParticipantes = document.getElementById("selector-participantes") as HTMLSelectElement;
  const formSorteo = document.getElementById("form-sorteo") as HTMLFormElement;
  const inputGanador = document.getElementById("numero-ganador") as HTMLInputElement;
  const resultadoSorteo = document.getElementById("resultado-sorteo") as HTMLElement;
  const stats = document.getElementById("stats") as HTMLElement;

  if (!tablero || !formParticipante || !selectorParticipantes || !formSorteo || !inputGanador) {
    console.error("Error: Falta algún elemento del DOM");
    return;
  }

  generarTablero();

  formParticipante.addEventListener("submit", (e) => {
    e.preventDefault();

    const nombre = (document.getElementById("nombre") as HTMLInputElement).value;
    const email = (document.getElementById("email") as HTMLInputElement).value;
    const telefono = (document.getElementById("telefono") as HTMLInputElement).value;

    const p = new Participante(nombre, email, telefono);
    sorteo.registrarParticipante(p);

    actualizarSelector();
    actualizarStats();

    formParticipante.reset();
  });

  function generarTablero() {
    tablero.innerHTML = "";
    for (let i = 0; i < 100; i++) {
      const casilla = document.createElement("div");
      casilla.className = "casilla";
      casilla.textContent = i.toString().padStart(2, "0");

      casilla.addEventListener("click", () => reservar(i));
      tablero.appendChild(casilla);
    }
  }

  function reservar(num: number) {
    const idParticipante = selectorParticipantes.value;
    if (!idParticipante) {
      alert("Debes seleccionar un participante antes.");
      return;
    }

    try {
      sorteo.asignarNumero(num, idParticipante);
      actualizarUI();
    } catch (error) {
      alert((error as Error).message);
    }
  }

  formSorteo.addEventListener("submit", (e) => {
    e.preventDefault();

    const ganador = parseInt(inputGanador.value);
    const participante = sorteo.buscarGanador(ganador);

    if (participante) {
      resultadoSorteo.innerHTML = `GANADOR: <b>${participante.nombre}</b>`;
    } else {
      resultadoSorteo.innerHTML = `Ningún participante tiene ese número`;
    }
  });

  function actualizarUI() {
    const casillas = tablero.children;
    for (let i = 0; i < casillas.length; i++) {
      const p = sorteo.obtenerPropietario(i);
      const casilla = casillas[i] as HTMLElement;
      casilla.classList.toggle("reservado", !!p);
      casilla.title = p ? p.nombre : "";
    }
    actualizarStats();
  }

  function actualizarSelector() {
    selectorParticipantes.innerHTML = `<option value="">-- Selecciona un participante --</option>`;
    sorteo.participantes.forEach((p) => {
      const option = document.createElement("option");
      option.value = p.id;
      option.textContent = p.nombre;
      selectorParticipantes.appendChild(option);
    });
  }

  function actualizarStats() {
    const totalReservados = sorteo.totalNumerosReservados();
    stats.innerHTML = `
      <p><b>Total Reservados:</b> ${totalReservados}/100</p>
    `;
  }
});
