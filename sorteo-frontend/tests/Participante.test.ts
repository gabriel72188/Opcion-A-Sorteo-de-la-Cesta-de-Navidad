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
            super({...data, id: data.id ?? mockGenId()});
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
        // Act
        const p = new Participante(validData);

        // Assert
        expect(p).toBeInstanceOf(Participante);
        expect(p.id).toMatch(/^p-mock-id-\d+$/);
        expect(p.nombre).toBe('Ana García'); 
        expect(p.email).toBe('ana.garcia@test.com');
        
        expect(p.telefono).toBe('123456789');
    });

    test('debería crear un participante sin teléfono', () => {
        // Arrange
        const dataSinTel = { nombre: 'Luis Sanz', email: 'luis@test.com' };

        // Act
        const p = new Participante(dataSinTel);

        // Assert
        expect(p.nombre).toBe('Luis Sanz');
        expect(p.telefono).toBeUndefined();
    });
    
    // Casos de error (Validaciones)
    test('debería lanzar ValidationError si el nombre está vacío', () => {
        // Arrange
        const invalidData = { ...validData, nombre: ' ' }; 
        
        // Act & Assert
        expect(() => new Participante(invalidData)).toThrow(ValidationError);
        expect(() => new Participante(invalidData)).toThrow('Nombre y email son obligatorios.');
    });

    test('debería lanzar ValidationError si el email está vacío', () => {
        // Arrange
        const invalidData = { ...validData, email: ' ' }; // Espacio para probar el trim()
        
        // Act & Assert
        expect(() => new Participante(invalidData)).toThrow(ValidationError);
        expect(() => new Participante(invalidData)).toThrow('Nombre y email son obligatorios.');
    });
    
    test('debería lanzar ValidationError si el email no es válido', () => {
        // Arrange
        const invalidData = { ...validData, email: 'emailinvalido' };

        // Act & Assert
        expect(() => new Participante(invalidData)).toThrow(ValidationError);
        expect(() => new Participante(invalidData)).toThrow('Email no válido.');
    });

    test('debería aceptar un ID predefinido si se proporciona', () => {
        // Arrange
        const customId = 'p-custom-123';
        const data = { ...validData, id: customId };

        // Act
        const p = new Participante(data);

        // Assert
        expect(p.id).toBe(customId);
        expect(p.nombre).toBe('Ana García');
        expect(p.email).toBe('ana.garcia@test.com');
    });
});