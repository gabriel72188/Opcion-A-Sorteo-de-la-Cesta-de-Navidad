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
        this.cargarEstado();
    }

    inicializarTableroVacio() {
        this.participantes = new Map();
        this.numeroAParticipante = new Map();
        for (let i = 0; i < 100; i++) this.numeroAParticipante.set(i, null);
    }

    guardarEstado() {
        try {
            
            const participantes = Array.from(this.participantes.entries());
            const numeros = Array.from(this.numeroAParticipante.entries());
            
            const estado = { participantes, numeros };
            localStorage.setItem('sorteoEstado', JSON.stringify(estado));
        } catch (e) {
            console.error("Error al guardar estado en localStorage", e);
        }
    }

    cargarEstado() {
        const estadoGuardado = localStorage.getItem('sorteoEstado');

        if (!estadoGuardado) {
            this.inicializarTableroVacio();
            return;
        }

        try {
            const { participantes, numeros } = JSON.parse(estadoGuardado);
            
           
            this.participantes = new Map(
                participantes.map(([id, pData]: [string, IParticipanteData]) => {
                    return [id, new Participante(pData)];
                })
            );

            
            this.numeroAParticipante = new Map(numeros);

            
            if (this.numeroAParticipante.size !== 100) {
                console.warn("Datos de tablero corruptos, reiniciando tablero.");
                this.inicializarTableroVacio();
                this.participantes = new Map(); 
            }

        } catch (e) {
            console.error("Error al cargar estado, reiniciando.", e);
            this.inicializarTableroVacio();
        }
    }

    registrarParticipante(data: IParticipanteData): IParticipante {
        if (!data.nombre || !data.email) {
            throw new ValidationError('Nombre y email son obligatorios.');
        }

        const emailLower = data.email.toLowerCase();
        for (const p of this.participantes.values()) {
            if (p.email.toLowerCase() === emailLower) {
                throw new DuplicateParticipantError('Ya existe un participante con ese email.');
            }
        }

        const p = new Participante(data);
        this.participantes.set(p.id, p);
        this.guardarEstado();
        return p;
    }

    listParticipantes(): IParticipante[] {
        return Array.from(this.participantes.values());
    }

    asignarNumero(numero: NumeroTablero, participanteId: string): IReserva {
        validateNumero(numero);
        const participante = this.participantes.get(participanteId);
        if (!participante) throw new NotFoundError('Participante no encontrado.');

        const current = this.numeroAParticipante.get(numero);
        if (current) throw new AlreadyOccupiedError(`El número ${numero.toString().padStart(2, '0')} ya está ocupado.`);

        this.numeroAParticipante.set(numero, participanteId);
        this.guardarEstado();
        return { numero, participanteId };
    }

    liberarNumero(numero: NumeroTablero): IReserva {
        validateNumero(numero);
        const current = this.numeroAParticipante.get(numero);
        if (!current) throw new NotOccupiedError(`El número ${numero.toString().padStart(2, '0')} no está ocupado.`);
        this.numeroAParticipante.set(numero, null);
        this.guardarEstado();
        return { numero, participanteId: current };
    }

    obtenerPropietario(numero: NumeroTablero): IParticipante | undefined {
        validateNumero(numero);
        const pid = this.numeroAParticipante.get(numero);
        if (!pid) return undefined;
        return this.participantes.get(pid);
    }
    
    numerosDeParticipante(participanteId: string): NumeroTablero[] {
        if (!this.participantes.has(participanteId)) throw new NotFoundError('Participante no encontrado.');
        const arr: NumeroTablero[] = [];
        for (const [num, pid] of this.numeroAParticipante.entries()) {
            if (pid === participanteId) arr.push(num);
        }
        return arr.sort((a, b) => a - b);
    }

    buscarGanador(numero: NumeroTablero): IParticipante | undefined {
        validateNumero(numero);
        const pid = this.numeroAParticipante.get(numero);
        if (!pid) return undefined;
        const participante = this.participantes.get(pid);
        if (!participante) throw new Error('Inconsistencia: participante no encontrado.');
        return participante;
    }

    totalNumerosReservados(): number {
        return Array.from(this.numeroAParticipante.values()).filter(Boolean).length;
    }

    estadisticas() {
        const ocupados = Array.from(this.numeroAParticipante.values()).filter(Boolean).length;
        const libres = 100 - ocupados;
        const participantesUnicos = this.participantes.size;
        const porcentajeOcupacion = parseFloat(((ocupados / 100) * 100).toFixed(2));
        return { ocupados, libres, participantesUnicos, porcentajeOcupacion };
    }
}
