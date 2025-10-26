// src/interfaces.ts

export type NumeroTablero = number; // 0..99

export interface IParticipanteData {
  id?: string;
  nombre: string;
  email: string;
  telefono?: string;
}

export interface IParticipante {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
}

export interface IReserva {
  numero: NumeroTablero;
  participanteId: string;
}

export type ResultadoSorteo =
  | { tipo: 'ganador'; numero: NumeroTablero; participante: IParticipante }
  | { tipo: 'desierto'; numero: NumeroTablero };
