import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { InventoryBrand, InventoryCategory, BienesResponse, InventoryPagination, InventoryProduct, InventoryTag, InventoryVendor,Empleado } from 'app/modules/admin/apps/control/list/inventory.types';
import { BehaviorSubject,  filter, map, Observable, of, switchMap, take, tap, throwError,catchError,} from 'rxjs';
import { environment } from 'environments/environment'; 
import { shareReplay } from 'rxjs/operators';

import { forkJoin } from 'rxjs';

const now = new Date();
const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;




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
    private _equipment: BehaviorSubject<InventoryEquipment | null> = new BehaviorSubject(null);
    // `BehaviorSubject` para almacenar el producto actual seleccionado (`InventoryProduct`). Se inicializa como `null`.
    private baseUrlAlt = environment.baseUrlAlt;//llamamos al environment alternativo
    private _equipments: BehaviorSubject<InventoryEquipment[] | null> = new BehaviorSubject(null);
       // `BehaviorSubject` para almacenar la lista de productos (`InventoryProduct[]`). Se inicializa como `null`.

    
    private _tags: BehaviorSubject<InventoryTag[] | null> = new BehaviorSubject(null);
    private _vendors: BehaviorSubject<InventoryVendor[] | null> = new BehaviorSubject(null);
    private _bienes = new BehaviorSubject<any>(null);
    private apiUrl = 'https://appgamc.cochabamba.bo/transparencia/servicio/ws-consulta-bienes.php';
    private apiUrlEmpleado = 'https://appgamc.cochabamba.bo/transparencia/servicio/buscar-empleados.php';


    private baseUrl = environment.baseUrl;//llamamos a los enviment de la url

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient)
    {
    }

    // Método para obtener el listado de equipos
    list(page: number, limit: number): Observable<any> {
        return this._httpClient.get<InventoryEquipment>(`${this.baseUrl}/equipment?page=${page}&limit=${limit}`);
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
     */
     get equipment$(): Observable<InventoryEquipment>
     {
         return this._equipment.asObservable();
     }
 
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
    getEquipments2(
        page: number = 0,
         size: number = 10, 
         sort: string = 'name', 
         order: 'asc' | 'desc' | '' = 'asc', 
         search: string = ''):
        Observable<{ pagination: InventoryPagination; equipments: InventoryEquipment[] }>
    {
        return this._httpClient.get<any>(`${this.baseUrl}/equipment?page=${page}&limit=${size}`, {
            params: {
                page: '' + page,    // Convierte `page` a cadena de texto para incluirlo como parámetro
                size: '' + size,    // Convierte `size` a cadena de texto
                sort,               // Campo de ordenación
                order,              // Orden ascendente o descendente
                search,             // Término de búsqueda
            },
        }).pipe(
            tap((response) =>
            {
                console.log('API ResponseEquipment2:', response);
                 // Crea el objeto `InventoryPagination` con las propiedades que espera el tipo
                const pagination: InventoryPagination = {
                    length: response.data.total,                // Número total de elementos
                    size: response.data.perPage,                // Número de elementos por página
                    page: response.data.currentPage ,        // Página actual, ajustando si es necesario
                    lastPage: response.data.totalPages ,     // Última página disponible
                    startIndex: (response.data.currentPage ) * response.data.perPage,  // Índice de inicio en la página
                    endIndex: response.data.currentPage * response.data.perPage - 1,      // Índice final en la página
                };
                // Actualiza `_pagination` con la información de paginación recibida
                this._pagination.next(pagination);
                this._equipments.next(response.data.data);

                if (response.data && Array.isArray(response.data.data)) {
                    //const products = response.data.data.map(item => this.mapEquipmentToProduct(item.equipos_id));
                    //this._equipments.next(response.data.data.);
                    const equipments = response.data.data.map((item: any) => item.equipos_id);

                } else {
                    console.warn('No hay productos disponibles en la respuesta');
                    this._equipments.next([]);
                }

                // Actualiza `_products` con la lista de productos recibida
               // this._equipments.next(response.equipments); // La lista incluye el atributo `name` de cada producto
            }),
        );
    }
    getEquipments4(
        page: number =0,
        size: number = 10,
        sort: string = 'name',
        order: 'asc' | 'desc' | '' = 'asc',
        search: string = '',
        count2: number=0,
    ): Observable<{ pagination: InventoryPagination; equipments: InventoryEquipment[] }> {
        return this._httpClient.get<any>(`${this.baseUrl}/equipment?page=${page}&limit=${size}`, {
            params: { page: '' + page, size: '' + size, sort, order, search, },
        }).pipe(
            map((response) => {
                console.log('API Response:', response);
                console.log('API search:', search);
                
                
                    // Crear objeto de paginación
                const pagination: InventoryPagination = {
                    length: response.data.total,
                    size: response.data.perPage,
                    page: response.data.currentPage,
                    lastPage: response.data.totalPages,
                    startIndex: ((response.data.currentPage ) * response.data.perPage),
                    endIndex: response.data.currentPage* response.data.perPage ,
                };

                
                
    
                // Desanidar los datos
                const equipments = response.data.data.map((item: any) => item.equipos_id);
    
                // Emitir los datos de paginación y equipos
                this._pagination.next(pagination);
                this._equipments.next(equipments);
    
                return { pagination, equipments };
            })
        );
    }

    getEquipments65(
        page: number = 0,
        size: number = 10,
        sort: string = 'name',
        order: 'asc' | 'desc' | '' = 'asc',
        search: string = '',
        count2: number = 0,
    ): Observable<{ pagination: InventoryPagination; equipments: InventoryEquipment[] }> {
        return this._httpClient.get<any>(`${this.baseUrl}/equipment?page=${page}&limit=${size}`, {
            params: { page: '' + page, size: '' + size, sort, order, search },
        }).pipe(
            map((response) => {
                console.log('API Response:', response);
                console.log('API search:', search);
    
                // Crear objeto de paginación
                const pagination: InventoryPagination = {
                    length: response.data.total,
                    size: response.data.perPage,
                    page: response.data.currentPage,
                    lastPage: response.data.totalPages,
                    startIndex: ((response.data.currentPage) * response.data.perPage),
                    endIndex: response.data.currentPage * response.data.perPage,
                };
    
                // Desanidar los datos y convertir 'lector' a booleano
                const equipments = response.data.data.map((item: any) => {
                    // Asegurarse de que 'lector' sea un valor booleano
                    if (typeof item.lector === 'string') {
                        if (item.lector === 'true') {
                            item.lector = true;  // Convertir 'true' a booleano true
                        } else {
                            item.lector = false; // Convertir todo lo demás a booleano false
                        }
                    }
                    console.log("lector: get equipmet ",item.equipos_id);
                    return item.equipos_id;
                });
    
                // Emitir los datos de paginación y equipos
                this._pagination.next(pagination);
                this._equipments.next(equipments);
    
                return { pagination, equipments };
            })
        );
    }
    
    getEquipmentsOFICIAL(
        page: number = 0,
        size: number = 10,
        sort: string = 'name',
        order: 'asc' | 'desc' | '' = 'asc',
        search: string = '',
        count2: number = 0,
    ): Observable<{ pagination: InventoryPagination; equipments: InventoryEquipment[] }> {
        return this._httpClient.get<any>(`${this.baseUrl}/equipment?page=${page}&limit=${size}`, {
            params: { page: '' + page, size: '' + size, sort, order, search },
        }).pipe(
            map((response) => {
                console.log('API Response:', response);
                console.log('API search:', search);
    
                // Crear objeto de paginación
                const pagination: InventoryPagination = {
                    length: response.data.total,
                    size: response.data.perPage,
                    page: response.data.currentPage,
                    lastPage: response.data.totalPages,
                    startIndex: ((response.data.currentPage) * response.data.perPage),
                    endIndex: response.data.currentPage * response.data.perPage,
                };
    
                // Desanidar los datos y convertir 'lector' a booleano
                const equipments = response.data.data.map((item: any) => {
                    // Asegurarse de que 'lector' sea un valor booleano
                    if (typeof item.lector === 'string') {
                        if (item.lector === 'true') {
                            item.lector = true;  // Convertir 'true' a booleano true
                        } else {
                            item.lector = false; // Convertir todo lo demás a booleano false
                        }
                    }
                    console.log("lector: get equipmet ",item.equipos_id);
                   

                    // Procesar el campo 'tipo' para obtener la descripción
                    if (typeof item.tipos) {
                        const tipoId = Number(item.equipos_id.tipo);
                        if (!isNaN(tipoId)) {
                            // Realizar la solicitud para obtener la descripción del tipo
                            this._httpClient
                                .get<{ message: string; data: { tipos_id: number; descripcion: string; formulario: string; estado: number } }>(
                                    `${this.baseUrl}/type/${tipoId}`
                                )
                                .subscribe({
                                    next: (typeResponse) => {
                                        item.equipos_id.tipoDescripcion = typeResponse.data.descripcion;
                                        console.log(`Descripción obtenida para tipo ${tipoId}: ${item.equipos_id.tipoDescripcion}`);
                                    },
                                    error: (err) => {
                                        console.error(`Error al obtener la descripción del tipo ${tipoId}:`, err);
                                    },
                                });
                        }
                    }
                    console.log("lector: get equipmet ",item.equipos_id);
                    console.log("tipo: get equipmet ",item.equipos_id.tipoDescripcion);
                    return item.equipos_id;
                });
    
                // Emitir los datos de paginación y equipos
                this._pagination.next(pagination);
                this._equipments.next(equipments);
    
                return { pagination, equipments };
            })
        );
    }
    
    
    getEquipments(
        page: number = 0,
        size: number = 10,
        sort: string = 'fechaHora',
        order: 'asc' | 'desc' | '' = 'asc',
        search: string = ''
    ): Observable<{ pagination: InventoryPagination; equipments: InventoryEquipment[] }> {
        return this._httpClient.get<any>(`${this.baseUrl}/lecturas?page=${page}&limit=${size}`, {
            params: { page: '' + page, size: '' + size, sort, order, search },
        }).pipe(
            map((response) => {
                console.log('API Response for Lecturas:', response);
    
                // Crear objeto de paginación
                const pagination: InventoryPagination = {
                    length: response.data.total,
                    size: response.data.perPage,
                    page: response.data.currentPage,
                    lastPage: response.data.totalPages,
                    startIndex: ((response.data.currentPage) * response.data.perPage),
                    endIndex: response.data.currentPage * response.data.perPage,
                };
    
                // Transformar los datos de 'lecturas' al formato InventoryEquipment
                const equipments: InventoryEquipment[] = response.data.data.map((item: any) => {
                    return {
                        equipos_id: item.id,             // Reutilizamos 'equipos_id' para el ID
                        codigo: null,            // Código RFID
                        oficina: item.oficina,          // Oficina donde se registró
                        garantia: item.fecha_hora,      // Fecha y hora asignada a 'garantia'
                        procesador: item.codigo,               // Asignar null a campos no usados
                        memoria: null,
                        tarjetamadre: null,
                        discoduro: null,
                        marca: null,
                        tipoDescripcion: item.accion || 'Pendiente', // Acción se asigna a tipoDescripcion
                    } as InventoryEquipment;
                });
    
                // Emitir los datos de paginación y lecturas transformadas
                this._pagination.next(pagination);
                this._equipments.next(equipments);
    
                return { pagination, equipments };
            })
        );
    }
    
    
    getEquipments43(
        page: number = 0,
        size: number = 10,
        sort: string = 'name',
        order: 'asc' | 'desc' | '' = 'asc',
        search: string = '',
        count2: number = 0,
    ): Observable<{ pagination: InventoryPagination; equipments: InventoryEquipment[] }> {
        return this._httpClient.get<any>(`${this.baseUrl}/equipment?page=${page}&limit=${size}`, {
            params: { page: '' + page, size: '' + size, sort, order, search },
        }).pipe(
            switchMap((response) => {
                console.log('API Response:', response);
                console.log('API search:', search);
    
                // Crear objeto de paginación
                const pagination: InventoryPagination = {
                    length: response.data.total,
                    size: response.data.perPage,
                    page: response.data.currentPage,
                    lastPage: response.data.totalPages,
                    startIndex: ((response.data.currentPage) * response.data.perPage),
                    endIndex: response.data.currentPage * response.data.perPage,
                };
    
                // Desanidar los datos y procesar equipos
                const equipments = response.data.data.map((item: any) => {
                    // Convertir 'lector' a booleano si es necesario
                    if (typeof item.lector === 'string') {
                        item.lector = item.lector === 'true';
                    }
                    return item;
                });
    
                // Crear solicitudes para obtener las descripciones de tipo
                const tipoRequests = equipments.map((equipment) => {
                    if (equipment.tipo) {
                        return this._httpClient.get<{ message: string; data: { tipos_id: number; descripcion: string } }>(
                            `${this.baseUrl}/type/${equipment.tipo}`
                        ).pipe(
                            map((typeResponse) => {
                                equipment.tipoDescripcion = typeResponse.data.descripcion;
                            }),
                            catchError(() => {
                                // Manejar errores por si el tipo no existe
                                console.warn(`Error al obtener tipo para equipo ID ${equipment.equipos_id}`);
                                equipment.tipoDescripcion = 'Desconocido'; // Valor por defecto
                                return [];
                            })
                        );
                    }
                    return of(null);
                });
    
                // Ejecutar todas las solicitudes en paralelo y esperar a que terminen
                return forkJoin(tipoRequests).pipe(
                    map(() => {
                        return { pagination, equipments };
                    })
                );
            }),
            catchError((error) => {
                console.error('Error al obtener los equipos:', error);
                return throwError(() => new Error('No se pudieron cargar los equipos.'));
            })
        );
    }
    


 /**
     * Obtiene un producto por su ID
     *
     * @param  equipos_id - ID del producto a obtener
     * @returns Observable que emite el producto (`InventoryProduct`) o un error si no se encuentra
     */

 

getEquipmentByIdOficial(equipos_id: number): Observable<{ message: string; data: InventoryEquipment }> {
    console.log('Enviando solicitud a la API con ID:', equipos_id);

    return this._httpClient.get<{ message: string; data: InventoryEquipment }>(`${this.baseUrl}/equipment/${equipos_id}`).pipe(
        map((response) => {
            console.log('Datos recibidos de la API:', response);

            const equipment = response.data;
            // Limpiar `funcionario_asignado` y `funcionariousuario`
            if (equipment.funcionarioasignado && typeof equipment.funcionarioasignado === 'string') {
                equipment.funcionarioasignado = equipment.funcionarioasignado.replace(/\s+/g, ' ').trim();
                equipment.funcionariousuario = equipment.funcionariousuario.replace(/\s+/g, ' ').trim();
            }

            // Convertir 'lector' a booleano si es necesario
            if (typeof equipment.lector === 'string') {
                equipment.lector = equipment.lector === 'true';
            }

            return equipment; // Retorna el equipo para procesar en los siguientes pasos
        }),
        switchMap((equipment) => {
            const requests: Observable<any>[] = [];

            // Si existe `responsable`, añadir la solicitud al arreglo
            if (equipment.responsable) {
                const userId = Number(equipment.responsable);
                if (!isNaN(userId)) {
                    requests.push(
                        this._httpClient.get<{ message: string; data: { nombres: string, apellidos: string } }>(`${this.baseUrl}/user/${userId}`).pipe(
                            map((userResponse) => {
                                equipment.responsabledelregistroString = `${userResponse.data.nombres} ${userResponse.data.apellidos}`;
                            })
                        )
                    );
                }
            }

            // Si existe `tipo`, añadir la solicitud al arreglo
            if (equipment.tipo) {
                const tipoId = Number(equipment.tipo);
                if (!isNaN(tipoId)) {
                    requests.push(
                        this._httpClient.get<{ message: string; data: { tipos_id: number, descripcion: string, formulario: string, estado: number } }>(`${this.baseUrl}/type/${tipoId}`).pipe(
                            map((typeResponse) => {
                                equipment.tipoDescripcion = typeResponse.data.descripcion;
                            })
                        )
                    );
                }
            }

            // Ejecutar todas las solicitudes en paralelo y esperar que terminen
            return forkJoin(requests).pipe(
                map(() => ({ message: 'Equipment fetched successfully', data: equipment }))
            );
        }),
        catchError((error) => {
            console.error('Error al obtener el equipo:', error);
            return throwError(() => new Error('No se pudo encontrar el equipo con el ID ' + equipos_id + '!'));
        })
    );
}


/**
 * Obtiene una lectura por su ID y la transforma a InventoryEquipment
 *
 * @param  id - ID de la lectura a obtener
 * @returns Observable que emite la lectura transformada (`InventoryEquipment`)
 */
getEquipmentById(id: number): Observable<{ message: string; data: InventoryEquipment }> {
    console.log('Enviando solicitud a la API para la lectura con ID:', id);

    return this._httpClient.get<{ message: string; data: any }>(`${this.baseUrl}/lecturas/${id}`).pipe(
        map((response) => {
            console.log('API Response for Lectura:', response);

            // Extraer los datos de la lectura y transformarlos
            const item = response.data;

            const transformedEquipment: InventoryEquipment = {
                equipos_id: item.id,            // ID de la lectura
                codigo: null,           // Código RFID
                oficina: item.oficina,         // Oficina donde se registró
                garantia: item.fecha_hora,     // Fecha y hora como garantía
                tipoDescripcion: item.accion || 'Pendiente', // Acción asignada a tipoDescripcion
                // Asignamos null a los campos no aplicables
                procesador: item.codigo,
                memoria: null,
                tarjetamadre: null,
                discoduro: null,
                marca: null,
                tipo: null,
                modelo: null,
                serie: null,
                so: null,
                responsable: null,
                mac: null,
                responsabledelregistroString: null,
            };

            return { 
                message: 'Lectura obtenida y transformada correctamente', 
                data: transformedEquipment 
            };
        }),
        catchError((error) => {
            console.error('Error al obtener la lectura por ID:', error);
            return throwError(() => new Error(`No se pudo encontrar la lectura con el ID ${id}!`));
        })
    );
}






    /*
     * Crea un nuevo producto en el servidor
     *
     * @returns Observable que emite el nuevo producto creado (`InventoryProduct`)
     
    createProduct12(): Observable<InventoryProduct>
    {
        return this.products$.pipe(
            take(1),  // Toma el primer valor emitido por `products$` y completa la suscripción
            switchMap(products => this._httpClient.post<InventoryProduct>('api/apps/ecommerce/inventory/product', {}).pipe(
                map((newProduct) =>
                {
                    // Actualiza `_products` añadiendo el nuevo producto al inicio de la lista existente
                    this._products.next([newProduct, ...products]);

                    // Retorna el nuevo producto
                    return newProduct;
                }),
            )),
        );
    }
*/

    /**
     * Crea un nuevo producto en el servidor
     *
     * @returns Observable que emite el nuevo producto creado (`InventoryProduct`)
     */

    createEquipment3(): Observable<InventoryEquipment>
    {
        const defaultData = {
        
            "ip": " ",
            "procesador": " ",
            "funcionariousuario": "Nuevo Equipo ",
            "lector": " ",
            "tarjetavideo": " ",
            "funcionarioasignado": " ",
            "oficina": " ",
            "fecharegistro": " ",
            "codigo": " ",
            "memoria": " ",
            "tarjetamadre": " ",
            "antivirus": " ",
            "garantia": " ",
            "discoduro": " ",
            "marca": " ",
            "tipo": 1,
            "modelo": " ",
            "serie": " ",
            "so": " ",
            "responsable": 1,
            "mac": " "
    
        };
        return this.equipments$.pipe(
            take(1),  // Toma el primer valor emitido por `products$` y completa la suscripción
            switchMap(equipments => this._httpClient.post<InventoryEquipment>(`${this.baseUrl}/equipment`, defaultData).pipe(
                map((newEquipment) =>
                {
                    // Actualiza `_products` añadiendo el nuevo producto al inicio de la lista existente
                    this._equipments.next([newEquipment, ...equipments]);
                   // this._equipments.next([newEquipment, ...equipments]);
                    console.error('Error al crear el equipo:', newEquipment);
                    console.error('Error al crear el equipo:',equipments);
                    // Retorna el nuevo producto
                    return newEquipment;
                }),
            )),
        );
    }
    /**
 * Crea un nuevo equipo en el servidor.
 *
 * 
 * @returns Observable que emite el nuevo equipo creado (`InventoryEquipment`).
 */
createEquipment8(): Observable<InventoryEquipment> {
    const defaultData = {
        
        "ip": " ",
        "procesador": " ",
        "funcionariousuario": "Nuevo Equipo ",
        "lector": " ",
        "tarjetavideo": " ",
        "funcionarioasignado": " ",
        "oficina": " ",
        "fecharegistro": " ",
        "codigo": " ",
        "memoria": " ",
        "tarjetamadre": " ",
        "antivirus": " ",
        "garantia": " ",
        "discoduro": " ",
        "marca": " ",
        "tipo": 1,
        "modelo": " ",
        "serie": " ",
        "so": " ",
        "responsable": 1,
        "mac": " "

    };
    
    return this._httpClient.post<InventoryEquipment>(`${this.baseUrl}/equipment`, defaultData ).pipe(
        take(1),  // Toma el primer valor emitido por `products$` y completa la suscripción
       
        tap((newEquipment) => {
            // Obtén la lista actual de equipos desde el BehaviorSubject.
            const currentEquipments = this._equipments.getValue();
            
            // Añade el nuevo equipo al inicio de la lista y actualiza el BehaviorSubject.
            this._equipments.next([newEquipment, ...currentEquipments]);
        }),
        catchError((error) => {
            console.error('Error al crear el equipo:', error);
            return throwError(() => new Error('No se pudo crear el equipo debido a un error en el servidor.'));
        })
    );
}
/**
 * Crea un nuevo equipo en el servidor.
 *
 * @param equipmentData Datos adicionales para el nuevo equipo, opcional.
 * @returns Observable que emite el nuevo equipo creado (`InventoryEquipment`).
 */
createEquipment43(equipmentData: any = {}): Observable<InventoryEquipment> {
    const defaultData = {
        ...equipmentData,
        
        "ip": " ",
        "procesador": " ",
        "funcionariousuario": "Nuevo Equipo ",
        "lector": " ",
        "tarjetavideo": " ",
        "funcionarioasignado": " ",
        "oficina": " ",
        "fecharegistro": " ",
        "codigo": " ",
        "memoria": " ",
        "tarjetamadre": " ",
        "antivirus": " ",
        "garantia": " ",
        "discoduro": " ",
        "marca": " ",
        "tipo": 1,
        "modelo": " ",
        "serie": " ",
        "so": " ",
        "responsable": 1,
        "mac": " "

    };

    return this._httpClient.post<InventoryEquipment>(`${this.baseUrl}/equipment`, defaultData).pipe(
        take(1),  // Toma el primer valor emitido por `products$` y completa la suscripción
        tap((newEquipment) => {
            // Obtén la lista actual de equipos desde el BehaviorSubject.
            const currentEquipments = this._equipments.getValue();
            
            // Añade el nuevo equipo al inicio de la lista y actualiza el BehaviorSubject.
            this._equipments.next([newEquipment, ...currentEquipments]);
            
            console.error('Error al crear el equipo:', newEquipment);
            console.error('Error al crear el equipo:', currentEquipments);
            return newEquipment;
        }),
        catchError((error) => {
            console.error('Error al crear el equipo:', error);
            return throwError(() => new Error('No se pudo crear el equipo debido a un error en el servidor.'));
        })
    );
}


createEquipment(equipmentData: any = {}): Observable<InventoryEquipment> {
    const defaultData = {
        ...equipmentData,
        "ip": " ",
        "procesador": " ",
        "funcionariousuario": "Nuevo Equipo ",
        "lector": "false",
        "tarjetavideo": " ",
        "funcionarioasignado": " ",
        "oficina": " ",
        "fecharegistro": formattedDate,
        "codigo": " ",
        "memoria": " ",
        "tarjetamadre": " ",
        "antivirus": " ",
        "garantia": " ",
        "discoduro": " ",
        "marca": " ",
        "tipo": 1,
        "modelo": " ",
        "serie": " ",
        "so": " ",
        "responsable": 1,
        "mac": " "
    };

    return this._httpClient.post<{ message: string, data: InventoryEquipment }>(`${this.baseUrl}/equipment`, defaultData).pipe(
        map(response => {
          // Mapea y devuelve solo el objeto InventoryEquipment desde la respuesta
          return response.data;
        }),
        tap(newEquipment => {
          // Actualiza la lista actual de equipos con el nuevo equipo
          const currentEquipments = this._equipments.getValue();
          this._equipments.next([newEquipment, ...currentEquipments]);
        }),
        catchError(error => {
          // Manejo de errores
          console.error('Error al crear el equipo:', error);
          return throwError(() => new Error('No se pudo crear el equipo debido a un error en el servidor.'));
        })
      );
}


    

    /*
     * Update product
     *
     * @param id
     * @param product
     
    updateProduct12(id: string, product: InventoryProduct): Observable<InventoryProduct>
    {
        return this.products$.pipe(
            take(1),
            switchMap(products => this._httpClient.patch<InventoryProduct>('api/apps/ecommerce/inventory/product', {
                id,
                product,
            }).pipe(
                map((updatedProduct) =>
                {
                    // Find the index of the updated product
                    const index = products.findIndex(item => item.id === id);

                    // Update the product
                    products[index] = updatedProduct;

                    // Update the products
                    this._products.next(products);

                    // Return the updated product
                    return updatedProduct;
                }),
                switchMap(updatedProduct => this.product$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() =>
                    {
                        // Update the product if it's selected
                        this._product.next(updatedProduct);

                        // Return the updated product
                        return updatedProduct;
                    }),
                )),
            )),
        );
    }
*/

    /**
     * Actualiza un producto en el servidor
     *
     * @param equipos_id - ID del producto a actualizar
     * @param equipment - Objeto `InventoryProduct` con los datos actualizados del producto
     * @returns Observable que emite el producto actualizado (`InventoryProduct`)
     */
    updateEquipment44(equipos_id: number, equipment: InventoryEquipment): Observable<InventoryEquipment>
    {
        return this.equipments$.pipe(
            take(1), // Toma el valor actual de `products$` y completa la suscripción
            switchMap(equipments => this._httpClient.put<InventoryEquipment>(`${this.baseUrl}/equipment/${equipos_id}`, {
                equipos_id,      // Incluye el ID del producto en la solicitud
                equipment, // Incluye los datos actualizados del producto
            }).pipe(
                map((updatedEquipment) =>
                {
                    // Encuentra el índice del producto actualizado en la lista de productos
                    const index = equipments.findIndex(item => item.equipos_id === equipos_id);

                    // Actualiza el producto en la lista con los datos recibidos del servidor
                    equipments[index] = updatedEquipment;

                    // Emite la lista de productos actualizada
                    this._equipments.next(equipments);

                    // Retorna el producto actualizado
                    return updatedEquipment;
                }),
                switchMap(updatedEquipment => this.equipment$.pipe(
                    take(1), // Toma el valor actual de `product$` y completa la suscripción
                    filter(item => item && item.equipos_id === equipos_id), // Filtra para verificar si el producto actual es el mismo que se actualizó
                    tap(() =>
                    {
                        // Actualiza `_product` si el producto actualizado es el actualmente seleccionado
                        this._equipment.next(updatedEquipment);
                        console.log('Producto actualizado con éxito:', updatedEquipment);

                        // Retorna el producto actualizado
                        return updatedEquipment;
                    }),
                    catchError(error => {
                        console.error('Error al actualizar el equipo:', error);
                        return throwError(() => new Error('Error al actualizar el equipo.'));
                    })
                )),
            )),
        );
    }
     
      updateEquipment78(equipos_id: number, equipment: InventoryEquipment): Observable<InventoryEquipment>
      {
          return this.equipments$.pipe(
              take(1), // Toma el valor actual de `products$` y completa la suscripción
              switchMap(equipments => this._httpClient.put<InventoryEquipment>(`${this.baseUrl}/equipment/${equipos_id}`, {
                  equipos_id,      // Incluye el ID del producto en la solicitud
                  equipment, // Incluye los datos actualizados del producto
              }).pipe(
                  map((updatedEquipment) =>
                  {
                      // Encuentra el índice del producto actualizado en la lista de productos
                      const index = equipments.findIndex(item => item.equipos_id === equipos_id);
  
                      // Actualiza el producto en la lista con los datos recibidos del servidor
                      equipments[index] = updatedEquipment;
  
                      // Emite la lista de productos actualizada
                      this._equipments.next(equipments);
  
                      // Retorna el producto actualizado
                      return updatedEquipment;
                  }),
                  switchMap(updatedEquipment => this.equipment$.pipe(
                      take(1), // Toma el valor actual de `product$` y completa la suscripción
                      filter(item => item && item.equipos_id === equipos_id), // Filtra para verificar si el producto actual es el mismo que se actualizó
                      tap(() =>
                      {
                          // Actualiza `_product` si el producto actualizado es el actualmente seleccionado
                          this._equipment.next(updatedEquipment);
                          console.log('Producto actualizado con éxito:', updatedEquipment);
  
                          // Retorna el producto actualizado
                          return updatedEquipment;
                      }),
                      catchError(error => {
                          console.error('Error al actualizar el equipo:', error);
                          return throwError(() => new Error('Error al actualizar el equipo.'));
                      })
                  )),
              )),
          );
      }
      updateEquipment345(equipos_id: number, equipment: InventoryEquipment): Observable<InventoryEquipment> {
        return this._equipments.pipe(
            take(1), // Toma el estado actual del array de equipos
            switchMap(equipments => {
                return this._httpClient.put<{message: string, data: InventoryEquipment}>(`${this.baseUrl}/equipment/${equipos_id}`, equipment).pipe(
                    map(response => {
                        const updatedEquipment = response.data; // Extrae 'data' del objeto de respuesta
    
                        // Encuentra el índice del equipo actualizado en la lista de equipos
                        const index = equipments.findIndex(item => item.equipos_id === equipos_id);
    
                        // Si el equipo existe, actualiza el producto en la lista con los datos recibidos del servidor
                        if (index !== -1) {
                           
                        }
                        equipments[index] = updatedEquipment;
                        this._equipments.next(equipments); // Emite la lista de equipos actualizada
    
                        console.log('Producto actualizado con éxito:', updatedEquipment);
                        return updatedEquipment;
                    }),
                    catchError(error => {
                        console.error('Error al actualizar el equipo:', error);
                        return throwError(() => new Error('Error al actualizar el equipo.'));
                    })
                );
            })
        );
    }
    updateEquipment43(equipos_id: number, equipment: InventoryEquipment): Observable<InventoryEquipment> {
        return this._equipments.pipe(
            take(1),
            switchMap(equipments => {
                return this._httpClient.put<{message: string, data: InventoryEquipment}>(`${this.baseUrl}/equipment/${equipos_id}`, equipment).pipe(
                    map(response => {
                        const updatedEquipment = response.data;
                        // Actualiza el array de equipos de manera inmutable
                        const updatedEquipments = equipments.map(item => 
                            item.equipos_id === equipos_id ? updatedEquipment : item
                        );
    
                        //this._equipments.next(updatedEquipments); // Emite la lista de equipos actualizada
    
                        console.log('Producto actualizado con éxito:', updatedEquipment);
                        return updatedEquipment;
                    }),
                    catchError(error => {
                        console.error('Error al actualizar el equipo:', error);
                        return throwError(() => new Error('Error al actualizar el equipo.'));
                    })
                );
            })
        );
    }
    updateEquipment3(equipos_id: number, equipment: InventoryEquipment): Observable<InventoryEquipment> {
        return this._equipments.pipe(
            take(1),
            switchMap(equipments => {
                return this._httpClient.put<{message: string, data: InventoryEquipment}>(`${this.baseUrl}/equipment/${equipos_id}`, equipment).pipe(
                    map(response => {
                        const updatedEquipment = response.data;
                        const updatedEquipments = equipments.map(item =>
                            item.equipos_id === equipos_id ? updatedEquipment : item
                        );
    
                        // Verifica si realmente hay un cambio antes de emitir una actualización
                        if (JSON.stringify(equipments) !== JSON.stringify(updatedEquipments)) {
                            this._equipments.next(updatedEquipments);
                            console.log('Producto actualizado con éxito:', updatedEquipment);
                        }
    
                        return updatedEquipment;
                    }),
                    catchError(error => {
                        console.error('Error al actualizar el equipo:', error);
                        return throwError(() => new Error('Error al actualizar el equipo.'));
                    })
                );
            })
        );
    }
    updateEquipment344(equipos_id: number, equipment: InventoryEquipment): Observable<InventoryEquipment> {
        return this._equipments.pipe(
            take(1),
            switchMap(equipments => {
                return this._httpClient.put<{message: string, data: InventoryEquipment}>(`${this.baseUrl}/equipment/${equipos_id}`, equipment).pipe(
                    map(response => {
                        const updatedEquipment = response.data;
                        const updatedEquipments = equipments.map(item =>
                            item.equipos_id === equipos_id ? updatedEquipment : item
                        );
    
                        // Verifica si realmente hay un cambio antes de emitir una actualización
                        if (JSON.stringify(equipments) !== JSON.stringify(updatedEquipments)) {
                            this._equipments.next(updatedEquipments);
                            //this._equipments.next([newEquipment, ...currentEquipments]);
                            console.log('Producto actualizado con éxito:', updatedEquipment);
                        }
    
                        return updatedEquipment;
                    }),
                    catchError(error => {
                        console.error('Error al actualizar el equipo:', error);
                        return throwError(() => new Error('Error al actualizar el equipo.'));
                    })
                );
            })
        );
    }
    updateEquipment234(equipos_id: number, equipment: InventoryEquipment): Observable<InventoryEquipment> {
        return this._equipments.pipe(
            take(1),
            switchMap(equipments => this._httpClient.put<{ message: string, data: InventoryEquipment }>(`${this.baseUrl}/equipment/${equipos_id}`, equipment)
                .pipe(
                    map(response => {
                        const updatedEquipment = response.data;
                        // Actualiza la lista de equipos de manera inmutable
                        const updatedEquipments = equipments.map(item =>
                            item.equipos_id === equipos_id ? updatedEquipment : item
                        );
    
                        // Solo actualiza el BehaviorSubject si hay cambios
                        if (JSON.stringify(equipments) !== JSON.stringify(updatedEquipments)) {
                            this._equipments.next(updatedEquipments);
                            console.log('Producto actualizado con éxito:', updatedEquipment);
                        }
    
                        this._equipment.pipe(
                            take(1),
                            filter(item => item && item.equipos_id === equipos_id),
                            tap(() => {
                                this._equipment.next(updatedEquipment);
                            })
                        ).subscribe(); // Asegúrate de manejar la desuscripción adecuadamente
    
                        return updatedEquipment;
                    }),
                    catchError(error => {
                        console.error('Error al actualizar el equipo:', error);
                        return throwError(() => new Error('Error al actualizar el equipo.'));
                    })
                ))
        );
    }
    updateEquipment2(equipos_id: number, equipment: InventoryEquipment): Observable<InventoryEquipment> {
        return this._equipments.pipe(
            take(1), // Toma el estado actual del array de equipos
            switchMap(equipments => this._httpClient.put<{message: string, data: InventoryEquipment}>(`${this.baseUrl}/equipment/${equipos_id}`, equipment)
                .pipe(
                    map(response => {
                        const updatedEquipment = response.data;
                        // Realiza una actualización inmutable del array
                        const updatedEquipments = equipments.map(item => item.equipos_id === equipos_id ? {...item, ...updatedEquipment} : item);
                        
                        // Verifica si realmente hay un cambio antes de emitir una actualización
                        if (JSON.stringify(equipments) !== JSON.stringify(updatedEquipments)) {
                            this._equipments.next(updatedEquipments);
                            console.log('Equipo actualizado con éxito:', updatedEquipment);
                        }
    
                        return updatedEquipment;
                    }),
                    switchMap(updatedEquipment => this._equipment.pipe(
                        take(1),
                        filter(item => item && item.equipos_id === equipos_id),
                        tap(() => {
                            this._equipment.next(updatedEquipment);
                            console.log('Estado del equipo actualizado en la vista');
                        })
                    )),
                    catchError(error => {
                        console.error('Error al actualizar el equipo:', error);
                        return throwError(() => new Error('Error al actualizar el equipo.'));
                    })
                ))
        );
    }
    /**
     * Actualiza un producto en el servidor
     *
     * @param equipos_id - ID del producto a actualizar
     * @param equipment - Objeto `InventoryProduct` con los datos actualizados del producto
     * @returns Observable que emite el producto actualizado (`InventoryProduct`)
     */
    updateEquipment45(equipos_id: number, equipment: InventoryEquipment): Observable<InventoryEquipment> {
        return this._equipments.pipe(
            take(1), // Toma el estado actual del array de equipos
            switchMap(equipments => this._httpClient.put<{message: string, data: InventoryEquipment}>(`${this.baseUrl}/equipment/${equipos_id}`, equipment)
                .pipe(
                    map(response => {
                        const updatedEquipment = response.data; // Toma los datos desde response.data
                    // Encuentra el índice del equipo actualizado en la lista de equipos
                    const index = equipments.findIndex(item => item.equipos_id === equipos_id);

                    if (index !== -1) {
                        // Realiza una actualización inmutable del equipo específico
                        equipments[index] = {...equipments[index], ...updatedEquipment};

                        // Emite la lista de equipos actualizada solo si hay cambios
                        if (JSON.stringify(equipments[index]) !== JSON.stringify(updatedEquipment)) {
                           // this._equipments.next([...equipments]);
                            console.log('Equipo actualizado con éxito:', updatedEquipment);
                        }
                    }
                    

                    return updatedEquipment;
                    }),
                    switchMap(updatedEquipment => this._equipment.pipe(
                        take(1),
                        filter(item => item && item.equipos_id === equipos_id),
                        tap(() => {
                            //this._equipment.next(updatedEquipment); // Asegúrate de actualizar el estado local del equipo actualizado
                            console.log('Estado del equipo actualizado en la vista');
                        })
                    )),
                    catchError(error => {
                        console.error('Error al actualizar el equipo:', error);
                        return throwError(() => new Error('Error al actualizar el equipo.'));
                    })
                ))
        );
    }
    /**
 * Actualiza un equipo en el servidor y actualiza el estado local.
 *
 * @param equipos_id - ID del equipo a actualizar.
 * @param equipment - Datos actualizados del equipo.
 * @returns Observable que emite el equipo actualizado (`InventoryEquipment`).
 */
updateEquipment3234(equipos_id: number, equipment: InventoryEquipment): Observable<InventoryEquipment> {
    // Realiza la solicitud HTTP para actualizar el equipo
    return this._httpClient.put<{message: string, data: InventoryEquipment}>(`${this.baseUrl}/equipment/${equipos_id}`, equipment)
        .pipe(
            take(1),
            map(response => {
                const updatedEquipment = response.data; // Extrae los datos actualizados

                // Actualiza el BehaviorSubject que mantiene el equipo seleccionado si coincide con el ID actualizado
                this.equipment$.pipe(
                    take(1),
                    filter(currentEquipment => currentEquipment && currentEquipment.equipos_id === equipos_id),
                    tap(currentEquipment => {
                        this._equipment.next({...currentEquipment, ...updatedEquipment});
                        console.log('Estado del equipo actualizado en la vista:', updatedEquipment);
                    })
                ).subscribe();

                // Además, podría ser necesario actualizar una lista global de equipos si existe tal estructura
                // Esto es opcional y depende de la estructura de tu aplicación
                if (this._equipments) {
                    this._equipments.pipe(
                        take(1),
                       
                        
                        map(equipments => {
                            const updatedEquipments = equipments.map(item =>
                                item.equipos_id === equipos_id ? {...item, ...updatedEquipment} : item
                            );
                            this._equipments.next(updatedEquipments); // Emite el nuevo array actualizado
                        
                        })
                    ).subscribe();
                }
                

                return updatedEquipment;
            }),
            
            
            catchError(error => {
                console.error('Error al actualizar el equipo:', error);
                return throwError(() => new Error('Error al actualizar el equipo.'));
            })
        );
}
updateEquipment2345(equipos_id: number, equipment: InventoryEquipment): Observable<InventoryEquipment> {
    return this._httpClient.put<{message: string, data: InventoryEquipment}>(`${this.baseUrl}/equipment/${equipos_id}`, equipment)
        .pipe(
            map(response => {
                const updatedEquipment = {
                    ...response.data,
                    equipos_id: Number(response.data.equipos_id)  // Normalizando equipos_id a número
                };
                
                const currentEquipments = this._equipments.getValue();
                const index = currentEquipments.findIndex(item => item.equipos_id === equipos_id);
                if (index !== -1) {
                    // Actualiza de manera inmutable
                    const updatedEquipments = [
                        ...currentEquipments.slice(0, index),
                        {...currentEquipments[index], ...updatedEquipment},
                        ...currentEquipments.slice(index + 1)
                    ];
                    console.log('veamos que pasa',updatedEquipments)
                    this._equipments.next(updatedEquipments);
                }
                return updatedEquipment;
            }),
            catchError(error => {
                console.error('Error al actualizar el equipo:', error);
                return throwError(() => new Error('Error al actualizar el equipo.'));
            })
        );
}

updateEquipment(equipos_id: number, equipment: InventoryEquipment): Observable<InventoryEquipment> {
    // Convertir 'lector' a 'true' o 'false' en formato de texto si es un booleano
    const equipmentWithTextLector = {
        ...equipment,
        lector: typeof equipment.lector === 'boolean' ? (equipment.lector ? 'true' : 'false') : equipment.lector
    };

    return this._httpClient.put<{ message: string, data: InventoryEquipment }>(`${this.baseUrl}/equipment/${equipos_id}`, equipmentWithTextLector)
        .pipe(
            map(response => {
                const updatedEquipment = {
                    ...response.data,
                    equipos_id: Number(response.data.equipos_id)  // Normalizando equipos_id a número
                };
                
                const currentEquipments = this._equipments.getValue();
                const index = currentEquipments.findIndex(item => item.equipos_id === equipos_id);
                if (index !== -1) {
                    // Actualiza de manera inmutable la lista de equipos
                    const updatedEquipments = [
                        ...currentEquipments.slice(0, index),
                        {...currentEquipments[index], ...updatedEquipment},
                        ...currentEquipments.slice(index + 1)
                    ];
                    console.log('Equipos actualizados:', updatedEquipments);
                    this._equipments.next(updatedEquipments);
                }
                return updatedEquipment;
            }),
            catchError(error => {
                console.error('Error al actualizar el equipo:', error);
                return throwError(() => new Error('Error al actualizar el equipo.'));
            })
        );
}


/**
 * Actualiza un equipo en el servidor y actualiza el estado local.
 *
 * @param equipos_id - ID del equipo a actualizar.
 * @param equipment - Datos actualizados del equipo.
 * @returns Observable que emite el equipo actualizado (`InventoryEquipment`).
 */
updateEquipment434(equipos_id: number, equipment: InventoryEquipment): Observable<InventoryEquipment> {
    // Realiza la solicitud HTTP para actualizar el equipo
    return this._httpClient.put<{message: string, data: InventoryEquipment}>(`${this.baseUrl}/equipment/${equipos_id}`, equipment)
        .pipe(
            map(response => {
                const updatedEquipment = response.data; // Extrae los datos actualizados

                // Actualiza el BehaviorSubject que mantiene el equipo seleccionado si coincide con el ID actualizado
                const currentEquipment = this._equipment.getValue();
                if (currentEquipment && currentEquipment.equipos_id === equipos_id) {
                    this._equipment.next({...currentEquipment, ...updatedEquipment});
                    console.log('Estado del equipo actualizado en la vista:', updatedEquipment);
                }

                // Actualizar la lista global de equipos
                const currentEquipments = this._equipments.getValue();
                const index = currentEquipments.findIndex(item => item.equipos_id === equipos_id);
                if (index !== -1) {
                    currentEquipments[index] = {...currentEquipments[index], ...updatedEquipment};
                    this._equipments.next([...currentEquipments]); // Emite la lista de equipos actualizada
                }

                return updatedEquipment;
            }),
            catchError(error => {
                console.error('Error al actualizar el equipo:', error);
                return throwError(() => new Error('Error al actualizar el equipo.'));
            })
        );
}


    
    
    
    
    
    
    
    
    

    updateEquipment34(equipos_id: number, equipment: InventoryEquipment): Observable<InventoryEquipment> {
        return this._httpClient.put<InventoryEquipment>(`${this.baseUrl}/equipment/${equipos_id}`, equipment).pipe(
            take(1), // Toma el valor actual de `product$` y completa la suscripción
            //filter(item => item && item.equipos_id === equipos_id), // Filtra para verificar si el producto actual es el mismo que se actualizó
               
            tap(updatedEquipment => {
                
                // Aquí puedes implementar la lógica para actualizar el estado local si es necesario
                console.log('Producto actualizado con éxito:', updatedEquipment);
                // Retorna el producto actualizado
                return updatedEquipment;
            }),
            catchError(error => {
                console.error('Error al actualizar el equipo:', error);
                return throwError(() => new Error('Error al actualizar el equipo.'));
            })
        );
    }
    updateEquipment09(equipos_id: number, equipment: InventoryEquipment): Observable<InventoryEquipment> {
        return this._httpClient.put<InventoryEquipment>(`${this.baseUrl}/equipment/${equipos_id}`, equipment).pipe(
            tap(updatedEquipment => {
                // Actualiza el equipo en la lista y el estado local
                const currentEquipments = this._equipments.value;
                const index = currentEquipments.findIndex(item => item.equipos_id === equipos_id);
                if (index !== -1) {
                    currentEquipments[index] = updatedEquipment;
                    this._equipments.next(currentEquipments); // Asegúrate de que este código esté dentro del if
                    this._equipment.next(updatedEquipment); // Esto actualiza el BehaviorSubject con el equipo actualizado
                    console.log('Producto actualizado con éxito:', updatedEquipment);
                }
            }),
            catchError(error => {
                console.error('Error al actualizar el equipo:', error);
                return throwError(() => new Error('Error al actualizar el equipo.'));
            })
        );
    }
    
      
    

    /*
     * Delete the product
     *
     * @param id
    
    deleteProduct12(id: string): Observable<boolean>
    {
        return this.products$.pipe(
            take(1),
            switchMap(products => this._httpClient.delete('api/apps/ecommerce/inventory/product', {params: {id}}).pipe(
                map((isDeleted: boolean) =>
                {
                    // Find the index of the deleted product
                    const index = products.findIndex(item => item.id === id);

                    // Delete the product
                    products.splice(index, 1);

                    // Update the products
                    this._products.next(products);

                    // Return the deleted status
                    return isDeleted;
                }),
            )),
        );
    }
         */


    /**
     * Elimina un producto en el servidor
     *
     * @param equipos_id - ID del producto a eliminar
     * @returns Observable que emite un booleano indicando el estado de la eliminación (`true` si fue eliminado)
     */
    deleteEquipment(equipos_id : number): Observable<boolean>
    {
        return this.equipments$.pipe(
            take(1), // Toma el valor actual de `products$` y completa la suscripción
            switchMap(equipments => this._httpClient.delete(`${this.baseUrl}/equipment/${equipos_id}`, { params: { equipos_id } }).pipe(
                map((isDeleted: boolean) =>
                {
                    // Encuentra el índice del producto eliminado en la lista de productos
                    const index = equipments.findIndex(item => item.equipos_id === equipos_id);

                    // Elimina el producto de la lista
                    equipments.splice(index, 1);

                    // Emite la lista de productos actualizada
                    this._equipments.next(equipments);

                    // Retorna el estado de eliminación (`true` si fue eliminado)
                    return isDeleted;
                }),
            )),
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

    /*
     * Delete the tag
     *
     * @param id
     
    deleteTag(id: string): Observable<boolean>
    {
        return this.tags$.pipe(
            take(1),
            switchMap(tags => this._httpClient.delete('api/apps/ecommerce/inventory/tag', {params: {id}}).pipe(
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
                switchMap(isDeleted => this.products$.pipe(
                    take(1),
                    map((products) =>
                    {
                        // Iterate through the contacts
                        products.forEach((product) =>
                        {
                            const tagIndex = product.tags.findIndex(tag => tag === id);

                            // If the contact has the tag, remove it
                            if ( tagIndex > -1 )
                            {
                                product.tags.splice(tagIndex, 1);
                            }
                        });

                        // Return the deleted status
                        return isDeleted;
                    }),
                )),
            )),
        );
    }
*/
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
  getBienes9(codBienes: string): Observable<any> {
    const body = { cod_bienes: codBienes };

    return this._httpClient.post<any>(this.apiUrl, body).pipe(
      tap((response) => {
        if (response.status) {
          this._bienes.next(response.data);
        }
      })
    );
  }

  getBienes99(codBienes: string): Observable<any> {
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/x-www-form-urlencoded');

    const body = `cod_bienes=${encodeURIComponent(codBienes)}`;

    return this._httpClient.post('https://appgamc.cochabamba.bo/transparencia/servicio/ws-consulta-bienes.php', body, { headers });
  }
  getBienes344(codBienes: string): Observable<any> {
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/x-www-form-urlencoded');

    const body = `cod_bienes=${encodeURIComponent(codBienes)}`;

    return this._httpClient.post(`${this.baseUrlAlt}/api/proxy`, body, { headers }).pipe(
        tap((response) => {
          if (response.status) {
            this._bienes.next(response.data);
          }
        })
      );
  }
  getBienes(codBienes: string): Observable<BienesResponse | null> {
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');

    const body = `cod_bienes=${encodeURIComponent(codBienes)}`;

    return this._httpClient.post<BienesResponse>(`${this.baseUrlAlt}/api/proxy`, body, { headers }).pipe(
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
    return this._httpClient.post<{ status: boolean; data: Empleado[] }>(`${this.baseUrlAlt}/api/empleados`, body.toString(), { headers })
      
      // Usamos el operador 'map' de RxJS para extraer solo el campo 'data' de la respuesta
      .pipe(
        
        map(response => response.data)
    
    ); // Devolvemos solo los empleados, que están dentro del campo 'data'
      

  }
  // Método para obtener bienes desde el backend utilizando un código de bienes como parámetro



    buscarEmpleados(nombreCompleto: string): Observable<Empleado[] | null> {

        // Configuramos las cabeceras de la solicitud para indicar que el contenido será de tipo 'application/x-www-form-urlencoded'
        const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    
        // Creamos el cuerpo de la solicitud, codificando el parámetro nombre_completo para asegurar que sea adecuado para la URL
        const body = `nombre_completo=${encodeURIComponent(nombreCompleto)}`;
    
        // Realizamos la solicitud POST al servidor en el endpoint 'http://localhost:3001/api/empleados'
        // Enviamos el cuerpo de la solicitud y las cabeceras configuradas
        return this._httpClient.post<{ status: boolean; data: Empleado[] }>(`${this.baseUrlAlt}/api/empleados`, body, { headers })
        .pipe(
            // Usamos el operador 'map' para extraer solo el array de empleados desde el campo 'data'
            map(response => {
            // Si la respuesta tiene éxito y contiene datos, devolvemos el array de empleados
            if (response && response.status) {
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

    buscarTipos2(nombreCompleto: string): Observable<Empleado[] | null> {

        // Configuramos las cabeceras de la solicitud para indicar que el contenido será de tipo 'application/x-www-form-urlencoded'
        const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    
        // Creamos el cuerpo de la solicitud, codificando el parámetro nombre_completo para asegurar que sea adecuado para la URL
        const body = `nombre_completo=${encodeURIComponent(nombreCompleto)}`;
    
        // Realizamos la solicitud POST al servidor en el endpoint 'http://localhost:3001/api/empleados'
        // Enviamos el cuerpo de la solicitud y las cabeceras configuradas


        
        return this._httpClient.post<{ status: boolean; data: Empleado[] }>(`${this.baseUrlAlt}/api/empleados`, body, { headers })
        .pipe(
            // Usamos el operador 'map' para extraer solo el array de empleados desde el campo 'data'
            map(response => {
            // Si la respuesta tiene éxito y contiene datos, devolvemos el array de empleados
            if (response && response.status) {
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


    buscarTipos4(
        page: number = 1,
        limit: number = 100,
        search: string = ''
    ): Observable<string[]> {
        const url = `${this.baseUrl}/type`;
    
        return this._httpClient
            .get<any>(url, {
                params: {
                    page: page.toString(),
                    limit: limit.toString(),
                    search: search,
                },
            })
            .pipe(
                map((response) => {
                    // Validar que la respuesta tenga datos
                    if (response && response.data && Array.isArray(response.data.data)) {
                        // Extraer las descripciones
                        return response.data.data.map((item: any) => item.tipos_id.descripcion);
                    } else {
                        // Retornar una lista vacía si no hay datos
                        return [];
                    }
                }),
                tap((descriptions) => {
                    console.log('Descripciones encontradas:', descriptions);
                }),
                catchError((error) => {
                    console.error('Error al obtener tipos:', error);
                    return throwError(() => new Error('No se pudieron obtener los tipos.'));
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
    
    
    
}


