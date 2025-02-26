import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, tap, switchMap, catchError, forkJoin, of, Subject } from 'rxjs';
import { Board, Card, EstadoServicio, TipoServicio, Equipo } from './scrumboard.models';
import { environment } from 'environments/environment';

interface UserResponse {
    message: string;
    data: {
        total: number;
        perPage: number;
        currentPage: number;
        totalPages: number;
        data: {
            usuarios_id: {
                usuarios_id: number;
                email: string;
                usuario: string;
                nombres: string;
                apellidos: string;
                role: string;
                estado: number;
            }
        }[]
    }
}

interface ServiceResponse {
    message: string;
    data: {
        total: number;
        perPage: number;
        currentPage: number;
        totalPages: number;
        data: Array<{
            servicios_id: number;
            nombreResponsableEgreso: string;
            cargoSolicitante: string;
            informe: string;
            cargoResponsableEgreso: string;
            oficinaSolicitante: string;
            fechaRegistro: string;
            equipo: string;
            problema: string;
            telefonoResponsableEgreso: string;
            gestion: number;
            telefonoSolicitante: string;
            tecnicoAsignado: number;
            observaciones: string;
            tipoResponsableEgreso: string;
            estado: string;
            tipoSolicitante: string;
            fechaTerminado: string;
            oficinaResponsableEgreso: string;
            numero: number;
            fechaInicio: string;
            fechaEgreso: string;
            ciSolicitante: string;
            nombreSolicitante: string;
            tipo: string;
            tecnicoRegistro: number;
            tecnicoEgreso: string;
            ciResponsableEgreso: string;
        }>;
    };
}

@Injectable({providedIn: 'root'})
export class ScrumboardService {
    private readonly _apiUrl = environment.baseUrl;
    private baseUrlAlt = environment.baseUrlAlt;//llamamos al environment alternativo
    readonly cards$ = new BehaviorSubject<Card[]>([]);
    private _cardUpdates = new Subject<{type: 'update' | 'delete' | 'create', cardId?: number, listId?: string}>();
    
    // Observable que otros componentes pueden suscribirse
    cardUpdates$ = this._cardUpdates.asObservable();

    // Método para emitir actualizaciones
    notifyCardUpdate(type: 'update' | 'delete' | 'create', cardId?: number, listId?: string): void {
        this._cardUpdates.next({ type, cardId, listId });
    }

    get apiUrl(): string {
        return this._apiUrl;
    }

    constructor(private _httpClient: HttpClient) {}

    /**
     * Obtener tarjetas por estado
     */
    getCardsByStatus(
        tipoServicio: TipoServicio, 
        estado: EstadoServicio, 
        tecnicoId?: string, 
        page: number = 1, 
        limit: number = 10
    ): Observable<{cards: Card[], total: number}> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString())
            .set('tipo', tipoServicio)
            .set('estado', estado);
        
        if (tecnicoId) {
            params = params.set('tecnicoAsignado', tecnicoId);
        }

        console.log('Obteniendo tarjetas:', {
            tipoServicio,
            estado,
            tecnicoId,
            page,
            limit
        });

        return this._httpClient.get<ServiceResponse>(`${this.apiUrl}/service/board`, { params }).pipe(
            map(response => {
                const newCards = response.data.data.map(item => ({
                        id: item.servicios_id.toString(),
                        nombreSolicitante: item.nombreSolicitante || '',
                        solicitante: item.nombreSolicitante || '',
                        carnet: item.ciSolicitante || '',
                        cargo: item.cargoSolicitante || '',
                        tipoSolicitante: item.tipoSolicitante || '',
                        problema: item.problema || '',
                        tipo: item.tipo as TipoServicio,
                        estado: item.estado as EstadoServicio,
                        tecnicoAsignado: item.tecnicoAsignado || 0,
                        fechaRegistro: item.fechaRegistro || '',
                        fechaInicio: item.fechaInicio || '',
                        fechaTerminado: item.fechaTerminado || '',
                        informe: item.informe || '',
                        observacionesProblema: item.observaciones || '',
                        codigoBienes: item.equipo || '',
                        oficinaSolicitante: item.oficinaSolicitante || '',
                        telefonoSolicitante: item.telefonoSolicitante || '',
                        listId: '',
                        position: 0,
                        tecnicoRegistro: item.tecnicoRegistro || 3
                } as Card));

                // Mantener las tarjetas existentes de otros estados
                const currentCards = this.cards$.value;
                const otherCards = currentCards.filter(c => c.estado !== estado);
                this.cards$.next([...otherCards, ...newCards]);

                return {
                    cards: newCards,
                    total: response.data.total
                };
            }),
            tap(result => {
                console.log('Tarjetas obtenidas para estado', estado, ':', result);
            })
        );
    }

    /**
     * Obtener técnicos
     */
    getTecnicos(search: string = ''): Observable<any[]> {
        // Obtener datos del usuario del localStorage
        const userString = localStorage.getItem('user');
        let userData;
        try {
            userData = JSON.parse(userString);
            console.log('Datos del usuario en getTecnicos:', userData);
        } catch (e) {
            console.error('Error al parsear datos del usuario:', e);
            userData = null;
        }

        // Obtener el rol del usuario de la misma estructura que viene del localStorage
        const userRole = userData?.data?.role;
        const userId = userData?.data?.usuarios_id;
        
        console.log('Role del usuario en getTecnicos:', userRole);

        return this._httpClient.get<any>(`${this.apiUrl}/user`, {
            params: {
                page: '1',
                limit: '1000',
                search: search
            }
        }).pipe(
            map(response => {
                console.log('Respuesta completa de la API getTecnicos:', response);
                
                if (response?.data?.data) {
                    let tecnicos = [];

                    // Role 1 (Admin): Ver todos los técnicos sin importar estado
                    if (userRole === '1') {
                        tecnicos = response.data.data
                            .map(tecnico => ({
                                id: tecnico.usuarios_id,
                                nombre: `${tecnico.nombres || ''} ${tecnico.apellidos || ''}`.trim(),
                                estado: tecnico.estado
                            }));
                        
                        // Agregar opción "TODOS" para admin
                        tecnicos.unshift({
                            id: 'TODOS',
                            nombre: 'TODOS',
                           
                        });
                    }
                    // Role 2: Ver solo técnicos activos
                    else if (userRole === '2') {
                        tecnicos = response.data.data
                            .filter(user => user.estado === 1)
                            .map(tecnico => ({
                                id: tecnico.usuarios_id,
                                nombre: `${tecnico.nombres || ''} ${tecnico.apellidos || ''}`.trim(),
                                estado: tecnico.estado
                            }));
                        
                        // Agregar opción "TODOS" para supervisor
                        tecnicos.unshift({
                            id: 'TODOS',
                            nombre: 'TODOS',
                            estado: 1
                        });
                    }
                    // Role 3: Ver solo su propio usuario
                    else if (userRole === '3') {
                        tecnicos = response.data.data
                            .filter(user => user.usuarios_id === userId)
                            .map(tecnico => ({
                                id: tecnico.usuarios_id,
                                nombre: `${tecnico.nombres || ''} ${tecnico.apellidos || ''}`.trim(),
                                estado: tecnico.estado
                            }));
                    }

                    console.log('Técnicos filtrados según rol:', tecnicos);
                    return tecnicos;
                }
                return [];
            }),
            catchError(error => {
                console.error('Error en getTecnicos:', error);
                return of([]);
            })
        );
    }

    /**
     * Actualizar estado del servicio
     */
    updateServiceStatus(serviceId: string, newStatus: EstadoServicio): Observable<Card> {
        console.log(`Iniciando actualización de estado para servicio ${serviceId} a ${newStatus}`);
        const nullToSpace = (value: any, field?: string) => {
            if (value === null || value === undefined || value === '' || value === 'null') {
                // Retornar null para equipo y tecnicoAsignado, espacio para otros campos
                return (field === 'equipo' || field === 'tecnicoAsignado') ? null : " ";
            }
            return value;
        };
        
        return this._httpClient.get<any>(`${this.apiUrl}/service/${serviceId}`)
            .pipe(
                tap({
                    next: (response) => console.log('GET response:', response),
                    error: (error) => console.error('Error en GET inicial:', error)
                }),
                switchMap(response => {
                    if (!response?.data) {
                        console.error('Respuesta GET inválida:', response);
                        throw new Error('Respuesta inválida del servidor');
                    }

                    const currentService = response.data;
                    console.log('Servicio actual obtenido:', currentService);

                    // Determinar las fechas según el estado
                    let fechaInicio = " ";
                    let fechaTerminado = " ";

                    switch (newStatus) {
                        case EstadoServicio.SIN_ASIGNAR:
                        case EstadoServicio.PENDIENTE:
                            // Ambas fechas en blanco
                            fechaInicio = " ";
                            fechaTerminado = " ";
                            break;
                        case EstadoServicio.EN_PROGRESO:
                            // Fecha de inicio = fecha actual, término en blanco
                            fechaInicio = new Date().toISOString();
                            fechaTerminado = " ";
                            break;
                        case EstadoServicio.TERMINADO:
                            // Si no tiene fecha de inicio (es " " o null), establecerla como la fecha actual
                            fechaInicio = (!currentService.fechaInicio || currentService.fechaInicio === " ") ? 
                                new Date().toISOString() : 
                                currentService.fechaInicio;
                            fechaTerminado = new Date().toISOString();
                            break;
                    }

                    
                    // Procesar todos los campos para evitar nulls
                    const updateData = {
                        ...Object.keys(currentService).reduce((acc, key) => {
                            acc[key] = nullToSpace(currentService[key], key);
                            return acc;
                        }, {}),
                        estado: newStatus,
                        fechaInicio: fechaInicio,
                        fechaTerminado: fechaTerminado,
                        tipo: currentService.tipo,
                        tecnicoAsignado: currentService.tecnicoAsignado
                    };
                    console.log('URL de actualización:', `${this.apiUrl}/service/${serviceId}`);
                    console.log('Datos a actualizar:', updateData);
                    
                    return this._httpClient.put<Card>(`${this.apiUrl}/service/${serviceId}`, updateData)
                        .pipe(
                            tap({
                                next: (response) => {
                                    // Imprimir en consola la respuesta de la actualización exitosa
                                    console.log('Actualización exitosa:', response);
                                    
                                    // Obtener la lista actual de tarjetas
                                    const currentCards = this.cards$.value;
                                    
                                    // Mapear las tarjetas actuales para actualizar solo la tarjeta modificada
                                    const updatedCards = currentCards.map(card => {
                                        // Verificar si la tarjeta actual es la que se está actualizando
                                        if (card.id === serviceId) {
                                            return {
                                                ...card, // Mantener los datos existentes de la tarjeta
                                                ...updateData, // Incorporar los nuevos datos actualizados
                                                estado: newStatus, // Actualizar el estado de la tarjeta
                                                fechaInicio: fechaInicio, // Asegurar que se mantenga la fecha de inicio
                                                fechaTerminado: fechaTerminado // Asegurar que se mantenga la fecha de término
                                            };
                                        }
                                        return card; // Retornar la tarjeta sin cambios si no es la que se actualiza
                                    });
                                    
                                    // Actualizar el estado de las tarjetas en el BehaviorSubject
                                    this.cards$.next(updatedCards);

                                    // Recargar la lista específica después de un breve delay
                                    setTimeout(() => {
                                        this.getCardsByStatus(
                                            updateData.tipo,
                                            newStatus,
                                            updateData.tecnicoAsignado?.toString(),
                                            1,
                                            100
                                        ).subscribe();
                                    }, 100);
                                },
                                error: (error) => console.error('Error en PUT:', {
                                    status: error.status,
                                    message: error.message,
                                    error: error,
                                    url: `${this.apiUrl}/service/${serviceId}`,
                                    data: updateData
                                })
                            }),
                            catchError(error => {
                                console.error('Error capturado en PUT:', error);
                                throw error;
                            })
                        );
                }),
                catchError(error => {
                    console.error('Error capturado en pipeline principal:', error);
                    throw error;
                })
            );
    }

    /**
     * Obtener servicios
     */
    getServices(tipoServicio: TipoServicio, tecnicoId?: string): Observable<Card[]> {
        let params = new HttpParams()
            .set('page', '1')
            .set('limit', '100')
            .set('tipo', tipoServicio)
            .set('search', '');
        
        if (tecnicoId) {
            params = params.set('tecnicoAsignado', tecnicoId);
        }

        return this._httpClient.get<ServiceResponse>(`${this.apiUrl}/service/board`, { params }).pipe(
            map(response => response.data.data.map(item => {
                if (typeof item === 'number') {
                    console.error('Item inesperado:', item);
                    return null;
                }

                return {
                    id: item.servicios_id.toString(),
                    nombreSolicitante: item.nombreSolicitante || '',
                    solicitante: item.nombreSolicitante || '',
                    carnet: item.ciSolicitante || '',
                    cargo: item.cargoSolicitante || '',
                    tipoSolicitante: item.tipoSolicitante || '',
                    problema: item.problema || '',
                    tipo: item.tipo as TipoServicio,
                    estado: item.estado as EstadoServicio,
                    tecnicoAsignado: item.tecnicoAsignado || 0,
                    fechaRegistro: item.fechaRegistro || '',
                    fechaInicio: item.fechaInicio || '',
                    fechaTerminado: item.fechaTerminado || '',
                    informe: item.informe || '',
                    observacionesProblema: item.observaciones || '',
                    codigoBienes: item.equipo || '',
                    oficinaSolicitante: item.oficinaSolicitante || '',
                    telefonoSolicitante: item.telefonoSolicitante || '',
                    listId: '',
                    position: 0,
                    tecnicoRegistro: item.tecnicoRegistro || 3
                } as Card;
            }).filter(card => card !== null)),
            tap(cards => {
                this.cards$.next(cards);
            })
        );
    }

    /**
     * Obtener detalles de un servicio
     */
    getServiceDetails(serviceId: string): Observable<Card> {
        return this._httpClient.get<ServiceResponse>(`${this.apiUrl}/servicios/${serviceId}`).pipe(
            map(response => {
                const item = response.data.data[0];
                if (typeof item === 'number') {
                    throw new Error('Formato de respuesta inválido');
                }

                return {
                    id: item.servicios_id.toString(),
                    nombreSolicitante: item.nombreSolicitante || '',
                    solicitante: item.nombreSolicitante || '',
                    carnet: item.ciSolicitante || '',
                    cargo: item.cargoSolicitante || '',
                    tipoSolicitante: item.tipoSolicitante || '',
                    problema: item.problema || '',
                    tipo: item.tipo as TipoServicio,
                    estado: item.estado as EstadoServicio,
                    tecnicoAsignado: item.tecnicoAsignado || 0,
                    fechaRegistro: item.fechaRegistro || '',
                    fechaInicio: item.fechaInicio || '',
                    fechaTerminado: item.fechaTerminado || '',
                    informe: item.informe || '',
                    observacionesProblema: item.observaciones || '',
                    codigoBienes: item.equipo || '',
                    oficinaSolicitante: item.oficinaSolicitante || '',
                    telefonoSolicitante: item.telefonoSolicitante || '',
                    listId: '',
                    position: 0,
                    tecnicoRegistro: item.tecnicoRegistro || 3
                } as Card;
            })
        );
    }

    /**
     * Actualizar servicio
     */
    updateService(serviceId: string | Card, updateData?: any): Observable<any> {
        if (typeof serviceId === 'string') {
            // Función auxiliar para convertir null a espacio en blanco
            const nullToSpace = (value: any, field?: string) => {
                if (value === null || value === undefined || value === '') {
                    return field === 'equipo' ? null : " ";
                }
                return value;
            }

            // Obtener el ID del usuario del localStorage
            const token = localStorage.getItem('accessToken');
            let userId =  3 

            
            if (token) {
                try {
                    const tokenParts = token.split('.');
                    const payload = JSON.parse(atob(tokenParts[1]));
                    userId = payload.id;
                } catch (e) {
                    console.error('Error al obtener ID del usuario:', e);
                }
            }

            // Mapear los campos del formulario y convertir nulls a espacios
            const mappedUpdateData = {
                ...updateData,
                ciSolicitante: nullToSpace(updateData.carnet || updateData.ciSolicitante || " "),
                cargoSolicitante: nullToSpace(updateData.cargo || updateData.cargoSolicitante || " "),
                equipo: nullToSpace(updateData.equipo || updateData.codigoBienes, 'equipo'),
                nombreSolicitante: nullToSpace(updateData.solicitante || updateData.nombreSolicitante || " "),
                oficinaSolicitante: nullToSpace(updateData.oficina || updateData.oficinaSolicitante || " "),
                telefonoSolicitante: nullToSpace(updateData.telefono || updateData.telefonoSolicitante || " "),
                tipo: nullToSpace(updateData.tipoServicio || updateData.tipo || "ASISTENCIA"),
                problema: nullToSpace(updateData.problema || " "),
                observaciones: nullToSpace(updateData.observaciones || " "),
                informe: nullToSpace(updateData.informe || " "),
                estado: nullToSpace(updateData.estado || "SIN ASIGNAR"),
              
                tecnicoAsignado: nullToSpace(updateData.tecnicoAsignado, 'tecnicoAsignado'),
                fechaRegistro: nullToSpace(updateData.fechaRegistro || new Date().toISOString()),
                fechaInicio: nullToSpace(updateData.fechaInicio || " "),
                fechaTerminado: nullToSpace(updateData.fechaTerminado || " "),
                fechaEgreso: nullToSpace(updateData.fechaEgreso || " "),
                nombreResponsableEgreso: nullToSpace(updateData.nombreResponsableEgreso || " "),
                cargoResponsableEgreso: nullToSpace(updateData.cargoResponsableEgreso || " "),
                telefonoResponsableEgreso: nullToSpace(updateData.telefonoResponsableEgreso || " "),
                tipoResponsableEgreso: nullToSpace(updateData.tipoResponsableEgreso || " "),
                oficinaResponsableEgreso: nullToSpace(updateData.oficinaResponsableEgreso || " "),
                tecnicoEgreso: nullToSpace(updateData.tecnicoEgreso || " "),
                ciResponsableEgreso: nullToSpace(updateData.ciResponsableEgreso || " "),
                gestion: updateData.gestion || 3,
                numero: updateData.numero || 464,
                tecnicoRegistro: updateData.tecnicoRegistro 
            };

            console.log('Datos mapeados para actualización:', mappedUpdateData);

            return this._httpClient.put<any>(`${this._apiUrl}/service/${serviceId}`, mappedUpdateData)
                .pipe(
                    tap({
                        next: (response) => {
                            console.log('Actualización exitosa:', response);
                            // Actualizar solo la tarjeta modificada
                            const currentCards = this.cards$.value;
                            const updatedCards = currentCards.map(card => {
                                if (card.id === serviceId) {
                                    return {
                                        ...card,
                                        carnet: mappedUpdateData.ciSolicitante,
                                        cargo: mappedUpdateData.cargoSolicitante,
                                        codigoBienes: mappedUpdateData.equipo,
                                        nombreSolicitante: mappedUpdateData.nombreSolicitante,
                                        oficinaSolicitante: mappedUpdateData.oficinaSolicitante,
                                        telefonoSolicitante: mappedUpdateData.telefonoSolicitante,
                                        tipo: mappedUpdateData.tipo,
                                        problema: mappedUpdateData.problema,
                                        observacionesProblema: mappedUpdateData.observaciones,
                                        informe: mappedUpdateData.informe,
                                        estado: mappedUpdateData.estado,
                                        tecnicoAsignado: mappedUpdateData.tecnicoAsignado,
                                        fechaRegistro: mappedUpdateData.fechaRegistro,
                                        fechaInicio: mappedUpdateData.fechaInicio,
                                        fechaTerminado: mappedUpdateData.fechaTerminado
                                    };
                                }
                                return card;
                            });
                            this.cards$.next(updatedCards);

                            // Recargar solo el estado nuevo si cambió el estado
                            const cardToUpdate = currentCards.find(c => c.id === serviceId);
                            if (cardToUpdate && cardToUpdate.estado !== mappedUpdateData.estado) {
                                this.getCardsByStatus(
                                    mappedUpdateData.tipo,
                                    mappedUpdateData.estado,
                                    null,
                                    1,
                                    100
                                ).subscribe();
                            }
                }
            })
        );
        }

        // Si es un objeto Card, usar la implementación antigua
        const card = serviceId as Card;
        return this._httpClient.put<Card>(`${this._apiUrl}/servicios/${card.id}`, card);
    }

    /**
     * Crear servicio
     */
    createService(formData: any, tipoServicio: string): Observable<any> {
        // Obtener el ID del usuario del localStorage
        const token = localStorage.getItem('accessToken');
        let userId = 3; // valor por defecto

        if (token) {
            try {
                const tokenParts = token.split('.');
                const payload = JSON.parse(atob(tokenParts[1]));
                userId = payload.id;
            } catch (e) {
                console.error('Error al obtener ID del usuario:', e);
            }
        }

        console.log('FormData recibido:', formData); // Agregar log para debug

        const currentDate = new Date().toISOString();
        const serviceData = {
            nombreResponsableEgreso: " ",
            cargoSolicitante: " ",
            informe: " ",
            cargoResponsableEgreso: " ",
            oficinaSolicitante: " ",
            fechaRegistro: currentDate,
            equipo: null,
            problema: " ",
            telefonoResponsableEgreso: " ",
            gestion: 3,
            telefonoSolicitante: " ",
            tecnicoAsignado: formData?.tecnicoAsignado ? 
                (formData.tecnicoAsignado === 'TODOS' ? userId : Number(formData.tecnicoAsignado)) 
                : userId,
            observaciones: " ",
            tipoResponsableEgreso: " ",
            estado: "SIN ASIGNAR",
            tipoSolicitante: " ",
            fechaTerminado: " ",
            oficinaResponsableEgreso: " ",
            numero: 464,
            fechaInicio:" ",
            fechaEgreso: " ",
            ciSolicitante: " ",
            nombreSolicitante: " ",
            tipo: tipoServicio,
            tecnicoRegistro: userId, // Usar ID del usuario actual
            tecnicoEgreso: " ",
            ciResponsableEgreso: " ",
            cargo: " "
        };

        console.log('Service Data a enviar:', serviceData); // Agregar log para debug

        console.log('Enviando datos para crear servicio:', serviceData);

        return this._httpClient.post<any>(`${this._apiUrl}/service`, serviceData).pipe(
            tap({
                next: (response) => {
                    console.log('Servicio creado exitosamente:', response);
                    // Actualizar el estado local
                    const currentCards = this.cards$.value;
                    if (response.data) {
                        const newCard = {
                            id: response.data.servicios_id.toString(),
                            nombreSolicitante: response.data.nombreSolicitante,
                            solicitante: response.data.nombreSolicitante,
                            carnet: response.data.ciSolicitante,
                            cargo: response.data.cargoSolicitante || response.data.cargo,
                            tipoSolicitante: response.data.tipoSolicitante,
                            problema: response.data.problema,
                            tipo: response.data.tipo,
                            estado: response.data.estado,
                            tecnicoAsignado: response.data.tecnicoAsignado,
                            fechaRegistro: response.data.fechaRegistro,
                            fechaInicio: response.data.fechaInicio,
                            fechaTerminado: response.data.fechaTerminado,
                            informe: response.data.informe,
                            observacionesProblema: response.data.observaciones,
                            codigoBienes: response.data.equipo,
                            oficinaSolicitante: response.data.oficinaSolicitante,
                            telefonoSolicitante: response.data.telefonoSolicitante,
                            listId: '',
                            position: 0,
                            tecnicoRegistro: response.data.tecnicoRegistro || userId
                        } as Card;
                        this.cards$.next([...currentCards, newCard]);
                    }
                },
                error: (error) => {
                    console.error('Error al crear servicio:', error);
                    throw error;
                }
            })
        );
    }

    /**
     * Obtener servicio por ID
     */
    getServiceById(id: string): Observable<Card> {
        return this._httpClient.get<Card>(`${this.apiUrl}/servicios/${id}`);
    }

    /**
     * Recargar el tablero actual
     */
    private reloadCurrentBoard(): void {
        const currentCards = this.cards$.value;
        this.cards$.next([...currentCards]);
    }

    /**
     * Eliminar servicio
     */
    deleteService(serviceId: string): Observable<any> {
        return this._httpClient.delete<any>(`${this._apiUrl}/service/${serviceId}`).pipe(
            tap({
                next: (response) => {
                    // Actualizar el estado local removiendo la tarjeta eliminada
                    const currentCards = this.cards$.value;
                    const updatedCards = currentCards.filter(card => card.id !== serviceId);
                    this.cards$.next(updatedCards);
                }
            })
        );
    }

    /**
     * Buscar equipos
     */
    buscarEquipos(page: number, limit: number, search: string): Observable<{ equipos_id: number; codigo: string }[]> {
        const url = `${this._apiUrl}/equipment?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`;

        return this._httpClient.get<any>(url).pipe(
            map((response) => {
                if (response?.data?.data) {
                    return response.data.data
                        .map((equipment: any) => ({
                            equipos_id: equipment.equipos_id.equipos_id || 0,
                            codigo: equipment.equipos_id.codigo?.trim() || '',
                        }))
                        .filter(equipo => equipo.codigo !== ''); // Filtrar equipos con código vacío
                } else {
                    console.warn('Respuesta inesperada de la API:', response);
                    return [];
                }
            }),
            catchError((err) => {
                console.error('Error al buscar equipos:', err);
                return of([]); // Devuelve un array vacío en caso de error
            })
        );
    }

    /**
     * Obtener bienes
     */
    getBienes(codBienes: string): Observable<any> {
        const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
        const body = `cod_bienes=${encodeURIComponent(codBienes)}`;

        return this._httpClient.post<any>(`${this.baseUrlAlt}/api/proxy`, body, { headers }).pipe(
            tap((response) => {
                if (response && response.data) {
                    console.log('Bienes encontrados:', response.data);
                }
            })
        );
    }

    /**
     * Obtener técnico por ID
     */
    getTecnicoById(tecnicoId: number): Observable<any> {
        return this._httpClient.get<any>(`${this.apiUrl}/user/${tecnicoId}`);
    }
}

