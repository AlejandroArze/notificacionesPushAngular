import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { InventoryBrand, InventoryCategory, BienesResponse, InventoryPagination, InventoryProduct, InventoryTag, InventoryVendor,Empleado,Servicio } from 'app/modules/admin/apps/services/list/inventory.types';
import { BehaviorSubject,  filter, map, Observable, of, switchMap, take, tap, throwError,catchError,} from 'rxjs';
import { environment } from 'environments/environment'; 
import { shareReplay } from 'rxjs/operators';

import { forkJoin } from 'rxjs';

const now = new Date();
//const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

const formattedDate: string = new Date().toISOString();



import { InventoryEquipment } from './inventory.types'; 

@Injectable({providedIn: 'root'})
export class InventoryService
{
    // Private
    private _brands: BehaviorSubject<InventoryBrand[] | null> = new BehaviorSubject(null);
    private _categories: BehaviorSubject<InventoryCategory[] | null> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<InventoryPagination | null> = new BehaviorSubject(null);
    //private _product: BehaviorSubject<InventoryProduct | null> = new BehaviorSubject(null);
    //private _products: BehaviorSubject<InventoryProduct[] | null> = new BehaviorSubject(null);
    private _equipment: BehaviorSubject<InventoryEquipment| null> = new BehaviorSubject(null);
    private _services: BehaviorSubject<Servicio[]| null> = new BehaviorSubject(null);
    // `BehaviorSubject` para almacenar el producto actual seleccionado (`InventoryProduct`). Se inicializa como `null`.

    private _equipments: BehaviorSubject<InventoryEquipment[] | null> = new BehaviorSubject(null);
       // `BehaviorSubject` para almacenar la lista de productos (`InventoryProduct[]`). Se inicializa como `null`.

    
    private _tags: BehaviorSubject<InventoryTag[] | null> = new BehaviorSubject(null);
    private _vendors: BehaviorSubject<InventoryVendor[] | null> = new BehaviorSubject(null);
    private _bienes = new BehaviorSubject<any>(null);
    private apiUrl = 'https://appgamc.cochabamba.bo/transparencia/servicio/ws-consulta-bienes.php';
    private apiUrlEmpleado = 'https://appgamc.cochabamba.bo/transparencia/servicio/buscar-empleados.php';


    private baseUrl = environment.baseUrl;//llamamos a los enviment de la url
    private baseUrlAlt = environment.baseUrlAlt;//llamamos al environment alternativo

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient)
    {
    }

    // Método para obtener el listado de equipos
    list(page: number, limit: number): Observable<any> {
        return this._httpClient.get<Servicio>(`${this.baseUrl}/equipment?page=${page}&limit=${limit}`);
      }
  

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for brands
     */
    get brands$(): Observable<InventoryBrand[]>
    {
        return this._brands.asObservable();
    }

    /**
     * Getter for categories
     */
    get categories$(): Observable<InventoryCategory[]>
    {
        return this._categories.asObservable();
    }

    /**
     * Getter for pagination
     */
    get pagination$(): Observable<InventoryPagination>
    {
        return this._pagination.asObservable();
    }
    get services$(): Observable<Servicio[]>
    {
        return this._services.asObservable();
    }

    /**
     * Getter for product
     
    get product$(): Observable<InventoryProduct>
    {
        return this._product.asObservable();
    }
    */
    /**
     * Getter for products
     
    get products$(): Observable<InventoryProduct[]>
    {
        return this._products.asObservable();
    }
        */

     /**
     * Getter for product
     * 
     * get equipment$(): Observable<Servicio>
     {
         return this._equipment.asObservable();
     }
 
     */
     
     /**
      * Getter for products
      */
     get equipments$(): Observable<InventoryEquipment[]>
     {
         return this._equipments.asObservable();
     }

    /**
     * Getter for tags
     */
    get tags$(): Observable<InventoryTag[]>
    {
        return this._tags.asObservable();
    }

    /**
     * Getter for vendors
     */
    get vendors$(): Observable<InventoryVendor[]>
    {
        return this._vendors.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get brands
     */
    getBrands(): Observable<InventoryBrand[]>
    {
        return this._httpClient.get<InventoryBrand[]>('api/apps/ecommerce/inventory/brands').pipe(
            tap((brands) =>
            {
                this._brands.next(brands);
            }),
        );
    }

    /**
     * Get categories
     */
    getCategories(): Observable<InventoryCategory[]>
    {
        return this._httpClient.get<InventoryCategory[]>('api/apps/ecommerce/inventory/categories').pipe(
            tap((categories) =>
            {
                this._categories.next(categories);
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
    

    
    getServices(
        page: number = 0,
        size: number = 10,
        sort: string = 'fechaRegistro',
        order: 'asc' | 'desc' | '' = 'desc',
        search: string = ''
    ): Observable<{ pagination: InventoryPagination; services: Servicio[] }> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('limit', size.toString())
            .set('sort', sort)
            .set('order', order)
            .set('search', search);

        return this._httpClient.get<any>(`${this.baseUrl}/service`, { params }).pipe(
            map((response) => {
                const pagination: InventoryPagination = {
                    length: response.data.total,
                    size: response.data.perPage,
                    page: response.data.currentPage,
                    lastPage: response.data.totalPages,
                    startIndex: response.data.currentPage * response.data.perPage,
                    endIndex: response.data.currentPage * response.data.perPage
                };

                const services = response.data.data.map((item: any) => item.servicios_id);

                this._pagination.next(pagination);
                this._services.next(services);

                return { pagination, services };
            })
        );
    }
    

    
    


 /**
     * Obtiene un producto por su ID
     *
     * @param  equipos_id - ID del producto a obtener
     * @returns Observable que emite el producto (`InventoryProduct`) o un error si no se encuentra
     */

 /**
 * Obtiene un servicio por su ID del servidor
 *
 * @param servicios_id - ID del servicio a obtener
 * @returns Observable que emite el servicio con información adicional procesada
 */
getServiceById(servicios_id: number): Observable<{ message: string; data: Servicio }> {
    console.log('Enviando solicitud a la API con ID:', servicios_id);

    return this._httpClient.get<{ message: string; data: Servicio }>(`${this.baseUrl}/service/${servicios_id}`).pipe(
        map((response) => {
            console.log('Datos recibidos de la API:', response);
            const service = response.data;
            return service; // Retorna el servicio para procesar en los siguientes pasos
        }),
        switchMap((service) => {
            const requests: Observable<any>[] = [];

            // Si existe `tecnicoAsignado`, realizar una solicitud para obtener su información
            if (service.tecnicoAsignado) {
                const tecnicoId = Number(service.tecnicoAsignado);
                if (!isNaN(tecnicoId)) {
                    requests.push(
                        this._httpClient.get<{ message: string; data: { nombres: string; apellidos: string } }>(
                            `${this.baseUrl}/user/${tecnicoId}`
                        ).pipe(
                            map((userResponse) => {
                                service.tecnicoAsignadoString = `${userResponse.data.nombres} ${userResponse.data.apellidos}`;
                            })
                        )
                    );
                }
            }
            else {
                // Si no existe técnico asignado, asignar un valor predeterminado
                console.warn('El técnico asignado no está definido o es nulo.');
                service.tecnicoAsignadoString = ''; // Valor predeterminado
            }

             // Si existe `tecnicoAsignado`, realizar una solicitud para obtener su información
             if (service.tecnicoRegistro) {
                const tecnicoId = Number(service.tecnicoRegistro);
                if (!isNaN(tecnicoId)) {
                    requests.push(
                        this._httpClient.get<{ message: string; data: { nombres: string; apellidos: string } }>(
                            `${this.baseUrl}/user/${tecnicoId}`
                        ).pipe(
                            map((userResponse) => {
                                service.tecnicoRegistroString = `${userResponse.data.nombres} ${userResponse.data.apellidos}`;
                            })
                        )
                    );
                }
            }
            else {
                // Si no existe técnico asignado, asignar un valor predeterminado
                console.warn('El técnico asignado no está definido o es nulo.');
                service.tecnicoRegistroString = ''; // Valor predeterminado
            }



            // Si existe `tipo`, realizar una solicitud para obtener su descripción
            /*
            if (service.tipo) {
                requests.push(
                    this._httpClient.get<{ message: string; data: { tipos_id: number; descripcion: string } }>(
                        `${this.baseUrl}/type/${service.tipo}`
                    ).pipe(
                        map((typeResponse) => {
                            service.tipoDescripcion = typeResponse.data.descripcion;
                        })
                    )
                );
            }
                */

            return requests.length > 0
                    ? forkJoin(requests).pipe(
                        map(() => ({ message: 'Service fetched successfully', data: service }))
                    )
                    : of({ message: 'Service fetched successfully', data: service }); // Retornar directamente si no hay solicitudes

        }),
        catchError((error) => {
            console.error('Error al obtener el servicio:', error);
            return throwError(() => new Error('No se pudo encontrar el servicio con el ID ' + servicios_id + '!'));
        })
    );
}






    

 /**
 * Crea un nuevo servicio en el servidor
 *
 * @returns Observable que emite el nuevo servicio creado (`Servicio`)
 */
createService(serviceData:  any = {}): Observable<Servicio> {
    const defaultData2: Servicio = {
        nombreResponsableEgreso: " ",
        cargoSolicitante: " ",
        informe: " ",
        cargoResponsableEgreso: " ",
        oficinaSolicitante: " ",
        fechaRegistro: formattedDate,
        equipo: 1,
        problema: " ",
        telefonoResponsableEgreso: " ",
        gestion: 3,
        telefonoSolicitante: " ",
        tecnicoAsignado: 3,
        observaciones: " ",
        tipoResponsableEgreso: " ",
        estado: " ",
        tipoSolicitante: " ",
        fechaTerminado: " ",
        oficinaResponsableEgreso: " ",
        numero: 464,
        fechaInicio: " ",
        fechaEgreso: " ",
        ciSolicitante: " ",
        nombreSolicitante: " ",
        tipo: " ",
        tecnicoRegistro: 3,
        tecnicoEgreso: " ",
        ciResponsableEgreso: " ",
        ...serviceData // Sobrescribe los valores predeterminados con los datos proporcionados
    };

    return this._httpClient.post<{ message: string, data: Servicio }>(`${this.baseUrl}/service`, defaultData2).pipe(
        map(response => {
            // Mapea y devuelve solo el objeto Servicio desde la respuesta
            return response.data;
        }),
        tap(newService => {
            // Actualiza la lista actual de servicios con el nuevo servicio
            const currentServices = this._services.getValue();
            this._services.next([newService, ...currentServices]);
        }),
        catchError(error => {
            // Manejo de errores
            console.error('Error al crear el servicio:', error);
            return throwError(() => new Error('No se pudo crear el servicio debido a un error en el servidor.'));
        })
    );
}



    



   /**
 * Actualiza un servicio en el servidor
 *
 * @param servicios_id - ID del servicio a actualizar
 * @param service - Objeto `Servicio` con los datos actualizados del servicio
 * @returns Observable que emite el servicio actualizado (`Servicio`)
 */
updateService(servicios_id: number, service: Servicio): Observable<Servicio> {
    return this._httpClient.put<{ message: string, data: Servicio }>(
        `${this.baseUrl}/service/${servicios_id}`,
        service // Asegúrate de enviar el objeto actualizado como cuerpo
    ).pipe(
        map(response => {
            const updatedService = {
                ...response.data,
                servicios_id: Number(response.data.servicios_id) // Normalizando servicios_id a número
            };

            // Obtener los servicios actuales
            const currentServices = this._services.getValue(); // Cambiar a _services si es una lista
            const index = currentServices.findIndex(item => item.servicios_id === servicios_id);
            if (index !== -1) {
                // Actualizar de manera inmutable la lista de servicios
                const updatedServices = [
                    ...currentServices.slice(0, index),
                    { ...currentServices[index], ...updatedService },
                    ...currentServices.slice(index + 1)
                ];
                console.log('Servicios actualizados:', updatedServices);

                // Emitir la lista actualizada
                this._services.next(updatedServices);
            }
            return updatedService;
        }),
        catchError(error => {
            console.error('Error al actualizar el servicio:', error);
            return throwError(() => new Error('Error al actualizar el servicio.'));
        })
    );
}


   

   /**
 * Elimina un servicio en el servidor
 *
 * @param servicios_id - ID del servicio a eliminar
 * @returns Observable que emite un booleano indicando el estado de la eliminación (`true` si fue eliminado)
 */
deleteService(servicios_id: number): Observable<boolean> {
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
     * Get tags
     */
    getTags(): Observable<InventoryTag[]>
    {
        return this._httpClient.get<InventoryTag[]>('api/apps/ecommerce/inventory/tags').pipe(
            tap((tags) =>
            {
                this._tags.next(tags);
            }),
        );
    }

    /**
     * Create tag
     *
     * @param tag
     */
    createTag(tag: InventoryTag): Observable<InventoryTag>
    {
        return this.tags$.pipe(
            take(1),
            switchMap(tags => this._httpClient.post<InventoryTag>('api/apps/ecommerce/inventory/tag', {tag}).pipe(
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
    updateTag(id: string, tag: InventoryTag): Observable<InventoryTag>
    {
        return this.tags$.pipe(
            take(1),
            switchMap(tags => this._httpClient.patch<InventoryTag>('api/apps/ecommerce/inventory/tag', {
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
     * Get vendors
     */
    getVendors(): Observable<InventoryVendor[]>
    {
        return this._httpClient.get<InventoryVendor[]>('api/apps/ecommerce/inventory/vendors').pipe(
            tap((vendors) =>
            {
                this._vendors.next(vendors);
            }),
        );
    }

    /**
   * Observable for bienes data
   */
    get bienes$(): Observable<any> {
        return this._bienes.asObservable();
    }
    

    
    
    /**
   * Get bienes
   */
  
  getBienes(codBienes: string): Observable<BienesResponse | null> {
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');

    const body = `cod_bienes=${encodeURIComponent(codBienes)}`;

    return this._httpClient.post<BienesResponse>('http://localhost:3001/api/proxy', body, { headers }).pipe(
      tap((response) => {
        if (response && response.data) {
          console.log('Bienes encontrados:', response.data);
        }
      })
    );
    }
    // Método para buscar empleados en el backend utilizando el nombre completo como filtro
    getEmpleados(nombreCompleto: string): Observable<Empleado[]> {

    // Creamos un objeto URLSearchParams para enviar los datos de manera codificada (application/x-www-form-urlencoded)
    const body = new URLSearchParams();
    
    // Añadimos el nombre completo como parámetro a la solicitud
    body.set('nombre_completo', nombreCompleto);
  
    // Configuramos las cabeceras para indicar que estamos enviando los datos en formato 'application/x-www-form-urlencoded'
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
  
    // Realizamos una solicitud POST al servidor en el endpoint 'http://localhost:3001/api/empleados'
    // Enviamos los datos (body) y las cabeceras configuradas
    return this._httpClient.post<{ status: boolean; data: Empleado[] }>('http://localhost:3001/api/empleados', body.toString(), { headers })
      
      // Usamos el operador 'map' de RxJS para extraer solo el campo 'data' de la respuesta
      .pipe(
        
        map(response => response.data)
    
    ); // Devolvemos solo los empleados, que están dentro del campo 'data'
      

  }
  // Método para obtener bienes desde el backend utilizando un código de bienes como parámetro
buscarEquipos(page: number, limit: number, search: string): Observable<{ equipos_id: number; codigo: string }[]> {
    const url = `${this.baseUrl}/equipment?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`;

    return this._httpClient.get<any>(url).pipe(
        map((response) => {
            if (response?.data?.data) {
                // Mapear los datos para extraer `equipos_id` y `codigo`
                return response.data.data.map((equipment: any) => ({
                    equipos_id: equipment.equipos_id.equipos_id || 0,
                    codigo: equipment.equipos_id.codigo?.trim() || '',
                }));
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



    buscarEmpleados(nombreCompleto: string): Observable<Empleado[] | null> {
        console.log("nombreCompleto",nombreCompleto);
        // Configuramos las cabeceras de la solicitud para indicar que el contenido será de tipo 'application/x-www-form-urlencoded'
        const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    
        // Creamos el cuerpo de la solicitud, codificando el parámetro nombre_completo para asegurar que sea adecuado para la URL
        const body = `nombre_completo=${encodeURIComponent(nombreCompleto)}`;
        console.log("body",body);
        
        return this._httpClient.post<{ status: boolean; data: Empleado[] }>(`${this.baseUrlAlt}/api/empleados`, body, { headers })
        .pipe(
            // Usamos el operador 'map' para extraer solo el array de empleados desde el campo 'data'
            map(response => {
            // Si la respuesta tiene éxito y contiene datos, devolvemos el array de empleados
            if (response ) {
                //console.log('Empleados encontrados:', response.data);
                return response.data; // Extraemos el array de empleados

            } else {
                return null; // En caso de error, devolvemos null
            }
            }),
            // Usamos el operador 'tap' para realizar una acción secundaria sin modificar la respuesta
            tap((empleados) => {
            // Si encontramos empleados, los mostramos en la consola
            if (empleados) {
                console.log('Empleados encontrados:', empleados);
            }
            })
        );
    }

    buscarEmpleados23(nombreCompleto: string): Observable<Empleado[]> {
        console.log("nombreCompleto:", nombreCompleto);
    
        // Configuramos las cabeceras de la solicitud
        const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    
        // Creamos el cuerpo de la solicitud
        const body = `nombre_completo=${encodeURIComponent(nombreCompleto)}`;
        console.log("body:", body);
    
        return this._httpClient.post<{ status: boolean; data: Empleado[] }>(`${this.baseUrlAlt}/api/empleados`, body, { headers })
            .pipe(
                map(response => {
                    if (response && response.status) {
                        // Si hay éxito, devolvemos los empleados
                        console.log('Empleados encontrados:', response.data);
                        return response.data;
                    } else {
                        // Si no hay éxito, devolvemos un array con un objeto ficticio
                        console.warn('No se encontraron empleados o la respuesta es inválida.');
                        return [{
                            nombre_completo: nombreCompleto,
                            otroNombre: '',
                            nombre: '',
                            paterno: '',
                            materno: '',
                            fechanac: '',
                            sexo: '',
                            nroItem: '',
                            tipoContrato: '',
                            cargo: '',
                            unidad: '',
                            numDocumento: '',
                            expedidoci: '',
                            email: '',
                            telefono: '',
                            direccion: '',
                            fechaIncorporacion: '',
                            fechaBaja: null,
                            resideCapital: '',
                        }];
                    }
                }),
                catchError((error) => {
                    console.error('Error en la búsqueda de empleados:', error);
                    return of([]);
                })
            );
    }
    
    
    
  
  
  
    
      

    searchVendors(query: string): Observable<any[]> {
        const body = new URLSearchParams();
        body.set('nombre_completo', query);

        const headers = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded'
        });

        return this._httpClient.post<any[]>(this.apiUrl, body.toString(), { headers });
    }

    

    // Obtener tipo de hardware por ID
    getHardwareTypeById(tiposId: number): Observable<any> {
        return this._httpClient.get(`${this.baseUrl}/type/${tiposId}`).pipe(
            map((response: any) => response.data),
            catchError((err) => {
                console.error('Error al obtener el tipo de hardware:', err);
                return throwError(() => new Error('No se pudo obtener el tipo de hardware.'));
            })
        );
    }

    // Guardar tipo de hardware
    saveHardwareType(hardwareData: any): Observable<any> {
        return this._httpClient.post(`${this.baseUrl}/type`, hardwareData).pipe(
            tap(() => console.log('Tipo de hardware guardado correctamente.')),
            catchError((err) => {
                console.error('Error al guardar el tipo de hardware:', err);
                return throwError(() => new Error('No se pudo guardar el tipo de hardware.'));
            })
        );
    }

    buscarTipos(page: number, limit: number, search: string): Observable<{ descripcion: string; tipos_id: number }[]> {
        const url = `${this.baseUrl}/type?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`;
    
        return this._httpClient.get<any>(url).pipe(
            map((response) => {
                if (response?.data?.data) {
                    // Mapear los datos para extraer `descripcion` y `tipos_id`
                    return response.data.data.map((tipo: any) => ({
                        descripcion: tipo.tipos_id.descripcion?.trim() || '',
                        tipos_id: tipo.tipos_id.tipos_id || 0,
                    }));
                    
                } else {
                    console.warn('Respuesta inesperada de la API:', response);
                    return [];
                }
            }),
            catchError((err) => {
                console.error('Error al buscar tipos:', err);
                return of([]); // Devuelve un array vacío en caso de error
            })
        );
    }

    buscarUsuariosTecnico(page: number, limit: number, search: string): Observable<{ usuarios_id: number; nombre: string; apellido: string }[]> {
        const url = `${this.baseUrl}/user?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`;
    
        return this._httpClient.get<any>(url).pipe(
            map((response) => {
                if (response?.data?.data) {
                    // Mapear los datos para extraer `usuarios_id`, `nombres` y `apellidos`
                    return response.data.data.map((user: any) => ({
                        usuarios_id: user.usuarios_id.usuarios_id || 0,
                        nombre: user.usuarios_id.nombres?.trim() || '',
                        apellido: user.usuarios_id.apellidos?.trim() || ''
                    }));
                } else {
                    console.warn('Respuesta inesperada de la API:', response);
                    return [];
                }
            }),
            catchError((err) => {
                console.error('Error al buscar usuarios:', err);
                return of([]); // Devuelve un array vacío en caso de error
            })
        );
    }
    
    getTipoById(tiposId: number): Observable<{ descripcion: string }> {
        return this._httpClient.get<any>(`${this.baseUrl}/type/${tiposId}`).pipe(
            map((response) => {
                if (response?.data?.descripcion) {
                    return { descripcion: response.data.descripcion.trim() };
                } else {
                    throw new Error('No se encontró el tipo con el ID especificado.');
                }
            }),
            catchError((err) => {
                console.error('Error al obtener el tipo por ID:', err);
                return of({ descripcion: '' }); // Devuelve un valor vacío si hay error
            })
        );
    }


    buscarUsuarios(page: number, limit: number, search: string): Observable<{ descripcion: string; tipos_id: number }[]> {
        const url = `${this.baseUrl}/user?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`;
    
        return this._httpClient.get<any>(url).pipe(
            map((response) => {
                if (response?.data?.data) {
                    // Mapear los datos para extraer `descripcion` y `tipos_id`
                    return response.data.data.map((tipo: any) => ({
                        descripcion: tipo.tipos_id.descripcion?.trim() || '',
                        tipos_id: tipo.tipos_id.tipos_id || 0,
                    }));
                    
                } else {
                    console.warn('Respuesta inesperada de la API:', response);
                    return [];
                }
            }),
            catchError((err) => {
                console.error('Error al buscar tipos:', err);
                return of([]); // Devuelve un array vacío en caso de error
            })
        );
    }
    
    
    
}


