import { Participante } from '../src/Participante';
import { ValidationError } from '../src/errors';
import { IParticipanteData } from '../src/interfaces';

jest.mock('../src/Participante', () => {
    const originalModule = jest.requireActual('../src/Participante');
    let counter = 0;
    const mockGenId = () => {
        counter += 1;
        return `p-mock-id-${counter}`;
    };

    class MockParticipante extends originalModule.Participante {
        constructor(data: IParticipanteData) {
            super({ ...data, id: data.id ?? mockGenId() });
        }
    }

    return {
        ...originalModule,
        Participante: MockParticipante,
    };
});

describe('Participante', () => {
    const validData: IParticipanteData = {
        nombre: ' Ana García ',
        email: 'ana.garcia@test.com ',
        telefono: '123456789',
    };

    // Casos de éxito
    test('debería crear un participante con datos válidos y generar un ID', () => {

        const p = new Participante(validData);


        expect(p).toBeInstanceOf(Participante);
        expect(p.id).toMatch(/^p-mock-id-\d+$/);
        expect(p.nombre).toBe('Ana García');
        expect(p.email).toBe('ana.garcia@test.com');

        expect(p.telefono).toBe('123456789');
    });

    test('debería crear un participante sin teléfono', () => {

        const dataSinTel = { nombre: 'Luis Sanz', email: 'luis@test.com' };


        const p = new Participante(dataSinTel);


        expect(p.nombre).toBe('Luis Sanz');
        expect(p.telefono).toBeUndefined();
    });

    // Casos de error (Validaciones)
    test('debería lanzar ValidationError si el nombre está vacío', () => {

        const invalidData = { ...validData, nombre: ' ' };


        expect(() => new Participante(invalidData)).toThrow(ValidationError);
        expect(() => new Participante(invalidData)).toThrow('Nombre y email son obligatorios.');
    });

    test('debería lanzar ValidationError si el email está vacío', () => {

        const invalidData = { ...validData, email: ' ' }; // Espacio para probar el trim()


        expect(() => new Participante(invalidData)).toThrow(ValidationError);
        expect(() => new Participante(invalidData)).toThrow('Nombre y email son obligatorios.');
    });

    test('debería lanzar ValidationError si el email no es válido', () => {

        const invalidData = { ...validData, email: 'emailinvalido' };


        expect(() => new Participante(invalidData)).toThrow(ValidationError);
        expect(() => new Participante(invalidData)).toThrow('Email no válido.');
    });

    test('debería aceptar un ID predefinido si se proporciona', () => {

        const customId = 'p-custom-123';
        const data = { ...validData, id: customId };


        const p = new Participante(data);


        expect(p.id).toBe(customId);
        expect(p.nombre).toBe('Ana García');
        expect(p.email).toBe('ana.garcia@test.com');
    });
});