import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Tag, Task, Servicio, InventoryPagination, InventoryEquipment, NotificacionPush, FiltroNotificacion, DestinatarioNotificacion } from 'app/modules/admin/apps/tasks/tasks.types';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError, catchError, delay } from 'rxjs';
import { environment } from 'environments/environment'; 
import { forkJoin } from 'rxjs';
import { ErrorLogService } from 'app/core/services/error-log.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

const now = new Date();
//const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

const formattedDate: string = new Date().toISOString();

// Agregar la interfaz Empleado
export interface Empleado {
    id: number;
    nombre_completo: string;
    numdocumento: string;
    cargo: string;
    tipo_contrato: string;
    unidad: string;
    telefono?: string;
    telefono_coorp?: string;
    nro_item?: string;
    // ... otros campos
}

// Agregar esta interfaz si no existe
export interface Usuario {
    id: number;
    nombre: string;
    carnet: string;
    rol?: string;
    unidad?: string;
}

@Injectable({providedIn: 'root'})
export class TasksService
{
    // Private
    private _tags: BehaviorSubject<Tag[] | null> = new BehaviorSubject(null);
    private _task: BehaviorSubject<Task | null> = new BehaviorSubject(null);
    private _tasks: BehaviorSubject<Task[] | null> = new BehaviorSubject(null);
    private _services: BehaviorSubject<Servicio[]| null> = new BehaviorSubject(null);
    private _equipments: BehaviorSubject<any[]> = new BehaviorSubject(null);
    private baseUrl = environment.baseUrl;//llamamos a los enviment de la url
    private _pagination: BehaviorSubject<InventoryPagination | null> = new BehaviorSubject(null);
    private baseUrlAlt = environment.baseUrlAlt;//llamamos al environment alternativo
    
    // Constante para el estado
    private readonly ESTADO_SIN_ASIGNAR = 'SIN ASIGNAR';

    private _notificaciones: BehaviorSubject<NotificacionPush[]> = new BehaviorSubject<NotificacionPush[]>([]);

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _errorLogService: ErrorLogService,
        private _snackBar: MatSnackBar,
        private _router: Router
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for tags
     */
    get tags$(): Observable<Tag[]>
    {
        return this._tags.asObservable();
    }

    /**
     * Getter for task
     */
    get task$(): Observable<Task>
    {
        return this._task.asObservable();
    }

    /**
     * Getter for tasks
     */
    get tasks$(): Observable<Task[]>
    {
        return this._tasks.asObservable();
    }
    get service$(): Observable<Servicio>
    {
        return this._services.asObservable().pipe(
            map(services => services?.[0])
        );
    }


    get services$(): Observable<Servicio[]>
        {
            return this._services.asObservable();
        }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get tags
     */
    getTags(): Observable<Tag[]>
    {
        return this._httpClient.get<Tag[]>('api/apps/tasks/tags').pipe(
            tap((response: any) =>
            {
                this._tags.next(response);
            }),
        );
    }

    /**
     * Crate tag
     *
     * @param tag
     */
    createTag(tag: Tag): Observable<Tag>
    {
        return this.tags$.pipe(
            take(1),
            switchMap(tags => this._httpClient.post<Tag>('api/apps/tasks/tag', {tag}).pipe(
                map((newTag) =>
                {
                    // Update the tags with the new tag
                    this._tags.next([...tags, newTag]);

                    // Return new tag from observable
                    return newTag;
                }),
            )),
        );
    }

    /**
     * Update the tag
     *
     * @param id
     * @param tag
     */
    updateTag(id: string, tag: Tag): Observable<Tag>
    {
        return this.tags$.pipe(
            take(1),
            switchMap(tags => this._httpClient.patch<Tag>('api/apps/tasks/tag', {
                id,
                tag,
            }).pipe(
                map((updatedTag) =>
                {
                    // Find the index of the updated tag
                    const index = tags.findIndex(item => item.id === id);

                    // Update the tag
                    tags[index] = updatedTag;

                    // Update the tags
                    this._tags.next(tags);

                    // Return the updated tag
                    return updatedTag;
                }),
            )),
        );
    }

    /**
     * Delete the tag
     *
     * @param id
     */
    deleteTag(id: string): Observable<boolean>
    {
        return this.tags$.pipe(
            take(1),
            switchMap(tags => this._httpClient.delete('api/apps/tasks/tag', {params: {id}}).pipe(
                map((isDeleted: boolean) =>
                {
                    // Find the index of the deleted tag
                    const index = tags.findIndex(item => item.id === id);

                    // Delete the tag
                    tags.splice(index, 1);

                    // Update the tags
                    this._tags.next(tags);

                    // Return the deleted status
                    return isDeleted;
                }),
                filter(isDeleted => isDeleted),
                switchMap(isDeleted => this.tasks$.pipe(
                    take(1),
                    map((tasks) =>
                    {
                        // Iterate through the tasks
                        tasks.forEach((task) =>
                        {
                            const tagIndex = task.tags.findIndex(tag => tag === id);

                            // If the task has a tag, remove it
                            if ( tagIndex > -1 )
                            {
                                task.tags.splice(tagIndex, 1);
                            }
                        });

                        // Return the deleted status
                        return isDeleted;
                    }),
                )),
            )),
        );
    }

    /**
     * Get tasks
     */
    getTasksO(): Observable<Task[]>
    {
        return this._httpClient.get<Task[]>('api/apps/tasks/all').pipe(
            tap((response) =>
            {
                this._tasks.next(response);
            }),
        );
    }



    
        /**
         * Obtiene la lista de productos con paginación, ordenación y búsqueda
         *
         * @param page - Número de página (por defecto es 0)
         * @param size - Tamaño de página, es decir, el número de productos por página (por defecto es 10)
         * @param sort - Campo de ordenación (por defecto es 'name')
         * @param order - Orden ascendente o descendente (por defecto es 'asc')
         * @param search - Término de búsqueda para filtrar productos (por defecto es una cadena vacía)
         * @returns Observable que emite un objeto con la paginación (`InventoryPagination`) y la lista de productos (`InventoryProduct[]`)
         */
        
    
        
        getTasksAnterior(
            page: number = 0,
            size: number = 100,
            sort: string = 'name',
            order: 'asc' | 'desc' | '' = 'desc',
            estado: string = 'SIN ASIGNAR'
        ): Observable<{ pagination: InventoryPagination; services: Servicio[] }> {
            let params = new HttpParams()
                .set('page', page.toString())
                .set('limit', size.toString())
                .set('estado', estado);

            return this._httpClient.get<any>(`${this.baseUrl}/service`, { params })
                .pipe(
                    map(response => {
                        console.log('API Response:', response);
                        
                        // Crear objeto de paginación
                        const pagination: InventoryPagination = {
                            length: response.data.total,
                            size: response.data.perPage,
                            page: response.data.currentPage,
                            lastPage: response.data.totalPages,
                            startIndex: ((response.data.currentPage) * response.data.perPage),
                            endIndex: response.data.currentPage * response.data.perPage,
                        };

                        // Mapear y filtrar los servicios
                        const services = response.data.data
                            .map((item: any) => ({
                                ...item.servicios_id,  // Expandir los datos del servicio
                                servicios_id: item.servicios_id.servicios_id,
                                nombreSolicitante: item.servicios_id.nombreSolicitante || '',
                                problema: item.servicios_id.problema || '',
                                estado: item.servicios_id.estado,
                                tecnicoAsignado: item.servicios_id.tecnicoAsignado || null
                            }))
                            .filter((service: any) => service.estado === estado);

                        // Eliminar duplicados basados en servicios_id
                        const uniqueServices = services.filter((service, index, self) =>
                            index === self.findIndex((s) => s.servicios_id === service.servicios_id)
                        );

                        // Ordenar por ID de forma descendente (los más nuevos primero)
                        const sortedServices = uniqueServices.sort((a, b) => b.servicios_id - a.servicios_id);

                        // Emitir los datos
                        this._pagination.next(pagination);
                        this._services.next(sortedServices);

                        return { pagination, services: sortedServices };
                    })
                );
        }
        
    


    /**
     * Update tasks orders
     *
     * @param tasks
     */
    updateTasksOrders(tasks: Task[]): Observable<Task[]>
    {
        return this._httpClient.patch<Task[]>('api/apps/tasks/order', {tasks});
    }

    /**
     * Search tasks with given query
     *
     * @param query
     */
    searchTasks(query: string): Observable<Task[] | null>
    {
        return this._httpClient.get<Task[] | null>('api/apps/tasks/search', {params: {query}});
    }

    /**
     * Get task by id
     */
    getTaskByIdO(id: string): Observable<Task>
    {
        return this._tasks.pipe(
            take(1),
            map((tasks) =>
            {
                // Find the task
                const task = tasks.find(item => item.id === id) || null;

                // Update the task
                this._task.next(task);

                // Return the task
                return task;
            }),
            switchMap((task) =>
            {
                if ( !task )
                {
                    return throwError('Could not found task with id of ' + id + '!');
                }

                return of(task);
            }),
        );
    }



    
     /**
     * Obtiene un servicio por su ID del servidor
     *
     * @param servicios_id - ID del servicio a obtener
     * @returns Observable que emite el servicio con información adicional procesada
     */
     getTaskById(servicios_id: number): Observable<{ message: string; data: Servicio }> {
        console.log('Enviando solicitud a la API con ID:', servicios_id);
    
        return this._httpClient.get<{ message: string; data: Servicio }>(`${this.baseUrl}/service/${servicios_id}`).pipe(
            switchMap((response) => {
                const service = response.data;
                const requests: Observable<any>[] = [];

                // Consulta para el técnico
                if (service.tecnicoRegistro) {
                    const tecnicoId = Number(service.tecnicoRegistro);
                    if (!isNaN(tecnicoId)) {
                        requests.push(
                            this._httpClient.get<{ message: string; data: { nombres: string; apellidos: string } }>(
                                `${this.baseUrl}/user/${tecnicoId}`
                            ).pipe(
                                map((userResponse) => {
                                    console.log('Respuesta del usuario técnico:', userResponse);
                                    service.tecnicoRegistroString = `${userResponse.data.nombres} ${userResponse.data.apellidos}`;
                                    console.log('tecnicoRegistroString asignado:', service.tecnicoRegistroString);
                                })
                            )
                        );
                    }
                }

                // Consulta para obtener el código del equipo
                if (service.equipo) {  // equipo contiene el equipos_id
                    requests.push(
                        this._httpClient.get<any>(`${this.baseUrl}/equipment/${service.equipo}`).pipe(
                            map((equipoResponse) => {
                                if (equipoResponse && equipoResponse.data) {
                                    service.codigo = equipoResponse.data.codigo;  // Guardamos el código del equipo
                                    console.log('Código de equipo obtenido:', service.codigo);
                                }
                            })
                        )
                    );
                }

                return requests.length > 0
                    ? forkJoin(requests).pipe(
                        map(() => ({ message: 'Service fetched successfully', data: service }))
                    )
                    : of({ message: 'Service fetched successfully', data: service });
            })
        );
    }
    
    

    /**
     * Create task
     *
     * @param type
     */
    createTaskO(type: string): Observable<Task>
    {
        return this.tasks$.pipe(
            take(1),
            switchMap(tasks => this._httpClient.post<Task>('api/apps/tasks/task', {type}).pipe(
                map((newTask) =>
                {
                    // Update the tasks with the new task
                    this._tasks.next([newTask, ...tasks]);

                    // Return the new task
                    return newTask;
                }),
            )),
        );
    }

    
     /**
     * Crea un nuevo servicio en el servidor
     *
     * @returns Observable que emite el nuevo servicio creado (`Servicio`)
     */
    createTask(serviceData: any = {}): Observable<Servicio> {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;

        const defaultData2: Servicio = {
            nombreResponsableEgreso: " ",
            cargoSolicitante: " ",
            informe: " ",
            cargoResponsableEgreso: " ",
            oficinaSolicitante: " ",
            fechaRegistro: formattedDate,
            equipo: null,
            problema: " ",
            telefonoResponsableEgreso: " ",
            gestion: 3,
            telefonoSolicitante: " ",
            tecnicoAsignado: null,
            observaciones: " ",
            tipoResponsableEgreso: " ",
            estado: "SIN ASIGNAR",
            tipoSolicitante: " ",
            fechaTerminado: " ",
            oficinaResponsableEgreso: " ",
            numero: 464,
            fechaInicio: " ",
            fechaEgreso: " ",
            ciSolicitante: " ",
            nombreSolicitante: " ",
            tipo: "EN LABORATORIO",
            tecnicoRegistro: user?.data?.usuarios_id || 1,
            tecnicoEgreso: " ",
            ciResponsableEgreso: " ",
            ...serviceData
        };

        if (defaultData2.tecnicoAsignado === undefined || 
            defaultData2.tecnicoAsignado === null || 
            isNaN(Number(defaultData2.tecnicoAsignado))) {
            defaultData2.tecnicoAsignado = null;
        }

        return this._httpClient.post<{ message: string, data: Servicio }>(`${this.baseUrl}/service`, defaultData2)
            .pipe(
                switchMap(response => {
                    const newService = response.data;
                    // Obtener la lista actual
                    const currentServices = this._services.getValue() || [];
                    
                    // Crear una nueva lista con el nuevo servicio al principio
                    const updatedServices = [
                        newService,
                        ...currentServices
                    ].sort((a, b) => b.servicios_id - a.servicios_id); // Asegurar orden descendente por ID
                    
                    // Actualizar la lista con el nuevo servicio al principio
                    this._services.next(updatedServices);
                    
                    // Devolver el nuevo servicio
                    return of(newService);
                }),
                catchError(error => {
                    console.error('Error al crear el servicio:', error);
                    return throwError(() => new Error('No se pudo crear el servicio debido a un error en el servidor.'));
                })
            );
    }

    /**
     * Update task
     *
     * @param id
     * @param task
     */
    updateTaskO(id: string, task: Task): Observable<Task>
    {
        return this.tasks$
            .pipe(
                take(1),
                switchMap(tasks => this._httpClient.patch<Task>('api/apps/tasks/task', {
                    id,
                    task,
                }).pipe(
                    map((updatedTask) =>
                    {
                        // Find the index of the updated task
                        const index = tasks.findIndex(item => item.id === id);

                        // Update the task
                        tasks[index] = updatedTask;

                        // Update the tasks
                        this._tasks.next(tasks);

                        // Return the updated task
                        return updatedTask;
                    }),
                    switchMap(updatedTask => this.task$.pipe(
                        take(1),
                        filter(item => item && item.id === id),
                        tap(() =>
                        {
                            // Update the task if it's selected
                            this._task.next(updatedTask);

                            // Return the updated task
                            return updatedTask;
                        }),
                    )),
                )),
            );
    }

    /**
     * Actualiza un servicio en el servidor
     *
     * @param servicios_id - ID del servicio a actualizar
     * @param service - Objeto `Servicio` con los datos actualizados del servicio
     * @returns Observable que emite el servicio actualizado (`Servicio`)
     */
    updateTask(id: number, task: any): Observable<any> {
        const servicioId = Number(id);
        
        // Asegurarse de que equipo sea null si está vacío
        const taskToUpdate = {
            ...task,
            equipo: task.equipo === '' ? null : task.equipo,
            equipos_id: task.equipo === '' ? null : task.equipo,
            tipo: task.tipo === '' ? " " : task.tipo
        };

        console.log('Actualizando servicio:', {
            url: `${this.baseUrl}/service/${servicioId}`,
            data: taskToUpdate,
            equipo: taskToUpdate.equipo,
            equipos_id: taskToUpdate.equipos_id,
            tipo: taskToUpdate.tipo // Agregar log específico para el tipo
        });

        return this._httpClient.put<any>(
            `${this.baseUrl}/service/${servicioId}`, 
            taskToUpdate
        ).pipe(
            tap((response) => {
                console.log('Servicio actualizado exitosamente:', response);
                
                // Actualizar la lista de servicios
                const currentServices = this._services.getValue();
                if (currentServices) {
                    const index = currentServices.findIndex(s => s.servicios_id === servicioId);
                    if (index !== -1) {
                        const updatedServices = [...currentServices];
                        updatedServices[index] = {
                            ...updatedServices[index],
                            ...taskToUpdate,
                            tipo: taskToUpdate.tipo // Asegurarse de que el tipo se actualice correctamente
                        };
                        this._services.next(updatedServices);
                    }
                }
            }),
            catchError(err => {
                console.error('Error al actualizar el servicio:', err);
                return throwError(() => new Error(`Error al actualizar el servicio ${servicioId}: ${err.message}`));
            })
        );
    }
    
    

    /**
     * Delete the task
     *
     * @param id
     */
    deleteTaskO(id: string): Observable<boolean>
    {
        return this.tasks$.pipe(
            take(1),
            switchMap(tasks => this._httpClient.delete('api/apps/tasks/task', {params: {id}}).pipe(
                map((isDeleted: boolean) =>
                {
                    // Find the index of the deleted task
                    const index = tasks.findIndex(item => item.id === id);

                    // Delete the task
                    tasks.splice(index, 1);

                    // Update the tasks
                    this._tasks.next(tasks);

                    // Return the deleted status
                    return isDeleted;
                }),
            )),
        );
    }

    
   /**
     * Elimina un servicio en el servidor
     *
     * @param servicios_id - ID del servicio a eliminar
     * @returns Observable que emite un booleano indicando el estado de la eliminación (`true` si fue eliminado)
     */
    deleteTask(servicios_id: number): Observable<boolean> {
        return this.services$.pipe(
            take(1), // Toma el valor actual de `services$` y completa la suscripción
            switchMap(services => 
                this._httpClient.delete(`${this.baseUrl}/service/${servicios_id}`, { params: { servicios_id: servicios_id.toString() } }).pipe(
                    map((isDeleted: boolean) => {
                        // Encuentra el índice del servicio eliminado en la lista de servicios
                        const index = services.findIndex(item => item.servicios_id === servicios_id);

                        // Elimina el servicio de la lista si existe
                        if (index !== -1) {
                            services.splice(index, 1);
                        }

                        // Emite la lista de servicios actualizada
                        this._services.next(services);

                        // Retorna el estado de eliminación (`true` si fue eliminado)
                        return isDeleted;
                    }),
                )
            ),
        );
    }

    /**
     * Obtiene la lista de equipos
     */
    getEquipos(): Observable<any[]> {
        return this._httpClient.get<any[]>(`${this.baseUrl}/equipos`);
    }

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

    buscarEquipos3(query: string): Observable<any[]> {
        return this._httpClient.get<any>(`${this.baseUrl}/equipment`, {
            params: { 
                search: query,
                page: '0',
                size: '10'
            }
        }).pipe(
            map(response => {
                // Verifica si la respuesta tiene la estructura esperada
                if (response && response.data && Array.isArray(response.data)) {
                    return response.data.map(equipo => ({
                        equipos_id: equipo.equipos_id,
                        codigo: equipo.codigo
                    }));
                }
                // Si no tiene la estructura esperada, retorna un array vacío
                console.warn('Respuesta inesperada del servidor:', response);
                return [];
            })
        );
    }

    /**
     * Obtiene la lista de productos con paginación, ordenación y búsqueda
     *
     * @param page - Número de página (por defecto es 0)
     * @param size - Tamaño de página, es decir, el número de productos por página (por defecto es 10)
     * @param sort - Campo de ordenación (por defecto es 'name')
     * @param order - Orden ascendente o descendente (por defecto es 'asc')
     * @param search - Término de búsqueda para filtrar productos (por defecto es una cadena vacía)
     * @returns Observable que emite un objeto con la paginación (`InventoryPagination`) y la lista de productos (`InventoryProduct[]`)
     */
    buscarEquipos(
        page: number = 0,
        size: number = 15,
        sort: string = 'name',
        order: 'asc' | 'desc' | '' = 'asc',
        search: string = '',
    ): Observable<{ pagination: InventoryPagination; equipments: InventoryEquipment[] }> {
        console.log('Buscando equipos con término:', search);
        
        return this._httpClient.get<any>(`${this.baseUrl}/equipment?page=${page}&limit=${size}`, {
            params: { 
                page: '' + page, 
                size: '' + size, 
                sort, 
                order, 
                search 
            },
        }).pipe(
            map((response) => {
                console.log('Respuesta de búsqueda de equipos:', response);

                const pagination: InventoryPagination = {
                    length: response.data.total,
                    size: response.data.perPage,
                    page: response.data.currentPage,
                    lastPage: response.data.totalPages,
                    startIndex: ((response.data.currentPage) * response.data.perPage),
                    endIndex: response.data.currentPage * response.data.perPage,
                };

                // Filtrar y mapear los equipos
                const equipments = response.data.data
                    .filter((item: any) => item?.equipos_id?.codigo && item.equipos_id.codigo.trim() !== '')
                    .map((item: any) => ({
                        equipos_id: item.equipos_id.equipos_id,
                        codigo: item.equipos_id.codigo.trim(),
                        tipo: item.equipos_id.tipo,
                        tipoDescripcion: item.equipos_id.tipoDescripcion,
                        lector: typeof item.equipos_id.lector === 'string' 
                            ? item.equipos_id.lector === 'true'
                            : !!item.equipos_id.lector
                    }))
                    .filter((item: any, index: number, self: any[]) =>
                        index === self.findIndex((t) => t.codigo === item.codigo)
                    );

                return { pagination, equipments };
            })
        );
    }

    getEquipoById(equipos_id: number): Observable<any> {
        return this._httpClient.get<any>(`${this.baseUrl}/equipment/${equipos_id}`).pipe(
            map(response => {
                if (response && response.data) {
                    return {
                        equipos_id: response.data.equipos_id,
                        codigo: response.data.codigo
                    };
                }
                return null;
            })
        );
    }

    buscarEmpleados(nombreCompleto: string): Observable<Empleado[] | null> {
        const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
        const body = `nombre_completo=${encodeURIComponent(nombreCompleto)}`;

        console.log('Buscando empleados con término:', nombreCompleto);

        return this._httpClient.post<{ status: boolean; data: Empleado[] }>(
            `${this.baseUrlAlt}/api/empleados`, 
            body, 
            { headers }
        ).pipe(
            map(response => {
                console.log('Respuesta completa de la API:', response);
                if (response && response.status && Array.isArray(response.data)) {
                    return response.data;
                }
                return null;
            }),
            catchError(error => {
                console.error('Error en la búsqueda de empleados:', error);
                return of(null);
            })
        );
    }

    buscarEmpleadosPorCI(ci: string): Observable<any> {
        const formData = new FormData();
        formData.append('dato', ci);
        formData.append('tipo', 'D');

        console.log('Enviando búsqueda de CI:', ci); // Debug

        return this._httpClient.post(
            `${this.baseUrl}/proxy/buscar-empleados-ci`,
            formData
        ).pipe(
            tap(response => console.log('Respuesta de la API:', response)), // Debug
            map(response => {
                if (response && response['data']) {
                    // La API devuelve los datos en response.data
                    return Array.isArray(response['data']) ? response['data'] : [response['data']];
                }
                return [];
            }),
            catchError(error => {
                console.error('Error en buscarEmpleadosPorCI:', error);
                return of([]);
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

        return this._httpClient.get<any>(`${this.baseUrl}/user`, {
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
                            nombre: 'TODOS'
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
     * Obtener servicios por tipo
     */
    getServicesByType(
        tipoServicio: string,
        page: number = 1,
        limit: number = 100
    ): Observable<{ pagination: InventoryPagination; services: Servicio[] }> {
        // Modificar los parámetros para adaptarse a la nueva estructura de API
        let params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString())
            .set('tipo', tipoServicio)
            .set('estado', this.ESTADO_SIN_ASIGNAR);

        // Cambiar el endpoint a uno que esté disponible actualmente
        return this._httpClient.get<any>(`${this.baseUrl}/service`, { params })
            .pipe(
                map(response => {
                    // Verificar la estructura de la respuesta
                    console.log('Respuesta de getServicesByType:', response);

                    const pagination: InventoryPagination = {
                        length: response.data.total,
                        size: response.data.perPage,
                        page: response.data.currentPage,
                        lastPage: response.data.totalPages,
                        startIndex: ((response.data.currentPage) * response.data.perPage),
                        endIndex: response.data.currentPage * response.data.perPage,
                    };

                    // Mapear los servicios, considerando la posible estructura anidada
                    const services = response.data.data
                        .map((item: any) => ({
                            servicios_id: item.servicios_id?.servicios_id || item.servicios_id,
                            nombreSolicitante: item.nombreSolicitante || item.servicios_id?.nombreSolicitante || '',
                            problema: item.problema || item.servicios_id?.problema || '',
                            tipo: item.tipo || item.servicios_id?.tipo,
                            estado: item.estado || item.servicios_id?.estado,
                            tecnicoAsignado: item.tecnicoAsignado || item.servicios_id?.tecnicoAsignado || null,
                            oficinaSolicitante: item.oficinaSolicitante || item.servicios_id?.oficinaSolicitante || '',
                        }))
                        .filter((service: any) => service.estado === this.ESTADO_SIN_ASIGNAR && service.tipo === tipoServicio);

                    // Eliminar duplicados
                    const uniqueServices = services.filter((service, index, self) =>
                        index === self.findIndex((s) => s.servicios_id === service.servicios_id)
                    );

                    // Ordenar por ID de forma descendente
                    const sortedServices = uniqueServices.sort((a, b) => b.servicios_id - a.servicios_id);

                    // Actualizar estado global
                    this._services.next(sortedServices);
                    this._pagination.next(pagination);

                    return { pagination, services: sortedServices };
                }),
                catchError(error => {
                    console.error('Error en getServicesByType:', error);
                    
                    // Mostrar mensaje de error
                    //this._snackBar.open('No se pudieron cargar los servicios', 'Cerrar', { 
                      //  duration: 3000 
                    //});

                    // Devolver un observable con datos vacíos
                    return of({ 
                        pagination: {
                            length: 0,
                            size: 0,
                            page: 0,
                            lastPage: 0,
                            startIndex: 0,
                            endIndex: 0,
                        }, 
                        services: [] 
                    });
                })
            );
    }

    // Agregar este método público en TasksService
    updateServices(services: Servicio[]): void {
        this._services.next(services);
    }

    // Agregar este método público en TasksService
    updatePagination(pagination: InventoryPagination): void {
        this._pagination.next(pagination);
    }

    // Método para enviar notificación push
    enviarNotificacionPush(notificacion: {
        userId: number;
        title: string;
        body: string;
        data?: {
            tipo: string;
            accion: string;
        };
        type?: string;
    }): Observable<any> {
        const endpoint = `http://localhost:3002/api/notifications/send`;

        // Obtener token de autenticación (asegúrate de tener un método para obtener el token)
        const token = localStorage.getItem('token') || '';

        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });

        // Preparar payload exactamente como en el ejemplo de Postman
        const payload = {
            userId: notificacion.userId,
            title: notificacion.title,
            body: notificacion.body,
            data: notificacion.data || {
                tipo: 'mensaje',
                accion: 'abrir_chat'
            },
            type: notificacion.type || 'message'
        };

        // Log detallado de la solicitud
        console.group('📨 Detalles de Envío de Notificación');
        console.log('🌐 Endpoint:', endpoint);
        console.log('📦 Payload:', JSON.stringify(payload, null, 2));
        console.groupEnd();

        return this._httpClient.post(endpoint, payload, { 
            headers,
            observe: 'response',
            responseType: 'json'
        }).pipe(
            map(response => {
                console.group('✅ Respuesta de Notificación');
                console.log('📊 Código de estado:', response.status);
                console.log('📨 Respuesta completa:', response.body);
                console.groupEnd();
                return response.body;
            }),
            catchError(error => {
                console.group('❌ Error de Notificación');
                console.error('Detalles del error:', error);
                console.groupEnd();

                // Mostrar mensaje de error al usuario
                this._snackBar.open('Error al enviar notificación', 'Cerrar', { duration: 3000 });

                return throwError(() => error);
            })
        );
    }

    // Método para obtener un nuevo token
    obtenerNuevoToken(): Observable<string> {
        // Usar el endpoint de refresh token
        return this._httpClient.post<{token: string}>(`${this.baseUrl}/auth/refresh-token`, {}).pipe(
            map(response => {
                if (response && response.token) {
                    console.log('Nuevo token obtenido');
                    return response.token;
                }
                throw new Error('No se pudo obtener un nuevo token');
            }),
            catchError(error => {
                console.error('Error al obtener nuevo token', error);
                // Si falla, podrías redirigir al login o mostrar un mensaje
                this._snackBar.open('Su sesión ha expirado. Por favor, inicie sesión nuevamente.', 'Cerrar', {
                    duration: 5000
                });
                
                // Opcional: Cerrar sesión si no se puede obtener un nuevo token
                this.logout();
                
                return throwError(() => error);
            })
        );
    }

    // Método de logout (asegúrate de importar los servicios necesarios)
    private logout() {
        // Limpiar datos de sesión
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirigir a página de login
        this._router.navigate(['/login']);
    }

    // Método para obtener el ID del usuario actual
    private obtenerIdUsuarioActual(): string {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const userData = JSON.parse(userStr);
                return userData.data.usuarios_id;
            } catch (error) {
                console.error('Error al obtener ID de usuario', error);
                return '';
            }
        }
        return '';
    }

    /**
     * Obtener destinatarios según filtros
     * @param filtros Filtros para buscar destinatarios
     */
    obtenerDestinatarios(filtros: FiltroNotificacion): Observable<DestinatarioNotificacion[]> {
        return this._httpClient.post<DestinatarioNotificacion[]>(
            `${this.baseUrl}/destinatarios`, 
            filtros
        );
    }

    /**
     * Obtener historial de notificaciones
     * @param servicioId ID del servicio (opcional)
     */
    obtenerHistorialNotificaciones(servicioId?: number): Observable<NotificacionPush[]> {
        let params = new HttpParams();
        if (servicioId) {
            params = params.set('servicioId', servicioId.toString());
        }

        return this._httpClient.get<NotificacionPush[]>(
            `${this.baseUrl}/notificaciones`, 
            { params }
        ).pipe(
            map(notificaciones => {
                this._notificaciones.next(notificaciones);
                return notificaciones;
            }),
            catchError(error => {
                console.error('Error al obtener historial de notificaciones', error);
                return of([]);
            })
        );
    }

    /**
     * Observable para acceder a las notificaciones
     */
    get notificaciones$(): Observable<NotificacionPush[]> {
        return this._notificaciones.asObservable();
    }

    subirImagenNotificacion(formData: FormData) {
        return this._httpClient.post('/api/notificaciones/imagen', formData);
    }

    // Método para validar contraseña
    validarContrasena(contrasena: string): Observable<boolean> {
        const endpoint = `${this.baseUrl}/auth/validar-contrasena`;
        
        return this._httpClient.post<boolean>(endpoint, { contrasena }).pipe(
            catchError(error => {
                console.error('Error al validar contraseña:', error);
                return of(false);
            })
        );
    }

    // Método para obtener usuarios de ejemplo
    obtenerUsuarios(termino?: string): Observable<Usuario[]> {
        // Datos de ejemplo de usuarios
        const usuariosEjemplo: Usuario[] = [
            { 
                id: 1, 
                nombre: 'Juan Pérez', 
                carnet: 'JP001', 
                rol: 'usuario', 
                unidad: 'Sistemas' 
            },
            { 
                id: 2, 
                nombre: 'María González', 
                carnet: 'MG002', 
                rol: 'tecnico', 
                unidad: 'Soporte' 
            },
            { 
                id: 3, 
                nombre: 'Carlos Rodríguez', 
                carnet: 'CR003', 
                rol: 'admin', 
                unidad: 'Infraestructura' 
            },
            { 
                id: 4, 
                nombre: 'Ana Martínez', 
                carnet: 'AM004', 
                rol: 'usuario', 
                unidad: 'Recursos Humanos' 
            },
            { 
                id: 5, 
                nombre: 'Luis Fernández', 
                carnet: 'LF005', 
                rol: 'tecnico', 
                unidad: 'Sistemas' 
            },
            { 
                id: 6, 
                nombre: 'Elena Sánchez', 
                carnet: 'ES006', 
                rol: 'usuario', 
                unidad: 'Soporte' 
            },
            { 
                id: 7, 
                nombre: 'Pedro Ramírez', 
                carnet: 'PR007', 
                rol: 'admin', 
                unidad: 'Infraestructura' 
            },
            { 
                id: 8, 
                nombre: 'Laura Torres', 
                carnet: 'LT008', 
                rol: 'tecnico', 
                unidad: 'Recursos Humanos' 
            },
            { 
                id: 9, 
                nombre: 'Miguel Hernández', 
                carnet: 'MH009', 
                rol: 'usuario', 
                unidad: 'Sistemas' 
            },
            { 
                id: 10, 
                nombre: 'Sofía Díaz', 
                carnet: 'SD010', 
                rol: 'tecnico', 
                unidad: 'Soporte' 
            }
        ];

        // Convertir a Observable
        return of(usuariosEjemplo).pipe(
            // Si se proporciona un término, filtrar
            map(usuarios => {
                if (!termino) return usuarios;
                
                termino = termino.toLowerCase().trim();
                
                return usuarios.filter(usuario => 
                    usuario.nombre.toLowerCase().includes(termino) || 
                    usuario.carnet.toLowerCase().includes(termino)
                );
            }),
            // Simular un retraso de red
            delay(300)
        );
    }

    // Método para buscar usuarios por nombre
    buscarUsuariosPorNombre(nombre: string): Observable<Usuario[]> {
        return this.obtenerUsuarios(nombre);
    }

    // Método para buscar usuarios por carnet
    buscarUsuariosPorCarnet(carnet: string): Observable<Usuario[]> {
        return this.obtenerUsuarios(carnet);
    }

    // Comentar o eliminar este método
    // guardarHistorialNotificacion(notificacion: NotificacionPush): Observable<any> {
    //     return this._httpClient.post(`${this.baseUrl}/notificaciones/historial`, notificacion);
    // }

    private registrarErrorLog(error: any, contexto: string) {
        console.group('Error de Notificación');
        console.log('Contexto:', contexto);
        console.log('Tipo de error:', error.constructor.name);
        console.log('Código de estado:', error.status);
        console.log('Mensaje de error:', error.message);
        console.log('Cuerpo del error:', error.error);
        console.groupEnd();

        // Opcional: Guardar en localStorage
        try {
            const logs = JSON.parse(localStorage.getItem('error_logs') || '[]');
            logs.push({
                contexto,
                mensaje: error.message,
                timestamp: new Date().toISOString(),
                detalles: error
            });
            localStorage.setItem('error_logs', JSON.stringify(logs));
        } catch (e) {
            console.error('Error al guardar log en localStorage', e);
        }
    }

    // Método para descargar logs
    private descargarLogsComoArchivo() {
        const logs = JSON.parse(localStorage.getItem('error_logs') || '[]');
        
        const logTexto = logs.map(log => 
            `[${log.timestamp}] Contexto: ${log.contexto}\n` +
            `Mensaje: ${log.mensaje}\n` +
            `Detalles: ${JSON.stringify(log.detalles)}\n` +
            `---\n`
        ).join('\n');

        const blob = new Blob([logTexto], { type: 'text/plain' });
        const nombreArchivo = `logs_${new Date().toISOString().replace(/:/g, '-')}.txt`;

        const enlace = document.createElement('a');
        enlace.href = window.URL.createObjectURL(blob);
        enlace.download = nombreArchivo;
        
        document.body.appendChild(enlace);
        enlace.click();
        document.body.removeChild(enlace);
    }

    // Método para buscar usuarios
    buscarUsuarios(filtros: any): Observable<any> {
        // Construir parámetros de consulta
        const params = new HttpParams({ 
            fromObject: Object.entries(filtros)
                .reduce((acc, [key, value]) => {
                    // Convertir valores a cadena
                    acc[key] = value ? String(value) : '';
                    return acc;
                }, {}) 
        });

        return this._httpClient.get<any>(`${this.baseUrl}/usuarios-app/buscar`, { params });
    }

    // Método para enviar notificación broadcast
    enviarNotificacionBroadcast(notificacion: {
        title: string;
        body: string;
        data?: {
            tipo: string;
            accion: string;
        };
        type?: string;
    }): Observable<any> {
        const endpoint = `http://localhost:3002/api/notifications/broadcast`;

        // Obtener token de autenticación
        const token = localStorage.getItem('token') || '';

        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });

        // Preparar payload
        const payload = {
            title: notificacion.title,
            body: notificacion.body,
            data: notificacion.data || {
                tipo: 'anuncio',
                accion: 'abrir_anuncios'
            },
            type: notificacion.type || 'announcement'
        };

        // Log detallado de la solicitud
        console.group('📨 Detalles de Envío de Notificación Broadcast');
        console.log('🌐 Endpoint:', endpoint);
        console.log('📦 Payload:', JSON.stringify(payload, null, 2));
        console.groupEnd();

        return this._httpClient.post(endpoint, payload, { 
            headers,
            observe: 'response',
            responseType: 'json'
        }).pipe(
            map(response => {
                console.group('✅ Respuesta de Notificación Broadcast');
                console.log('📊 Código de estado:', response.status);
                console.log('📨 Respuesta completa:', response.body);
                console.groupEnd();
                return response.body;
            }),
            catchError(error => {
                console.group('❌ Error de Notificación Broadcast');
                console.error('Detalles del error:', error);
                console.groupEnd();

                // Mostrar mensaje de error al usuario
                this._snackBar.open('Error al enviar notificación global', 'Cerrar', { duration: 3000 });

                return throwError(() => error);
            })
        );
    }
}
