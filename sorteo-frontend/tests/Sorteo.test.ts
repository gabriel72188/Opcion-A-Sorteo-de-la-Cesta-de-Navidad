import { Sorteo } from '../src/Sorteo';
import { IParticipanteData, NumeroTablero } from '../src/interfaces';
import {
    ValidationError,
    DuplicateParticipantError,
    NotFoundError,
    AlreadyOccupiedError,
    NotOccupiedError,
} from '../src/errors';



const localStorageMock = (() => {
    let store: { [key: string]: string } = {};
    return {
        getItem: jest.fn((key: string) => store[key] || null),
        setItem: jest.fn((key: string, value: string) => {
            store[key] = value.toString();
        }),
        clear: jest.fn(() => {
            store = {};
        }),
        removeItem: jest.fn((key: string) => {
            delete store[key];
        }),
        getStore: () => store, // Para inspección en tests
    };
})();

// Reemplazar la variable global localStorage
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Mockear console.error y console.warn para evitar ruido en la salida de tests
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });

// Mockear la clase Participante para evitar depender de su lógica de ID en Sorteo.test.ts
jest.mock('../src/Participante', () => {
    return {
        Participante: class MockParticipante {
            id: string;
            nombre: string;
            email: string;
            telefono?: string;

            constructor(data: IParticipanteData) {
                // Simula la creación y asigna un ID simple para testing
                this.id = data.id || `p-${Math.random().toString(36).substring(2, 9)}`;
                this.nombre = data.nombre;
                this.email = data.email;
                this.telefono = data.telefono;
            }
        },
    };
});


describe('Sorteo', () => {
    let sorteo: Sorteo;
    const p1Data: IParticipanteData = { nombre: 'Paco', email: 'paco@test.com' };
    const p2Data: IParticipanteData = { nombre: 'Laura', email: 'laura@test.com' };


    beforeEach(() => {
        localStorageMock.clear(); // Limpia localStorage antes de cada test
        sorteo = new Sorteo();
        sorteo.inicializarTableroVacio(); // Asegura un estado limpio para pruebas
        localStorageMock.setItem.mockClear(); // Limpia el historial de llamadas a setItem
    });

    afterAll(() => {
        // Restaurar los mocks después de todas las pruebas
        consoleErrorSpy.mockRestore();
        consoleWarnSpy.mockRestore();
    });


    describe('Persistencia (localStorage)', () => {
        test('debería inicializar el tablero vacío si no hay estado guardado', () => {

            localStorageMock.getItem.mockReturnValue(null);


            sorteo = new Sorteo();


            expect(sorteo.totalNumerosReservados()).toBe(0);
            expect(sorteo.listParticipantes()).toHaveLength(0);
        });

        test('debería guardar el estado después de registrar un participante', () => {

            sorteo.registrarParticipante(p1Data);


            expect(localStorageMock.setItem).toHaveBeenCalled();
            expect(localStorageMock.setItem).toHaveBeenCalledWith('sorteoEstado', expect.any(String));
        });

        test('debería guardar el estado después de asignar un número', () => {

            const p1 = sorteo.registrarParticipante(p1Data);
            localStorageMock.setItem.mockClear(); // Limpiamos la llamada de registro


            sorteo.asignarNumero(10, p1.id);


            expect(localStorageMock.setItem).toHaveBeenCalledTimes(1);
        });

        test('debería cargar el estado si existe y es válido', () => {
            // Simular un estado guardado
            const estadoValido = JSON.stringify({
                participantes: [['p1-id', { id: 'p1-id', nombre: 'Test', email: 't@t.com' }]],
                numeros: [[5, 'p1-id'], [6, null], [99, 'p1-id'], ...Array(97).fill(0).map((_, i) => [i < 5 || i > 6 && i < 99 ? i : null, null]).filter(n => n[0] !== null)
                    // Generar los 100 números para un estado válido
                    // Nota: Es más fácil simular la carga que construir todo el mapa
                    .map((num, idx) => [num[0] === null ? idx : num[0], null])
                    .filter((_, i) => i !== 5 && i !== 6 && i !== 99)],
            });

            // Un estado más simple para la prueba:
            const simpleEstado = {
                participantes: [['p1', { id: 'p1', nombre: 'Test', email: 't@t.com' }]],
                numeros: Array.from({ length: 100 }, (_, i) => [i, i === 42 ? 'p1' : null]),
            };
            localStorageMock.getItem.mockReturnValue(JSON.stringify(simpleEstado));

          
            sorteo = new Sorteo();

           
            expect(sorteo.listParticipantes()).toHaveLength(1);
            expect(sorteo.obtenerPropietario(42)?.id).toBe('p1');
            expect(sorteo.totalNumerosReservados()).toBe(1);
        });

        test('debería reiniciar el estado si el JSON es corrupto o inválido', () => {
            
            localStorageMock.getItem.mockReturnValue('{"participantes": "malformado"');

            
            sorteo = new Sorteo();

            
            expect(consoleErrorSpy).toHaveBeenCalled();
            expect(sorteo.totalNumerosReservados()).toBe(0);
            expect(sorteo.listParticipantes()).toHaveLength(0);
        });
    });

    // Tests para Gestión de Participantes

    describe('Gestión de Participantes', () => {
        test('debería registrar un participante con datos válidos', () => {
            
            const p1 = sorteo.registrarParticipante(p1Data);

            
            expect(p1.nombre).toBe('Paco');
            expect(sorteo.listParticipantes()).toHaveLength(1);
        });

        test('debería lanzar DuplicateParticipantError si se registra un email duplicado (case-insensitive)', () => {
            
            sorteo.registrarParticipante(p1Data);
            const p1DataDuplicado = { nombre: 'Otro Paco', email: 'PACO@test.com' };

            
            expect(() => sorteo.registrarParticipante(p1DataDuplicado)).toThrow(DuplicateParticipantError);
            expect(sorteo.listParticipantes()).toHaveLength(1);
        });

        test('debería consultar la lista de participantes usando listParticipantes()', () => {
            
            sorteo.registrarParticipante(p1Data);
            sorteo.registrarParticipante(p2Data);

            
            const lista = sorteo.listParticipantes();

           
            expect(lista).toHaveLength(2);
            expect(lista.map(p => p.nombre)).toEqual(['Paco', 'Laura']);
        });
    });

    // Tests para Gestión del Tablero y Reservas

    describe('Gestión del Tablero y Reservas', () => {
        let p1Id: string;
        let p2Id: string;

        beforeEach(() => {
            p1Id = sorteo.registrarParticipante(p1Data).id;
            p2Id = sorteo.registrarParticipante(p2Data).id;
        });

        test('debería reservar un número libre exitosamente', () => {
            
            sorteo.asignarNumero(10, p1Id);

            
            expect(sorteo.totalNumerosReservados()).toBe(1);
            expect(sorteo.obtenerPropietario(10)?.id).toBe(p1Id);
        });

        test('debería lanzar AlreadyOccupiedError al intentar reservar un número ya ocupado', () => {
            
            sorteo.asignarNumero(20, p1Id);

            
            expect(() => sorteo.asignarNumero(20, p2Id)).toThrow(AlreadyOccupiedError);
        });

        test('debería permitir que un participante reserve múltiples números', () => {
            
            sorteo.asignarNumero(5, p1Id);
            sorteo.asignarNumero(6, p1Id);
            sorteo.asignarNumero(7, p1Id);

            
            expect(sorteo.totalNumerosReservados()).toBe(3);
            expect(sorteo.numerosDeParticipante(p1Id)).toEqual([5, 6, 7]); 
        });

        test('debería liberar un número correctamente', () => {
            
            sorteo.asignarNumero(30, p1Id);

            
            sorteo.liberarNumero(30);

            
            expect(sorteo.totalNumerosReservados()).toBe(0);
            expect(sorteo.obtenerPropietario(30)).toBeUndefined();
            expect(localStorageMock.setItem).toHaveBeenCalled();
        });

        test('debería lanzar NotOccupiedError al intentar liberar un número libre', () => {
            
            expect(() => sorteo.liberarNumero(40)).toThrow(NotOccupiedError);
        });

        test('debería consultar qué números tiene asignados un participante (numerosDeParticipante)', () => {
            
            sorteo.asignarNumero(1, p2Id);
            sorteo.asignarNumero(99, p1Id);
            sorteo.asignarNumero(50, p2Id);

            
            const numerosP2 = sorteo.numerosDeParticipante(p2Id); 

            
            expect(numerosP2).toEqual([1, 50]);
        });

        test('debería lanzar NotFoundError si se intenta asignar un número a un participante inexistente', () => {
            
            expect(() => sorteo.asignarNumero(5, 'p-fake-id')).toThrow(NotFoundError);
        });
    });

    // Tests para Sorteo y Estadísticas

    describe('Sorteo y Estadísticas', () => {
        let p1Id: string;
        let p2: any;

        beforeEach(() => {
            p1Id = sorteo.registrarParticipante(p1Data).id;
            p2 = sorteo.registrarParticipante(p2Data);
            sorteo.asignarNumero(15, p1Id);
            sorteo.asignarNumero(42, p2.id);
        });

        test('debería devolver correctamente la información del ganador (buscarGanador)', () => {
            
            const ganador = sorteo.buscarGanador(42);

            
            expect(ganador).toBeDefined();
            expect(ganador?.nombre).toBe('Laura');
        });

        test('debería devolver undefined (desierto) cuando el número ganador está libre', () => {
            
            const ganador = sorteo.buscarGanador(50); 

            
            expect(ganador).toBeUndefined();
        });

        test.each([
            [-1, 'bajo'],
            [100, 'alto'],
            [10.5, 'decimal'],
        ])('debería lanzar RangeError para números de sorteo inválidos (%s)', (numero: NumeroTablero, caso: string) => {
            
            expect(() => sorteo.buscarGanador(numero)).toThrow(RangeError);
        });

        test('debería calcular las estadísticas correctamente', () => {
            
            const stats = sorteo.estadisticas();

            
            expect(stats.ocupados).toBe(2);
            expect(stats.libres).toBe(98);
            expect(stats.participantesUnicos).toBe(2);
            expect(stats.porcentajeOcupacion).toBe(2.00);
        });

        test('debería calcular el estado inicial (tablero vacío) en estadisticas', () => {
            // Arrange: Crear un nuevo sorteo sin registros
            const nuevoSorteo = new Sorteo();
            nuevoSorteo.inicializarTableroVacio();


            const stats = nuevoSorteo.estadisticas();


            expect(stats.ocupados).toBe(0);
            expect(stats.participantesUnicos).toBe(0);
            expect(stats.porcentajeOcupacion).toBe(0);
        });
    });
});