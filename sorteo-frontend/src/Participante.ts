import type { IParticipante, IParticipanteData } from './interfaces';
import { ValidationError } from './errors';


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
        // --- APLICAR TRIM Y OBTENER VALORES LIMPIOS ---
        const trimmedEmail = data.email?.trim() ?? '';
        const trimmedNombre = data.nombre?.trim() ?? '';

        // 1. Validar campos obligatorios usando los valores limpios
        if (!trimmedNombre || !trimmedEmail) {
            throw new ValidationError('Nombre y email son obligatorios.');
        }

        // 2. Validar formato de email usando el valor limpio
        if (!isValidEmail(trimmedEmail)) {
            throw new ValidationError('Email no válido.');
        }
        
        // 3. Asignar los valores limpios
        this.id = data.id ?? genId();
        this.nombre = trimmedNombre;
        this.email = trimmedEmail;
        this.telefono = data.telefono?.trim();
    }
}