// src/main.ts
import { Sorteo } from './Sorteo';
import { Participante } from './Participante';
import { IParticipante } from './interfaces';
import { AlreadyOccupiedError, NotOccupiedError } from './errors';

const app = document.getElementById('app') || document.body;
const tableroEl = document.getElementById('tablero')!;
const selectParticipantes = document.getElementById('select-participantes') as HTMLSelectElement;
const formParticipante = document.getElementById('form-participante') as HTMLFormElement;
const estadisticasEl = document.getElementById('estadisticas')!;
const resultadoSorteoEl = document.getElementById('resultado-sorteo')!;
const inputSorteo = document.getElementById('input-sorteo') as HTMLInputElement;
const btnSorteo = document.getElementById('btn-sorteo') as HTMLButtonElement;
const btnLiberar = document.getElementById('liberar-btn') as HTMLButtonElement;

const sorteio = new Sorteo();

function actualizarSelect() {
  const participantes = sorteio.listParticipantes();
  selectParticipantes.innerHTML = '<option value=\"\">-- ninguno --</option>' +
    participantes.map(p => `<option value="${p.id}">${escapeHtml(p.nombre)} (${escapeHtml(p.email)})</option>`).join('');
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m] || m));
}

function renderTablero() {
  tableroEl.innerHTML = '';
  const lista = sorteio.listarTablero();
  lista.forEach((item, idx) => {
    const btn = document.createElement('button');
    btn.className = 'casilla';
    btn.dataset.numero = String(idx);
    btn.type = 'button';
    btn.textContent = item.numero + (item.ocupado ? `\n${item.participante?.nombre}` : '');
    if (item.ocupado) btn.classList.add('ocupado');
    btn.addEventListener('click', () => onCasillaClick(idx));
    tableroEl.appendChild(btn);
  });
  actualizarEstadisticas();
}

function actualizarEstadisticas() {
  const s = sorteio.estadisticas();
  estadisticasEl.innerHTML = `
    <strong>Estadísticas</strong>
    <div>Ocupados: ${s.ocupados}</div>
    <div>Libres: ${s.libres}</div>
    <div>Participantes: ${s.participantesUnicos}</div>
    <div>% Ocupación: ${s.porcentajeOcupacion}%</div>
  `;
}

function onCasillaClick(numero: number) {
  // si hay participante seleccionado, reservar, si no mostrar mensaje
  const pid = selectParticipantes.value;
  if (!pid) {
    alert('Selecciona un participante antes de reservar una casilla.');
    return;
  }
  try {
    sorteio.reservarNumero(numero, pid);
    renderTablero();
    actualizarSelect();
  } catch (e: unknown) {
    if (e instanceof AlreadyOccupiedError) {
      alert(e.message);
    } else if (e instanceof Error) {
      alert(e.message);
    }
  }
}

formParticipante.addEventListener('submit', (ev) => {
  ev.preventDefault();
  const fd = new FormData(formParticipante);
  const nombre = String(fd.get('nombre') || '').trim();
  const email = String(fd.get('email') || '').trim();
  const telefono = String(fd.get('telefono') || '').trim();

  try {
    const p = sorteio.addParticipante({ nombre, email, telefono: telefono || undefined });
    actualizarSelect();
    renderTablero();
    formParticipante.reset();
    alert(`Participante ${p.nombre} creado`);
  } catch (err: any) {
    alert(err.message || 'Error');
  }
});

btnSorteo.addEventListener('click', (ev) => {
  ev.preventDefault();
  const val = inputSorteo.value.trim();
  const num = Number(val);
  if (!/^\d{1,2}$/.test(val) || Number.isNaN(num) || num < 0 || num > 99) {
    resultadoSorteoEl.textContent = 'Introduce un número entre 00 y 99';
    return;
  }
  const r = sorteio.realizarSorteo(num);
  if (r.tipo === 'desierto') {
    resultadoSorteoEl.textContent = `Desierto: nadie tenía ${r.numero.toString().padStart(2, '0')}`;
  } else {
    resultadoSorteoEl.textContent = `Ganador: ${r.participante.nombre} — Email: ${r.participante.email}`;
  }
});

btnLiberar.addEventListener('click', () => {
  // liberar la casilla que esté seleccionada visualmente (no hay selección persistente),
  // pedimos número al usuario.
  const val = prompt('Introduce número a liberar (00-99):');
  if (!val) return;
  const num = Number(val);
  if (!Number.isInteger(num) || num < 0 || num > 99) {
    alert('Número inválido');
    return;
  }
  try {
    sorteio.liberarNumero(num);
    renderTablero();
  } catch (e: unknown) {
    if (e instanceof NotOccupiedError) {
      alert(e.message);
    } else if (e instanceof Error) {
      alert(e.message);
    }
  }
});

// inicial render
renderTablero();
actualizarSelect();

