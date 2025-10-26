// src/Sorteo.ts
import {
  NumeroTablero,
  IParticipante,
  IParticipanteData,
  IReserva,
  ResultadoSorteo
} from './interfaces';
import { Participante } from './Participante';
import {
  ValidationError,
  DuplicateParticipantError,
  NotFoundError,
  AlreadyOccupiedError,
  NotOccupiedError
} from './errors';

function validateNumero(n: number): void {
  if (!Number.isInteger(n) || n < 0 || n > 99) {
    throw new RangeError('El número debe ser entero entre 0 y 99.');
  }
}

export class Sorteo {
  participantes: Map<string, IParticipante> = new Map();
  numeroAParticipante: Map<NumeroTablero, string | null> = new Map();

  constructor() {
    for (let i = 0; i < 100; i++) this.numeroAParticipante.set(i, null);
  }

  addParticipante(data: IParticipanteData): IParticipante {
    if (!data.nombre || !data.email) {
      throw new ValidationError('Nombre y email son obligatorios.');
    }

    // chequear duplicado por email (case-insensitive)
    const emailLower = data.email.toLowerCase();
    for (const p of this.participantes.values()) {
      if (p.email.toLowerCase() === emailLower) {
        throw new DuplicateParticipantError('Ya existe un participante con ese email.');
      }
    }

    const p = new Participante(data);
    this.participantes.set(p.id, p);
    return p;
  }

  listParticipantes(): IParticipante[] {
    return Array.from(this.participantes.values());
  }

  reservarNumero(numero: NumeroTablero, participanteId: string): IReserva {
    validateNumero(numero);
    const participante = this.participantes.get(participanteId);
    if (!participante) throw new NotFoundError('Participante no encontrado.');

    const current = this.numeroAParticipante.get(numero);
    if (current) throw new AlreadyOccupiedError(`El número ${numero.toString().padStart(2,'0')} ya está ocupado.`);

    this.numeroAParticipante.set(numero, participanteId);
    return { numero, participanteId };
  }

  liberarNumero(numero: NumeroTablero): IReserva {
    validateNumero(numero);
    const current = this.numeroAParticipante.get(numero);
    if (!current) throw new NotOccupiedError(`El número ${numero.toString().padStart(2,'0')} no está ocupado.`);
    this.numeroAParticipante.set(numero, null);
    return { numero, participanteId: current };
  }

  estadoNumero(numero: NumeroTablero): { libre: boolean; participante?: IParticipante } {
    validateNumero(numero);
    const pid = this.numeroAParticipante.get(numero);
    if (!pid) return { libre: true };
    const participante = this.participantes.get(pid);
    return { libre: false, participante };
  }

  numerosDeParticipante(participanteId: string): NumeroTablero[] {
    if (!this.participantes.has(participanteId)) throw new NotFoundError('Participante no encontrado.');
    const arr: NumeroTablero[] = [];
    for (const [num, pid] of this.numeroAParticipante.entries()) {
      if (pid === participanteId) arr.push(num);
    }
    return arr.sort((a, b) => a - b);
  }

  realizarSorteo(numero: NumeroTablero): ResultadoSorteo {
    validateNumero(numero);
    const pid = this.numeroAParticipante.get(numero);
    if (!pid) return { tipo: 'desierto', numero };
    const participante = this.participantes.get(pid);
    if (!participante) throw new Error('Inconsistencia: participante no encontrado.');
    return { tipo: 'ganador', numero, participante };
  }

  estadisticas() {
    const ocupados = Array.from(this.numeroAParticipante.values()).filter(Boolean).length;
    const libres = 100 - ocupados;
    const participantesUnicos = this.participantes.size;
    const porcentajeOcupacion = parseFloat(((ocupados / 100) * 100).toFixed(2));
    return { ocupados, libres, participantesUnicos, porcentajeOcupacion };
  }

  listarTablero(): { numero: string; ocupado: boolean; participante?: IParticipante }[] {
    const out: { numero: string; ocupado: boolean; participante?: IParticipante }[] = [];
    for (let i = 0; i < 100; i++) {
      const pid = this.numeroAParticipante.get(i);
      out.push({
        numero: i.toString().padStart(2, '0'),
        ocupado: Boolean(pid),
        participante: pid ? this.participantes.get(pid) : undefined
      });
    }
    return out;
  }
}

