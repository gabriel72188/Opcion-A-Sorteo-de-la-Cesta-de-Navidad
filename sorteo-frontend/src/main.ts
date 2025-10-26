import { Sorteo } from "./Sorteo";
const sorteo = new Sorteo();

document.addEventListener("DOMContentLoaded", () => {
    const tablero = document.getElementById("tablero") as HTMLElement;
    const formParticipante = document.getElementById("form-participante") as HTMLFormElement;
    const selectorParticipantes = document.getElementById("selector-participantes") as HTMLSelectElement;
    const formSorteo = document.getElementById("form-sorteo") as HTMLFormElement;
    const inputGanador = document.getElementById("numero-ganador") as HTMLInputElement;
    const resultadoSorteo = document.getElementById("resultado-sorteo") as HTMLElement;
    const stats = document.getElementById("stats") as HTMLElement;

    if (!tablero || !formParticipante || !selectorParticipantes || !formSorteo || !inputGanador || !resultadoSorteo || !stats) {
        console.error("Error: Falta algún elemento del DOM");
        return;
    }

    generarTablero();

    formParticipante.addEventListener("submit", (e) => {
        e.preventDefault();

        const nombre = (document.getElementById("nombre") as HTMLInputElement).value;
        const email = (document.getElementById("email") as HTMLInputElement).value;
        const telefono = (document.getElementById("telefono") as HTMLInputElement).value;

        const participanteData = { nombre, email, telefono };

        try {
            sorteo.registrarParticipante(participanteData);

            actualizarSelector();
            actualizarStats();

            formParticipante.reset();
        } catch (error) {
            alert((error as Error).message);
        }
    });

    function generarTablero() {
    tablero.innerHTML = "";
    for (let i = 0; i < 100; i++) {
        const casilla = document.createElement("div");
        casilla.className = "casilla"; 

        
        const numeroEl = document.createElement("div");
        numeroEl.className = "numero";
        numeroEl.textContent = i.toString().padStart(2, "0");

        const nombreEl = document.createElement("div");
        nombreEl.className = "nombre";
        nombreEl.textContent = "Libre"; 
        
        casilla.appendChild(numeroEl);
        casilla.appendChild(nombreEl);
        

        casilla.addEventListener("click", () => reservar(i));
        tablero.appendChild(casilla);
    }
    actualizarUI(); 
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
        
        if (isNaN(ganador) || ganador < 0 || ganador > 99) {
             alert("El número debe ser entero entre 0 y 99.");
             return;
        }
        
        const participante = sorteo.buscarGanador(ganador);

        if (participante) {
            resultadoSorteo.innerHTML = `GANADOR: <b>${participante.nombre}</b>`;
        } else {
            resultadoSorteo.innerHTML = `El número ${ganador.toString().padStart(2, '0')} no fue reservado.`;
        }
    });

    function actualizarUI() {
    const casillas = tablero.children;
    for (let i = 0; i < casillas.length; i++) {
        const p = sorteo.obtenerPropietario(i); 
        const casilla = casillas[i] as HTMLElement;
        
        
        const nombreEl = casilla.querySelector(".nombre") as HTMLElement;

        if (p) {
            casilla.classList.add("ocupado");
            casilla.classList.remove("libre");
            casilla.title = p.nombre;
            if (nombreEl) {
                
                nombreEl.textContent = p.nombre.split(" ")[0]; 
            }
        } else {
            casilla.classList.add("libre");
            casilla.classList.remove("ocupado");
            casilla.title = "Libre";
            if (nombreEl) {
                nombreEl.textContent = "Libre";
            }
        }
    }
    actualizarStats();
}

    function actualizarSelector() {
        selectorParticipantes.innerHTML = `<option value="">-- Selecciona un participante --</option>`;
        sorteo.listParticipantes().forEach((p) => {
            const option = document.createElement("option");
            option.value = p.id;
            option.textContent = p.nombre;
            selectorParticipantes.appendChild(option);
        });
    }

    function actualizarStats() {
    
    const statsData = sorteo.estadisticas(); 
    
    stats.innerHTML = `
        <p><b>Ocupados:</b> ${statsData.ocupados}/100</p>
        <p><b>Libres:</b> ${statsData.libres}</p>
        <p><b>Participantes:</b> ${statsData.participantesUnicos}</p>
        <p><b>Ocupación:</b> ${statsData.porcentajeOcupacion}%</p>
    `;
    
}
    
    actualizarSelector();
    actualizarStats();
});