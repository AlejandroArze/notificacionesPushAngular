import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDragPreview, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop'; // Importa módulos para funcionalidades de arrastrar y soltar
import { DatePipe, DOCUMENT, NgClass, NgFor, NgIf, TitleCasePipe } from '@angular/common'; // Importa módulos comunes de Angular
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core'; // Importa decoradores y servicios esenciales de Angular
import { MatButtonModule } from '@angular/material/button'; // Importa el módulo de botones de Angular Material
import { MatIconModule } from '@angular/material/icon'; // Importa el módulo de íconos de Angular Material
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav'; // Importa módulos relacionados con paneles laterales
import { MatTooltipModule } from '@angular/material/tooltip'; // Importa el módulo de tooltips de Angular Material
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router'; // Importa servicios y directivas para enrutamiento
import { FuseNavigationService, FuseVerticalNavigationComponent } from '@fuse/components/navigation'; // Importa servicios de navegación de Fuse
import { FuseMediaWatcherService } from '@fuse/services/media-watcher'; // Importa servicio para observar cambios en los medios
import { TasksService } from 'app/modules/admin/apps/tasks/tasks.service'; // Importa el servicio de tareas personalizado
import { Tag, Servicio } from 'app/modules/admin/apps/tasks/tasks.types'; // Importa tipos de datos personalizados
import { filter, fromEvent, Subject, takeUntil, forkJoin } from 'rxjs'; // Importa operadores y clases de RxJS

@Component({
    selector       : 'tasks-list', // Define el selector del componente
    templateUrl    : './list.component.html', // Ruta del archivo de plantilla HTML
    encapsulation  : ViewEncapsulation.None, // Define el nivel de encapsulación del CSS
    changeDetection: ChangeDetectionStrategy.OnPush, // Define la estrategia de detección de cambios
    standalone     : true, // Indica que el componente es independiente
    imports        : [MatSidenavModule, RouterOutlet, NgIf, MatButtonModule, MatTooltipModule, MatIconModule, CdkDropList, NgFor, CdkDrag, NgClass, CdkDragPreview, CdkDragHandle, RouterLink, TitleCasePipe, DatePipe], // Lista de módulos importados
})
export class TasksListComponent implements OnInit, OnDestroy
{
    @ViewChild('matDrawer', {static: true}) matDrawer: MatDrawer; // Referencia al panel lateral (drawer)

    drawerMode: 'side' | 'over'; // Define el modo del panel lateral
    selectedService: Servicio; // Servicio seleccionado
    tags: Tag[]; // Lista de etiquetas
    services: Servicio[]= []; // Inicializar como un array vacío; // Lista de servicios
    servicesCount: any = {
        completed : 0, // Contador de servicios completados
        incomplete: 0, // Contador de servicios incompletos
        total     : 0, // Contador total de servicios
    };
    tasksCount = {
        incomplete: 0, // Número de tareas incompletas
        completed: 0,  // Número de tareas completadas
    };
    
    private _unsubscribeAll: Subject<any> = new Subject<any>(); // Sujeto para gestionar las suscripciones

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute, // Servicio para rutas activas
        private _changeDetectorRef: ChangeDetectorRef, // Servicio para detección manual de cambios
        @Inject(DOCUMENT) private _document: any, // Referencia al objeto documento
        private _router: Router, // Servicio para la navegación
        private _tasksService: TasksService, // Servicio de tareas personalizado
        private _fuseMediaWatcherService: FuseMediaWatcherService, // Servicio para observar cambios en medios
        private _fuseNavigationService: FuseNavigationService, // Servicio de navegación de Fuse
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Obtiene las etiquetas
        this._tasksService.tags$
            .pipe(takeUntil(this._unsubscribeAll)) // Cancela la suscripción al destruir el componente
            .subscribe((tags: Tag[]) =>
            {
                this.tags = tags; // Asigna las etiquetas recibidas

                // Marca el componente para chequeo de cambios
                this._changeDetectorRef.markForCheck();
            });

        // Llamar al servicio para cada tipo
        const tiposServicio = ['ASISTENCIA', 'EN LABORATORIO', 'REMOTA'];
        
        // Hacer las tres llamadas en paralelo
        forkJoin(
            tiposServicio.map(tipo => 
                this._tasksService.getServicesByType(tipo)
            )
        ).pipe(
            takeUntil(this._unsubscribeAll)
        ).subscribe({
            next: (results) => {
                // Combinar los resultados de los tres tipos
                const allServices = results.reduce((acc, curr) => {
                    return [...acc, ...curr.services];
                }, []);

                // Actualizar los servicios
                this._tasksService.updateServices(allServices);

                // Actualizar la paginación con el total combinado
                const totalCount = results.reduce((acc, curr) => acc + curr.pagination.length, 0);
                this._tasksService.updatePagination({
                    length: totalCount,
                    size: results[0].pagination.size,
                    page: results[0].pagination.page,
                    lastPage: results[0].pagination.lastPage,
                    startIndex: results[0].pagination.startIndex,
                    endIndex: results[0].pagination.endIndex
                });

                // El resto del código se mantiene igual gracias a las suscripciones existentes
                this._changeDetectorRef.markForCheck();
            }
        });

        // Obtiene los servicios
        this._tasksService.services$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((services: Servicio[]) => {
                this.services = services;

                // Actualiza los contadores
                this.servicesCount = {
                    total: services.length,
                    completed: services.filter(service => service.estado === 'completado').length,
                    incomplete: services.filter(service => service.estado !== 'completado').length
                };

                // Actualiza el contador de tareas
                this.tasksCount = {
                    completed: this.servicesCount.completed,
                    incomplete: this.servicesCount.incomplete
                };

                // Actualizar la navegación
                this.updateNavigationBadge();

                // Marca para detección de cambios
                this._changeDetectorRef.markForCheck();
            });

        // Obtiene el servicio seleccionado
        this._tasksService.services$
            .pipe(
                takeUntil(this._unsubscribeAll),
                filter(services => services.length > 0)
            )
            .subscribe((services: Servicio[]) =>
            {
                this.selectedService = services[0]; // Asigna el primer servicio como seleccionado por defecto

                // Marca el componente para chequeo de cambios
                this._changeDetectorRef.markForCheck();
            });

        // Se suscribe a los cambios de media query
        this._fuseMediaWatcherService.onMediaQueryChange$('(min-width: 1440px)')
            .pipe(takeUntil(this._unsubscribeAll)) // Cancela la suscripción al destruir el componente
            .subscribe((state) =>
            {
                this.drawerMode = state.matches ? 'side' : 'over'; // Cambia el modo del panel lateral según el estado del media query

                // Marca el componente para chequeo de cambios
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        this._unsubscribeAll.next(null); // Emite un valor nulo para cancelar todas las suscripciones
        this._unsubscribeAll.complete(); // Completa el sujeto
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Maneja el clic en el fondo
     */
    onBackdropClicked(): void
    {
        this._router.navigate(['./'], {relativeTo: this._activatedRoute}); // Navega a la ruta relativa
        this._changeDetectorRef.markForCheck(); // Marca el componente para chequeo de cambios
    }

    /**
     * Crea un nuevo servicio
     */
    createService(): void
    {
        this._tasksService.createTask({}).subscribe((newService: Servicio) =>
        {
            //this.services.push(newService); // Agrega el nuevo servicio a la lista local
            this._router.navigate(['./', newService.servicios_id], {relativeTo: this._activatedRoute}); // Navega al nuevo servicio creado
            this._changeDetectorRef.markForCheck(); // Marca el componente para chequeo de cambios
        });
    }

    /**
     * Cambia el estado completado del servicio dado
     *
     * @param service Servicio cuyo estado será cambiado
     */
    toggleCompleted(service: Servicio): void {
        const updatedService = {
            ...service,
            estado: service.estado === 'completado' ? 'pendiente' : 'completado'
        };

        this._tasksService.updateTask(service.servicios_id, updatedService).subscribe({
            next: () => {
                // La actualización de la lista se maneja automáticamente a través del BehaviorSubject
                this._changeDetectorRef.markForCheck();
            },
            error: (error) => {
                console.error('Error al cambiar el estado:', error);
                // Revertir el cambio en caso de error
                service.estado = service.estado === 'completado' ? 'pendiente' : 'completado';
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    /**
 * Maneja el evento de arrastre y soltar
 * @param event Evento de arrastre y soltar
 */
dropped(event: CdkDragDrop<Servicio[]>): void {
    // Reordena los servicios localmente
    const reorderedService = this.services[event.previousIndex];
    moveItemInArray(this.services, event.previousIndex, event.currentIndex);

    // Actualiza el backend con el servicio reordenado
    this._tasksService.updateTask(reorderedService.servicios_id, reorderedService).subscribe(() => {
        // Marca el componente para chequeo de cambios
        this._changeDetectorRef.markForCheck();
    });
}



    /**
     * Función para rastrear elementos en ngFor
     *
     * @param index Índice del elemento
     * @param item Elemento actual
     */
    trackByFn(index: number, item: any): any
    {
        return item.servicios_id || index; // Retorna el ID del servicio o el índice
    }

    // Método para actualizar el badge de navegación
    private updateNavigationBadge(): void {
        setTimeout(() => {
            const mainNavigationComponent = 
                this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>('mainNavigation');

            if (mainNavigationComponent) {
                const mainNavigation = mainNavigationComponent.navigation;
                const menuItem = this._fuseNavigationService.getItem('apps.services', mainNavigation);

                if (menuItem) {
                    menuItem.subtitle = this.servicesCount.incomplete + ' servicios pendientes';
                    mainNavigationComponent.refresh();
                }
            }
        });
    }
}
