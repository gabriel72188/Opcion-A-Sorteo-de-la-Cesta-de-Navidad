// src/Participante.ts
import { IParticipante, IParticipanteData } from './interfaces';
import { ValidationError } from './errors';

/**
 * Generador de id simple (browser-friendly).
 */
let COUNTER = 0;
function genId(): string {
  COUNTER += 1;
  return `p-${Date.now()}-${COUNTER}`;
}

function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export class Participante implements IParticipante {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;

  constructor(data: IParticipanteData) {
    if (!data.nombre || !data.email) {
      throw new ValidationError('Nombre y email son obligatorios.');
    }
    if (!isValidEmail(data.email)) {
      throw new ValidationError('Email no válido.');
    }
    this.id = data.id ?? genId();
    this.nombre = data.nombre.trim();
    this.email = data.email.trim();
    this.telefono = data.telefono?.trim();
  }
}
