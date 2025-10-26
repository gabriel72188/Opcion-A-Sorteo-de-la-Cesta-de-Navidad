export type NumeroTablero = number; 

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

export interface IEstadisticas {
  ocupados: number;
  libres: number;
  totalParticipantes: number;
  porcentajeOcupacion: number;
}

export type ResultadoSorteo =
  | { tipo: 'ganador'; numero: NumeroTablero; participante: IParticipante }
  | { tipo: 'desierto'; numero: NumeroTablero };
