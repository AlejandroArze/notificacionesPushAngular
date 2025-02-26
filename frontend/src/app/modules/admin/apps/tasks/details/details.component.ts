import { Overlay, OverlayRef } from '@angular/cdk/overlay'; // Importa módulos para crear superposiciones flotantes
import { TemplatePortal } from '@angular/cdk/portal'; // Importa portal para proyectar contenido en superposiciones
import { TextFieldModule } from '@angular/cdk/text-field'; // Importa módulo para campos de texto
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common'; // Importa directivas comunes de Angular
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core'; // Importa elementos core de Angular
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, FormControl, FormGroupDirective, NgForm } from '@angular/forms'; // Importa módulos para manejo de formularios
import { MatButtonModule } from '@angular/material/button'; // Importa módulo de botones de Material
import { MatCheckboxModule } from '@angular/material/checkbox'; // Importa módulo de checkbox de Material
import { MatRippleModule } from '@angular/material/core'; // Importa módulo de efectos ripple de Material
import { MatDatepickerModule } from '@angular/material/datepicker'; // Importa módulo de selector de fechas
import { MatDividerModule } from '@angular/material/divider'; // Importa módulo de divisores de Material
import { MatFormFieldModule } from '@angular/material/form-field'; // Importa módulo de campos de formulario Material
import { MatIconModule } from '@angular/material/icon'; // Importa módulo de iconos de Material
import { MatInputModule } from '@angular/material/input'; // Importa módulo de inputs de Material
import { MatMenuModule } from '@angular/material/menu'; // Importa módulo de menús de Material
import { MatDrawerToggleResult } from '@angular/material/sidenav'; // Importa tipo para resultado de toggle del drawer
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router'; // Importa módulos de enrutamiento
import { FuseFindByKeyPipe } from '@fuse/pipes/find-by-key/find-by-key.pipe'; // Importa pipe personalizado de Fuse
import { FuseConfirmationService } from '@fuse/services/confirmation'; // Importa servicio de confirmación de Fuse
import { TasksListComponent } from 'app/modules/admin/apps/tasks/list/list.component'; // Importa componente de lista de tareas
import { TasksService } from 'app/modules/admin/apps/tasks/tasks.service'; // Importa servicio de tareas
import { Tag, Task, Servicio } from 'app/modules/admin/apps/tasks/tasks.types'; // Importa interfaces de tipos
import { assign } from 'lodash-es'; // Importa función assign de lodash
import { DateTime } from 'luxon'; // Importa librería para manejo de fechas
import { debounceTime, filter, Subject, takeUntil, tap, switchMap, of, catchError, EMPTY, retry } from 'rxjs'; // Importa operadores y tipos de RxJS
import { MatTooltipModule } from '@angular/material/tooltip'; // Importa módulo de tooltip de Material
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export class CustomErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        return !!(control && control.value && 
            typeof control.value === 'string' && 
            control.value !== '' && 
            control.value !== null);
    }
}

// Primero, definimos una interfaz para los datos del empleado
interface EmpleadoDetalle {
    nombre_completo: string;
    otro_nombre?: string;
    nombre?: string;
    paterno?: string;
    materno?: string;
    numdocumento: string;
    cargo: string;
    tipo_contrato: string;
    unidad: string;
    telefono?: string;
    telefono_coorp?: string;
    email?: string;
    direccion?: string;
    fecha_incorporacion?: string;
    fecha_baja?: string | null;
}

interface EmpleadoOption {
    id: number;
    nombre_completo: string;
    numdocumento: string;
    cargo: string;
    tipo_contrato: string;
    unidad: string;
    telefono?: string;
    telefono_coorp?: string;
}

// Agregar la interfaz para jsPDF con autoTable
interface jsPDFWithPlugin extends jsPDF {
    autoTable: (options: any) => jsPDF;
    internal: any;
}

@Component({
    selector       : 'tasks-details',                    // Selector del componente para uso en templates
    templateUrl    : './details.component.html',         // Ruta al archivo de template HTML
    encapsulation  : ViewEncapsulation.None,            // Desactiva la encapsulación de estilos
    changeDetection: ChangeDetectionStrategy.OnPush,     // Estrategia de detección de cambios optimizada
    standalone     : true,                              // Indica que es un componente independiente
    imports        : [FormsModule, ReactiveFormsModule,  // Lista de módulos importados necesarios
                     MatButtonModule, NgIf, MatIconModule, 
                     MatMenuModule, RouterLink, MatDividerModule, 
                     MatFormFieldModule, MatInputModule, TextFieldModule, 
                     NgFor, MatRippleModule, MatCheckboxModule, NgClass, 
                     MatDatepickerModule, FuseFindByKeyPipe, DatePipe,
                     MatTooltipModule, MatSelectModule,
                     MatCardModule, MatAutocompleteModule],
})
// Clase del componente que implementa los hooks del ciclo de vida OnInit (inicialización), AfterViewInit (después de inicializar la vista) y OnDestroy (limpieza)
export class TasksDetailsComponent implements OnInit, AfterViewInit, OnDestroy 
{
    @ViewChild('tagsPanelOrigin') private _tagsPanelOrigin: ElementRef;    // Referencia al elemento origen del panel de etiquetas
    @ViewChild('tagsPanel') private _tagsPanel: TemplateRef<any>;          // Referencia a la plantilla del panel de etiquetas
    @ViewChild('titleField') private _titleField: ElementRef;              // Referencia al campo de título

    tags: Tag[];                                                           // Array que almacena todas las etiquetas disponibles
    tagsEditMode: boolean = false;                                         // Bandera que indica si está activo el modo de edición de etiquetas
    filteredTags: Tag[];                                                   // Array de etiquetas filtradas según búsqueda
    task: Task = {
        id: '',
        type: 'task',
        title: '',
        notes: '',
        completed: false,
        dueDate: null,
        priority: 0,
        tags: [],
        order: 0
    };
    taskForm: UntypedFormGroup;                                           // Formulario reactivo para la tarea
    tasks: Task[];                                                        // Array que almacena todas las tareas
    private _tagsPanelOverlayRef: OverlayRef;                            // Referencia al overlay del panel de etiquetas
    private _unsubscribeAll: Subject<any> = new Subject<any>();          // Subject para gestionar la limpieza de subscripciones
    servicioForm: UntypedFormGroup;
    servicio: Servicio;
    public flashMessage: 'success' | 'error' | null = null;
    bienes: {
        data: {
            tipo?: string;
            observacion?: string;
            unidad?: string;
            caracteristicas?: {
                MARCA: string;
                MODELO: string;
                SERIE: string;
            };
        };
    } | null = null;
    filteredEquipos: { equipos_id: number; codigo: string }[] = [];
    searchEquipoCtrl = new FormControl<{equipos_id: number; codigo: string} | string>('');
    isOptionSelected = false;
    matcher = new CustomErrorStateMatcher();
    filteredEmpleados: any[] = [];
    filteredEmpleadosCI: any[] = [];
    empleadosCargados: any[] = [];
    empleadosCargadosCI: any[] = [];

    // Agregar un mapa para almacenar los detalles de los empleados
    private empleadosDetalles = new Map<string, EmpleadoDetalle>();

    // Agregar una bandera para controlar si se seleccionó de la lista
    private selectedFromList: boolean = false;

    // Nuevas propiedades para el técnico asignado
    tecnicos: any[] = [];
    filteredTecnicos: any[] = [];
    showTecnicosDropdown = false;
    canSelectTecnico: boolean = true;
    searchTerm: string = '';

    /**
     * Constructor del componente TasksDetailsComponent
     * 
     * @param _activatedRoute - Servicio para acceder a información sobre la ruta activa
     * @param _changeDetectorRef - Servicio para detectar y forzar cambios en la vista
     * @param _formBuilder - Servicio para crear formularios reactivos
     * @param _fuseConfirmationService - Servicio para mostrar diálogos de confirmación
     * @param _renderer2 - Servicio para manipular elementos del DOM
     * @param _router - Servicio para la navegación
     * @param _tasksListComponent - Referencia al componente padre de la lista de tareas
     * @param _tasksService - Servicio para gestionar las operaciones CRUD de tareas
     * @param _overlay - Servicio para crear superposiciones flotantes
     * @param _viewContainerRef - Referencia al contenedor de la vista
     * @param _snackBar - Servicio para mostrar notificaciones
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: UntypedFormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _renderer2: Renderer2,
        private _router: Router,
        private _tasksListComponent: TasksListComponent,
        private _tasksService: TasksService,
        private _overlay: Overlay,
        private _viewContainerRef: ViewContainerRef,
        private _snackBar: MatSnackBar
    )
    {
        // Cargar técnicos al inicializar
        this._tasksService.getTecnicos()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response) => {
                    // Filtrar la opción "TODOS" del array de técnicos
                    this.tecnicos = response.filter(t => t.id !== 'TODOS');
                    this.filteredTecnicos = this.tecnicos;
                    
                    // Obtener datos del usuario del localStorage
                    const token = localStorage.getItem('accessToken');
                    if (token) {
                        const tokenParts = token.split('.');
                        const payload = JSON.parse(atob(tokenParts[1]));
                        
                        // Establecer permisos según el rol
                        if (payload.role === '3') {
                            this.canSelectTecnico = false;
                        } else if (payload.role === '2') {
                            this.canSelectTecnico = true;
                            // Filtrar técnicos activos solo para rol 2
                            this.tecnicos = this.tecnicos.filter(t => t.estado === 1);
                            this.filteredTecnicos = this.tecnicos;
                        } else if (payload.role === '1') {
                            this.canSelectTecnico = true;
                        }
                    }
                    
                    this._changeDetectorRef.detectChanges();
                },
                error: (error) => {
                    console.error('Error al cargar técnicos:', error);
                    this.tecnicos = [];
                    this._changeDetectorRef.detectChanges();
                }
            });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Hooks del ciclo de vida
    // -----------------------------------------------------------------------------------------------------

    /**
     * Al inicializar
     */
    ngOnInit(): void
    {
        // Abre el drawer (panel lateral)
        this._tasksListComponent.matDrawer.open();

        // Crea el formulario de tarea
        this.taskForm = this._formBuilder.group({
            id       : [''],        // Identificador único de la tarea
            type     : [''],        // Tipo de tarea
            title    : [''],        // Título de la tarea
            notes    : [''],        // Notas o descripción de la tarea
            completed: [false],     // Estado de completado de la tarea
            dueDate  : [null],      // Fecha de vencimiento
            priority : [0],         // Prioridad de la tarea
            tags     : [[]],        // Etiquetas asociadas
            order    : [0],         // Orden de la tarea en la lista
        });

        // Obtener las etiquetas
        this._tasksService.tags$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((tags: Tag[]) =>
            {
                // Asignar las etiquetas obtenidas a la propiedad 'tags'
                this.tags = tags;
                // Inicializar 'filteredTags' con todas las etiquetas
                this.filteredTags = tags;

                // Marcar para verificación de cambios
                this._changeDetectorRef.markForCheck();
            });

        // Obtener las tareas
        this._tasksService.tasks$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((tasks: Task[]) =>
            {
                // Asignar las tareas obtenidas a la propiedad 'tasks'
                this.tasks = tasks;

                // Marcar para verificación de cambios
                this._changeDetectorRef.markForCheck();
            });

        // Obtener la tarea actual
        this._tasksService.task$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((task: Task) =>
            {
                // Abrir el cajón si está cerrado
                this._tasksListComponent.matDrawer.open();

                // Asignar la tarea obtenida a la propiedad 'task'
                this.task = task;

                // Actualizar el formulario con los valores de la tarea
                this.taskForm.patchValue(task, {emitEvent: false});

                // Marcar para verificación de cambios
                this._changeDetectorRef.markForCheck();
            });

        // Actualiza la tarea cuando hay cambios en el formulario
        this.taskForm.valueChanges
            .pipe(
                tap((value) =>
                {
                    // Actualiza el objeto de tarea
                    this.task = assign(this.task, value);    // Combina los nuevos valores con la tarea existente
                }),
                debounceTime(300),                          // Espera 300ms antes de realizar la actualización
                takeUntil(this._unsubscribeAll),
            )
            .subscribe((value) =>
            {
                // Actualiza la tarea en el servidor
                this._tasksService.updateTask(value.id, value).subscribe();

                // Marca para verificación de cambios
                this._changeDetectorRef.markForCheck();
            });

        // Escucha el evento NavigationEnd para enfocar el campo de título
        this._router.events
            .pipe(
                takeUntil(this._unsubscribeAll),
                filter(event => event instanceof NavigationEnd),
            )
            .subscribe(() => {
                // Verificar que el elemento existe antes de intentar enfocarlo
                if (this._titleField && this._titleField.nativeElement) {
                    this._titleField.nativeElement.focus();
                }
            });

        // Crea el formulario de servicio
        this.servicioForm = this._formBuilder.group({
            servicios_id: [''],
            nombreSolicitante: [''],
            ciSolicitante: [''],
            cargoSolicitante: [''],
            tipoSolicitante: [''],
            oficinaSolicitante: [''],
            telefonoSolicitante: [''],
            nombreResponsableEgreso: [''],
            cargoResponsableEgreso: [''],
            informe: [''],
            fechaRegistro: [''],
            equipo: [''],
            equipos_id: [''],
            problema: [''],
            telefonoResponsableEgreso: [''],
            gestion: [0],
            tecnicoAsignado: [''],
            observaciones: [''],
            tipoResponsableEgreso: [''],
            estado: [''],
            fechaTerminado: [''],
            oficinaResponsableEgreso: [''],
            numero: [0],
            fechaInicio: [''],
            fechaEgreso: [null],
            tipo: [''],
            tecnicoRegistro: [''],
            tecnicoEgreso: [null],
            ciResponsableEgreso: [''],
            tecnicoAsignadoString: [null],
            tecnicoRegistroString: [{value: '', disabled: true}],
            tipoDescripcion: [null],
            codigo: ['']
        });

        // Obtener el servicio actual
        this._activatedRoute.paramMap.pipe(
            switchMap((params) => {
                const id = Number(params.get('id'));
                return this._tasksService.getTaskById(id);
            }),
            takeUntil(this._unsubscribeAll)
        ).subscribe((response) => {
            if (response && response.data) {
                this.servicio = response.data;
                console.log('Servicio cargado:', this.servicio);
                
                // Cargar el formulario con los datos del servicio
                this.servicioForm.patchValue(this.servicio);

                // Si hay un equipo, buscar su información
                if (this.servicio.equipo) {
                    console.log('Buscando equipo con ID:', this.servicio.equipo);
                    this._tasksService.getEquipoById(this.servicio.equipo).subscribe(
                        equipoEncontrado => {
                            console.log('Equipo encontrado:', equipoEncontrado);
                            
                            if (equipoEncontrado) {
                                const equipoParaSelect = {
                                    equipos_id: equipoEncontrado.equipos_id,
                                    codigo: equipoEncontrado.codigo
                                };
                                
                                // Actualizar el control de búsqueda
                                this.searchEquipoCtrl.setValue(equipoParaSelect, { emitEvent: false });
                                
                                // Actualizar el formulario
                                this.servicioForm.patchValue({
                                    equipo: equipoEncontrado.equipos_id,
                                    equipos_id: equipoEncontrado.equipos_id,
                                    codigo: equipoEncontrado.codigo
                                });

                                // Cargar la lista inicial de equipos incluyendo el equipo actual
                                this._tasksService.buscarEquipos(0, 100, 'name', 'asc', '').subscribe(response => {
                                    let equipos = response.equipments.map(equipo => ({
                                        equipos_id: equipo.equipos_id,
                                        codigo: equipo.codigo
                                    }));

                                    // Asegurarse de que el equipo actual esté en la lista
                                    const existeEquipo = equipos.some(e => e.equipos_id === equipoEncontrado.equipos_id);
                                    if (!existeEquipo) {
                                        equipos = [equipoParaSelect, ...equipos];
                                    }

                                    this.filteredEquipos = equipos;
                                    this._changeDetectorRef.markForCheck();
                                });
                                
                                this.isOptionSelected = true;
                                this.getBienes();
                            }
                        },
                        error => {
                            console.error('Error al obtener el equipo:', error);
                        }
                    );
                }

                this._changeDetectorRef.markForCheck();
            }
        });

        // Actualiza el servicio cuando hay cambios en el formulario
        this.servicioForm.valueChanges
            .pipe(
                tap((value) => {
                    this.servicio = assign(this.servicio, value);
                }),
                debounceTime(300),
                takeUntil(this._unsubscribeAll),
            )
            .subscribe((value) => {
                this._tasksService.updateTask(value.servicios_id, value).subscribe({
                    next: () => {
                        this.flashMessage = 'success';
                        setTimeout(() => {
                            this.flashMessage = null;
                            this._changeDetectorRef.markForCheck();
                        }, 3000);
                    },
                    error: () => {
                        this.flashMessage = 'error';
                        setTimeout(() => {
                            this.flashMessage = null;
                            this._changeDetectorRef.markForCheck();
                        }, 3000);
                    }
                });
                this._changeDetectorRef.markForCheck();
            });

        // Suscribirse a los cambios del campo equipo para la búsqueda
        this.searchEquipoCtrl.valueChanges.pipe(
            debounceTime(300),
            takeUntil(this._unsubscribeAll)
        ).subscribe(value => {
            if (typeof value === 'string') {
                this.isOptionSelected = false;
                this.servicioForm.patchValue({ equipo: '', equipos_id: '' });
                this._tasksService.buscarEquipos(0, 100, 'name', 'asc', value).subscribe(response => {
                    this.filteredEquipos = response.equipments.map(equipo => ({
                        equipos_id: equipo.equipos_id,
                        codigo: equipo.codigo
                    }));
                    this._changeDetectorRef.markForCheck();
                });
            }
        });

        // Suscribirse a los cambios del campo nombreSolicitante
        this.servicioForm.get('nombreSolicitante').valueChanges.pipe(
            debounceTime(300),
            takeUntil(this._unsubscribeAll)
        ).subscribe(value => {
            if (typeof value === 'string' && value.length > 2) {
                this.buscarEmpleados(value);
            } else {
                this.filteredEmpleados = [];
            }
        });

        // Suscribirse a los cambios del campo ciSolicitante
        this.servicioForm.get('ciSolicitante').valueChanges.pipe(
            debounceTime(300),
            takeUntil(this._unsubscribeAll)
        ).subscribe(value => {
            if (typeof value === 'string' && value.length > 2) {
                this.buscarEmpleadosPorCI(value);
            } else {
                this.filteredEmpleadosCI = [];
            }
        });
    }

    /**
     * Después de la inicialización de la vista
     */
    ngAfterViewInit(): void
    {
        // Escucha los cambios cuando se abre el matDrawer // Detecta cuando el panel lateral se abre
        this._tasksListComponent.matDrawer.openedChange
            .pipe(
                takeUntil(this._unsubscribeAll),   // Cancela la suscripción cuando el componente se destruye
                filter(opened => opened),           // Filtra solo cuando el drawer está abierto
            )
            .subscribe(() => {
                // Verificar que el elemento existe antes de intentar enfocarlo
                if (this._titleField && this._titleField.nativeElement) {
                    this._titleField.nativeElement.focus();
                }
            });
    }

    /**
     * Al destruir el componente
     */
    ngOnDestroy(): void
    {
        // Cancela todas las suscripciones // Limpia las suscripciones para evitar memory leaks
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();

        // Elimina el overlay // Limpia el panel flotante de etiquetas si existe
        if ( this._tagsPanelOverlayRef )
        {
            this._tagsPanelOverlayRef.dispose();
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Métodos públicos
    // -----------------------------------------------------------------------------------------------------

    /**
     * Cierra el panel lateral
     */
    closeDrawer(): Promise<MatDrawerToggleResult>  // Método para cerrar el panel lateral
    {
        return this._tasksListComponent.matDrawer.close(); // Retorna la promesa del cierre del panel
    }

    /**
     * Alterna el estado de completado
     */
    toggleCompleted(): void  // Método para cambiar el estado de completado de la tarea
    {
        // Obtiene el control del formulario para 'completed'
        const completedFormControl = this.taskForm.get('completed');  // Obtiene la referencia al control del formulario

        // Alterna el estado de completado
        completedFormControl.setValue(!completedFormControl.value);  // Invierte el valor actual del control
    }

    /**
     * Abre el panel de etiquetas
     */
    openTagsPanel(): void  // Método para abrir el panel de etiquetas
    {
        // Crea el overlay
        this._tagsPanelOverlayRef = this._overlay.create({  // Configura y crea un nuevo overlay
            backdropClass   : '',  // Clase CSS para el fondo
            hasBackdrop     : true,  // Habilita el fondo oscuro
            scrollStrategy  : this._overlay.scrollStrategies.block(),  // Estrategia de scroll
            positionStrategy: this._overlay.position()  // Configura la estrategia de posicionamiento
                .flexibleConnectedTo(this._tagsPanelOrigin.nativeElement)  // Conecta al elemento origen
                .withFlexibleDimensions(true)  // Permite dimensiones flexibles
                .withViewportMargin(64)  // Establece el margen con el viewport
                .withLockedPosition(true)  // Bloquea la posición
                .withPositions([  // Define las posiciones posibles
                    {
                        originX : 'start',  // Alineación horizontal del origen
                        originY : 'bottom',  // Alineación vertical del origen
                        overlayX: 'start',  // Alineación horizontal del overlay
                        overlayY: 'top',  // Alineación vertical del overlay
                    },
                ]),
        });

        // Se suscribe al observable de adjuntos
        this._tagsPanelOverlayRef.attachments().subscribe(() =>  // Maneja el evento de adjunto del overlay
        {
            // Enfoca el campo de búsqueda cuando el overlay se adjunta
            this._tagsPanelOverlayRef.overlayElement.querySelector('input').focus();  // Establece el foco en el input
        });

        // Crea un portal desde la plantilla
        const templatePortal = new TemplatePortal(this._tagsPanel, this._viewContainerRef);  // Crea un portal para el contenido

        // Adjunta el portal al overlay
        this._tagsPanelOverlayRef.attach(templatePortal);  // Conecta el contenido al overlay

        // Se suscribe al clic en el fondo
        this._tagsPanelOverlayRef.backdropClick().subscribe(() =>  // Maneja los clics en el fondo
        {
            // Si el overlay existe y está adjunto...
            if ( this._tagsPanelOverlayRef && this._tagsPanelOverlayRef.hasAttached() )  // Verifica si el overlay está activo
            {
                // Lo desconecta
                this._tagsPanelOverlayRef.detach();  // Desconecta el overlay

                // Reinicia el filtro de etiquetas
                this.filteredTags = this.tags;  // Restaura las etiquetas sin filtrar

                // Desactiva el modo de edición
                this.tagsEditMode = false;  // Desactiva la edición
            }

            // Si el portal de plantilla existe y está adjunto...
            if ( templatePortal && templatePortal.isAttached )  // Verifica si el portal está conectado
            {
                // Lo desconecta
                templatePortal.detach();  // Desconecta el portal
            }
        });
    }

    /**
     * Alterna el modo de edición de etiquetas
     */
    toggleTagsEditMode(): void  // Método para activar/desactivar el modo de edición
    {
        this.tagsEditMode = !this.tagsEditMode;  // Invierte el estado del modo de edición
    }

    /**
     * Filtra las etiquetas
     */
    filterTags(event): void  // Método para filtrar las etiquetas
    {
        // Obtiene el valor
        const value = event.target.value.toLowerCase();  // Obtiene el texto de búsqueda en minúsculas

        // Filtra las etiquetas
        this.filteredTags = this.tags.filter(tag => tag.title.toLowerCase().includes(value));  // Filtra las etiquetas que coinciden
    }

    /**
     * Evento de tecla presionada en el input de filtrado
     */
    filterTagsInputKeyDown(event): void  // Maneja el evento de tecla presionada
    {
        // Retorna si la tecla presionada no es 'Enter'
        if ( event.key !== 'Enter' )  // Verifica si la tecla es Enter
        {
            return;
        }

        // Si no hay etiquetas disponibles...
        if ( this.filteredTags.length === 0 )  // Verifica si no hay resultados del filtro
        {
            // Crea la etiqueta
            this.createTag(event.target.value);  // Crea una nueva etiqueta

            // Limpia el input
            event.target.value = '';  // Vacía el campo de entrada

            // Retorna
            return;
        }

        // Si hay una etiqueta...
        const tag = this.filteredTags[0];  // Obtiene la primera etiqueta filtrada
        const isTagApplied = this.task.tags.find(id => id === tag.id);  // Verifica si ya está aplicada

        // Si la etiqueta encontrada ya está aplicada a la tarea...
        if ( isTagApplied )  // Comprueba si la etiqueta ya está en uso
        {
            // Elimina la etiqueta de la tarea
            this.deleteTagFromTask(tag);  // Quita la etiqueta
        }
        else
        {
            // Si no, añade la etiqueta a la tarea
            this.addTagToTask(tag);  // Agrega la etiqueta
        }
    }

    /**
     * Crea una nueva etiqueta
     */
    createTag(title: string): void  // Método para crear una nueva etiqueta
    {
        const tag = {
            title,  // Objeto con el título de la etiqueta
        };

        // Crea la etiqueta en el servidor
        this._tasksService.createTag(tag)  // Llama al servicio para crear la etiqueta
            .subscribe((response) =>  // Maneja la respuesta
            {
                // Añade la etiqueta a la tarea
                this.addTagToTask(response);  // Agrega la nueva etiqueta
            });
    }

    /**
     * Actualiza el título de la etiqueta
     */
    updateTagTitle(tag: Tag, event): void  // Método para actualizar el título de una etiqueta
    {
        // Actualiza el título en la etiqueta
        tag.title = event.target.value;  // Actualiza el valor del título

        // Actualiza la etiqueta en el servidor
        this._tasksService.updateTag(tag.id, tag)  // Llama al servicio para actualizar
            .pipe(debounceTime(300))  // Aplica un retraso para evitar múltiples llamadas
            .subscribe();

        // Marca para verificación
        this._changeDetectorRef.markForCheck();  // Notifica cambios al detector
    }

    /**
     * Elimina la etiqueta
     */
    deleteTag(tag: Tag): void  // Método para eliminar una etiqueta
    {
        // Elimina la etiqueta del servidor
        this._tasksService.deleteTag(tag.id).subscribe();  // Llama al servicio para eliminar

        // Marca para verificación
        this._changeDetectorRef.markForCheck();  // Notifica cambios al detector
    }

    /**
     * Añade una etiqueta a la tarea
     */
    addTagToTask(tag: Tag): void  // Método para agregar una etiqueta a la tarea
    {
        // Añade la etiqueta
        this.task.tags.unshift(tag.id);  // Agrega el ID al inicio del array

        // Actualiza el formulario de la tarea
        this.taskForm.get('tags').patchValue(this.task.tags);  // Actualiza el control del formulario

        // Marca para verificación
        this._changeDetectorRef.markForCheck();  // Notifica cambios al detector
    }

    /**
     * Elimina una etiqueta de la tarea
     */
    deleteTagFromTask(tag: Tag): void  // Método para eliminar una etiqueta de la tarea
    {
        // Elimina la etiqueta
        this.task.tags.splice(this.task.tags.findIndex(item => item === tag.id), 1);  // Elimina el ID del array

        // Actualiza el formulario de la tarea
        this.taskForm.get('tags').patchValue(this.task.tags);  // Actualiza el control del formulario

        // Marca para verificación
        this._changeDetectorRef.markForCheck();  // Notifica cambios al detector
    }

    /**
     * Alterna una etiqueta de la tarea
     */
    toggleTaskTag(tag: Tag): void  // Método para alternar una etiqueta en la tarea
    {
        if ( this.task.tags.includes(tag.id) )  // Verifica si la etiqueta ya está presente
        {
            this.deleteTagFromTask(tag);  // Si existe, la elimina
        }
        else
        {
            this.addTagToTask(tag);  // Si no existe, la agrega
        }
    }

    /**
     * Verifica si debe mostrarse el botón de crear etiqueta
     */
    shouldShowCreateTagButton(inputValue: string): boolean  // Método para controlar la visibilidad del botón
    {
        return !!!(inputValue === '' || this.tags.findIndex(tag => tag.title.toLowerCase() === inputValue.toLowerCase()) > -1);  // Retorna verdadero si el input no está vacío y la etiqueta no existe
    }

    /**
     * Establece la prioridad de la tarea
     */
    setTaskPriority(priority): void  // Método para establecer la prioridad
    {
        // Establece el valor
        this.taskForm.get('priority').setValue(priority);  // Actualiza el valor en el formulario
    }

    /**
     * Verifica si la tarea está vencida
     */
    isOverdue(): boolean  // Método para verificar si la tarea está vencida
    {
        return DateTime.fromISO(this.task.dueDate).startOf('day') < DateTime.now().startOf('day');  // Compara la fecha de vencimiento con la actual
    }

    /**
     * Elimina la tarea
     */
    deleteTask4(): void  // Método para eliminar la tarea
    {
        // Abre el diálogo de confirmación
        const confirmation = this._fuseConfirmationService.open({  // Configura y muestra el diálogo
            title  : 'Eliminar tarea',  // Título del diálogo
            message: '¿Estás seguro de que quieres eliminar esta tarea? ¡Esta acción no se puede deshacer!',  // Mensaje de confirmación
            actions: {
                confirm: {
                    label: 'Eliminar',  // Texto del botón de confirmación
                },
            },
        });

        // Se suscribe al evento de cierre del diálogo
        confirmation.afterClosed().subscribe((result) =>  // Maneja la respuesta del usuario
        {
            // Si se presionó el botón confirmar...
            if ( result === 'confirmed' )  // Verifica si se confirmó la eliminación
            {
                // Obtiene el id de la tarea actual
                const id = this.task.id;  // Almacena el ID de la tarea

                // Obtiene el id de la siguiente/anterior tarea
                const currentTaskIndex = this.tasks.findIndex(item => item.id === id);  // Encuentra el índice actual
                const nextTaskIndex = currentTaskIndex + ((currentTaskIndex === (this.tasks.length - 1)) ? -1 : 1);  // Calcula el siguiente índice
                const nextTaskId = (this.tasks.length === 1 && this.tasks[0].id === id) ? null : this.tasks[nextTaskIndex].id;  // Determina la siguiente tarea

                // Elimina la tarea
                this._tasksService.deleteTask(Number(id))  // Llama al servicio para eliminar
                    .subscribe((isDeleted) =>  // Maneja la respuesta
                    {
                        // Retorna si la tarea no fue eliminada...
                        if ( !isDeleted )  // Verifica si la eliminación fue exitosa
                        {
                            return;
                        }

                        // Navega a la siguiente tarea si está disponible
                        if ( nextTaskId )  // Si hay una siguiente tarea
                        {
                            this._router.navigate(['../', nextTaskId], {relativeTo: this._activatedRoute});  // Navega a la siguiente tarea
                        }
                        // Si no, navega al padre
                        else
                        {
                            this._router.navigate(['../'], {relativeTo: this._activatedRoute});  // Vuelve a la lista de tareas
                        }
                    });

                // Marca para verificación
                this._changeDetectorRef.markForCheck();  // Notifica cambios al detector
            }
        });
    }

    /**
     * Función de seguimiento para bucles ngFor
     */
    trackByFn(index: number, item: any): any  // Método para optimizar el rendimiento de ngFor
    {
        return item.id || index;  // Retorna el ID del item o el índice como fallback
    }

    /**
     * Elimina el servicio actual
     */
    deleteTask(): void {
        if (this.servicio && this.servicio.servicios_id) {
            const confirmation = this._fuseConfirmationService.open({
                title: 'Eliminar servicio',
                message: '¿Está seguro que desea eliminar este servicio? Esta acción no se puede deshacer.',
                actions: {
                    confirm: {
                        label: 'Eliminar'
                    }
                }
            });

            confirmation.afterClosed().subscribe((result) => {
                if (result === 'confirmed') {
                    this._tasksService.deleteTask(this.servicio.servicios_id)
                        .subscribe(() => {
                            // Navegar de vuelta a la lista
                            this._router.navigate(['../'], {relativeTo: this._activatedRoute});
                        });
                }
            });
        }
    }

    /**
     * Busca los bienes asociados al equipo
     */
    public getBienes(): void {
        // Obtener el código del equipo del control de búsqueda
        const equipoSeleccionado = this.searchEquipoCtrl.value;
        const codigo = equipoSeleccionado && typeof equipoSeleccionado === 'object' 
            ? equipoSeleccionado.codigo 
            : this.servicioForm.get('equipo')?.value;

        console.log('Obteniendo bienes para código:', codigo);

        if (codigo && codigo.toString().trim()) {
            this._tasksService.getBienes(codigo.toString()).subscribe({
                next: (response) => {
                    this.bienes = response;
                    console.log('Bienes encontrados:', this.bienes);
                    this._changeDetectorRef.markForCheck();
                },
                error: (err) => {
                    console.error('Error al obtener bienes:', err);
                    this.bienes = null;
                },
            });
        } else {
            console.warn('El código de bienes está vacío o no válido.');
            this.bienes = null;
        }
    }

    selectEquipo(equipo: { equipos_id: number; codigo: string }): void {
        console.log('Equipo seleccionado:', equipo);
        this.isOptionSelected = true;
        
        // Actualizar el formulario
        this.servicioForm.patchValue({
            equipo: equipo.equipos_id,     // Guardamos el ID en equipo
            equipos_id: equipo.equipos_id,  // Campo auxiliar
            codigo: equipo.codigo          // Campo auxiliar para mostrar
        });
        
        // Actualizar el control de búsqueda
        this.searchEquipoCtrl.setValue(equipo, { emitEvent: false });
        
        this._changeDetectorRef.markForCheck();
        this.getBienes();
    }

    displayFn = (equipo: any): string => {
        if (equipo && typeof equipo === 'object') {
            return equipo.codigo;
        }
        return equipo || '';
    };

    // Método para cargar equipos iniciales al hacer focus
    onFocus(): void {
        // Obtener el equipo actual del control
        const equipoActual = this.searchEquipoCtrl.value;
        
        // Obtener el código actual para la búsqueda inicial
        const codigoActual = equipoActual && typeof equipoActual === 'object' 
            ? equipoActual.codigo 
            : this.servicioForm.get('codigo')?.value;

        console.log('Buscando equipos con código:', codigoActual);
        
        // Usar el código actual como término de búsqueda
        this._tasksService.buscarEquipos(0, 100, 'name', 'asc', codigoActual || '').subscribe(response => {
            let equipos = response.equipments.map(equipo => ({
                equipos_id: equipo.equipos_id,
                codigo: equipo.codigo
            }));

            // Si tenemos un equipo actual y no está en la lista, agregarlo al principio
            if (equipoActual && typeof equipoActual === 'object') {
                const existeEquipo = equipos.some(e => e.equipos_id === equipoActual.equipos_id);
                if (!existeEquipo) {
                    equipos = [equipoActual, ...equipos];
                }
            }

            console.log('Equipos encontrados:', equipos);
            this.filteredEquipos = equipos;
            this._changeDetectorRef.markForCheck();
        });
    }

    buscarEmpleados(query: string): void {
        // Limpiar espacios en blanco al inicio y final de la consulta
        const queryLimpia = query.trim();

        if (queryLimpia.length > 2) {
            // Primero buscar en los empleados ya cargados
            const empleadosFiltrados = this.empleadosCargados.filter(emp => 
                emp.nombre_completo.toLowerCase().includes(queryLimpia.toLowerCase())
            );

            if (empleadosFiltrados.length > 0) {
                this.filteredEmpleados = empleadosFiltrados;
                this._changeDetectorRef.markForCheck();
            } else {
                // Si no hay coincidencias locales, consultar la API con la consulta limpia
                this._tasksService.buscarEmpleados(queryLimpia).pipe(
                    debounceTime(300)
                ).subscribe({
                    next: (data) => {
                        if (data && Array.isArray(data)) {
                            const nuevosEmpleados = data.map(empleado => ({
                                id: empleado.id || parseInt(empleado.nro_item) || 0,
                                nombre_completo: empleado.nombre_completo.trim(),
                                numdocumento: empleado.numdocumento,
                                cargo: empleado.cargo,
                                tipo_contrato: empleado.tipo_contrato,
                                unidad: empleado.unidad,
                                telefono: empleado.telefono,
                                telefono_coorp: empleado.telefono_coorp
                            }));

                            // Agregar los nuevos empleados al cache local
                            nuevosEmpleados.forEach(emp => {
                                if (!this.empleadosCargados.some(e => e.id === emp.id)) {
                                    this.empleadosCargados.push(emp);
                                }
                            });

                            this.filteredEmpleados = nuevosEmpleados;
                            this._changeDetectorRef.markForCheck();
                        }
                    },
                    error: (error) => {
                        console.error('Error al buscar empleados:', error);
                        this.filteredEmpleados = empleadosFiltrados;
                        this._changeDetectorRef.markForCheck();
                    }
                });
            }
        } else {
            this.filteredEmpleados = [];
        }
    }

    onEmpleadoSelected(event: any): void {
        const empleadoSeleccionado = event.option.value;
        
        if (!empleadoSeleccionado) {
            return;
        }

        // Actualizar el formulario con los datos del empleado
        this.servicioForm.patchValue({
            nombreSolicitante: empleadoSeleccionado.nombre_completo,
            ciSolicitante: empleadoSeleccionado.numdocumento || " ",
            cargoSolicitante: empleadoSeleccionado.cargo || " ",
            tipoSolicitante: empleadoSeleccionado.tipo_contrato || " ",
            oficinaSolicitante: empleadoSeleccionado.unidad || " ",
            telefonoSolicitante: empleadoSeleccionado.telefono_coorp || empleadoSeleccionado.telefono || " "
        });

        // Actualizar el servicio manteniendo el formato exacto
        if (this.servicio && this.servicio.servicios_id) {
            const servicioActualizado: Servicio = {
                ...this.servicio,  // Mantener todas las propiedades existentes
                nombreSolicitante: empleadoSeleccionado.nombre_completo || " " // Asegurar que siempre tenga al menos un espacio
            };

            this._tasksService.updateTask(this.servicio.servicios_id, servicioActualizado)
                .subscribe({
                    next: () => {
                        this.servicio = servicioActualizado;
                        this._changeDetectorRef.markForCheck();
                    },
                    error: () => {
                        // Revertir cambios si hay error
                        this.servicioForm.patchValue({
                            nombreSolicitante: this.servicio.nombreSolicitante
                        });
                    }
                });
        }
    }

    displayFnEmpleado = (empleado: any): string => {
        if (!empleado) {
            return '';
        }
        if (typeof empleado === 'string') {
            return empleado;
        }
        // Mostrar CI o nombre según el campo que se está usando
        return empleado.numdocumento || empleado.nombre_completo || '';
    };

    // Método para manejar cambios en el input
    onInputChange(event: any): void {
        const query = event?.target?.value || '';
        const field = event?.target?.getAttribute('formControlName');
        
        if (field === 'nombreSolicitante') {
            const currentValue = this.servicioForm.get(field).value;
            if (currentValue === ' ') {
                this.servicioForm.get(field).setValue('', { emitEvent: false });
            }

            if (query && query.length > 2) {
                this.buscarEmpleados(query);
            } else {
                this.filteredEmpleados = [];
            }
        }
    }

    // Agregar nuevo método para buscar por CI
    buscarEmpleadosPorCI(ci: string): void {
        // Limpiar espacios en blanco al inicio y final de la consulta
        const ciLimpio = ci.trim();

        if (ciLimpio.length > 2) {
            // Primero buscar en los empleados ya cargados
            const empleadosFiltrados = this.empleadosCargadosCI.filter(emp => 
                emp.numdocumento.includes(ciLimpio)
            );

            if (empleadosFiltrados.length > 0) {
                this.filteredEmpleadosCI = empleadosFiltrados;
                this._changeDetectorRef.markForCheck();
            } else {
                // Si no hay coincidencias locales, consultar la API
                this._tasksService.buscarEmpleadosPorCI(ciLimpio).pipe(
                    debounceTime(300)
                ).subscribe({
                    next: (data) => {
                        if (data && Array.isArray(data)) {
                            const nuevosEmpleados = data.map(empleado => ({
                                id: empleado.id || parseInt(empleado.nro_item) || 0,
                                nombre_completo: empleado.nombre_completo.trim(),
                                numdocumento: empleado.numdocumento,
                                cargo: empleado.cargo,
                                tipo_contrato: empleado.tipo_contrato,
                                unidad: empleado.unidad,
                                telefono: empleado.telefono,
                                telefono_coorp: empleado.telefono_coorp
                            }));

                            // Agregar los nuevos empleados al cache local
                            nuevosEmpleados.forEach(emp => {
                                if (!this.empleadosCargadosCI.some(e => e.id === emp.id)) {
                                    this.empleadosCargadosCI.push(emp);
                                }
                            });

                            this.filteredEmpleadosCI = nuevosEmpleados;
                            this._changeDetectorRef.markForCheck();
                        }
                    },
                    error: (error) => {
                        console.error('Error al buscar empleados por CI:', error);
                        this.filteredEmpleadosCI = empleadosFiltrados;
                        this._changeDetectorRef.markForCheck();
                    }
                });
            }
        } else {
            this.filteredEmpleadosCI = [];
        }
    }

    // Nuevo método para buscar por CI con botón
    buscarPorCI(): void {
        // Obtener el valor y limpiar espacios al inicio y final
        const ci = this.servicioForm.get('ciSolicitante').value?.trim() || '';

        if (!ci) {
            this._snackBar.open('Por favor ingrese un número de CI', 'Cerrar', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'bottom'
            });
            return;
        }

        // Actualizar el campo en el formulario con el valor limpio
        this.servicioForm.get('ciSolicitante').setValue(ci, { emitEvent: false });

        console.log('Iniciando búsqueda para CI:', ci);

        this._tasksService.buscarEmpleadosPorCI(ci).subscribe({
            next: (response) => {
                console.log('Respuesta recibida:', response);

                if (response && response.length > 0) {
                    const empleado = response[0];
                    console.log('Datos del empleado encontrado:', empleado);

                    // Construir nombre completo desde los componentes individuales
                    const nombreCompleto = [
                        empleado.paterno || '',
                        empleado.materno || '',
                        empleado.nombre || '',
                        empleado.otro_nombre || ''
                    ].filter(Boolean).join(' ').trim();

                    // Actualizar el formulario mapeando correctamente los campos
                    const datosActualizados = {
                        nombreSolicitante: nombreCompleto || empleado.empleado || " ",
                        ciSolicitante: empleado.ci || ci,
                        cargoSolicitante: empleado.cargo || " ",
                        tipoSolicitante: empleado.tipocontrato || " ",
                        oficinaSolicitante: empleado.unidad || " ",
                        telefonoSolicitante: empleado.telefono || empleado.telefono_coorp || " "
                    };

                    console.log('Actualizando formulario con:', datosActualizados);
                    this.servicioForm.patchValue(datosActualizados);

                    // Actualizar el servicio si es necesario
                    if (this.servicio && this.servicio.servicios_id) {
                        const servicioActualizado: Servicio = {
                            ...this.servicio,
                            ...datosActualizados
                        };

                        this._tasksService.updateTask(this.servicio.servicios_id, servicioActualizado)
                            .subscribe({
                                next: () => {
                                    this.servicio = servicioActualizado;
                                    this._changeDetectorRef.markForCheck();
                                }
                            });
                    }

                    this._snackBar.open('Empleado encontrado correctamente', 'Cerrar', {
                        duration: 3000,
                        panelClass: ['success-snackbar'],
                        horizontalPosition: 'center',
                        verticalPosition: 'bottom'
                    });
                } else {
                    console.log('No se encontraron resultados para el CI:', ci);
                    this._snackBar.open('No se encontró ningún empleado con ese CI', 'Cerrar', {
                        duration: 3000,
                        panelClass: ['error-snackbar'],
                        horizontalPosition: 'center',
                        verticalPosition: 'bottom'
                    });
                }
            },
            error: (error) => {
                console.error('Error al buscar empleado:', error);
                this._snackBar.open('Error al buscar empleado', 'Cerrar', {
                    duration: 3000,
                    panelClass: ['error-snackbar'],
                    horizontalPosition: 'center',
                    verticalPosition: 'bottom'
                });
            }
        });
    }

    /**
     * Save the task
     */
    saveServicio(): void {
        const servicio = this.servicioForm.getRawValue();
        
        console.log('Guardando servicio con tipo:', servicio.tipo); // Agregar log

        if (this.servicio.servicios_id) {
            this._tasksService.updateTask(this.servicio.servicios_id, servicio).subscribe({
                next: (response) => {
                    console.log('Servicio actualizado:', response); // Agregar log
                    this.flashMessage = 'success';
                },
                error: (err) => {
                    console.error('Error al actualizar:', err);
                    this.flashMessage = 'error';
                }
            });
        } else {
            this._tasksService.createTask(servicio).subscribe({
                next: () => {
                    this.flashMessage = 'success';
                },
                error: (err) => {
                    console.error('Error al crear:', err);
                    this.flashMessage = 'error';
                }
            });
        }
    }

    // Métodos para manejar el técnico asignado
    onSearchChange(term: string): void {
        this.searchTerm = term;
        this.showTecnicosDropdown = true;
        
        if (!term) {
            this.filteredTecnicos = this.tecnicos;
            return;
        }

        this.filteredTecnicos = this.tecnicos.filter(tecnico => 
            tecnico.nombre.toLowerCase().includes(term.toLowerCase())
        );
        
        this._changeDetectorRef.detectChanges();
    }

    onTecnicoFilterChange(tecnicoId: string): void {
        // Actualizar el valor en el formulario
        this.servicioForm.patchValue({
            tecnicoAsignado: tecnicoId
        });

        const updateData = {
            ...this.servicioForm.getRawValue(),
            tecnicoAsignado: tecnicoId
        };

        if (this.servicio?.servicios_id) {
            this._tasksService.updateTask(this.servicio.servicios_id, updateData)
                .subscribe({
                    next: () => {
                        this._snackBar.open('Técnico asignado correctamente', 'Cerrar', {
                            duration: 3000,
                            horizontalPosition: 'end',
                            verticalPosition: 'top',
                            panelClass: ['success-snackbar']
                        });
                    },
                    error: (error) => {
                        console.error('Error al asignar técnico:', error);
                        this._snackBar.open('Error al asignar técnico', 'Cerrar', {
                            duration: 3000,
                            horizontalPosition: 'end',
                            verticalPosition: 'top',
                            panelClass: ['error-snackbar']
                        });
                    }
                });
        }
    }

    getSelectedTecnicoDisplay(): string {
        const selectedTecnico = this.tecnicos.find(t => t.id === this.servicioForm.get('tecnicoAsignado').value);
        return selectedTecnico ? selectedTecnico.nombre : 'Sin asignar';
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        const target = event.target as HTMLElement;
        const isInputClick = target.closest('input') !== null;
        const isTecnicosDropdown = target.closest('.tecnicos-dropdown') !== null;
        
        if (!isInputClick && !isTecnicosDropdown) {
            this.showTecnicosDropdown = false;
            this._changeDetectorRef.detectChanges();
        }
    }

    private loadImage(url: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });
    }

    private async generarPDFCompleto(): Promise<jsPDFWithPlugin> {
        if (!this.servicio) {
            throw new Error('No hay servicio seleccionado');
        }

        const doc = new jsPDF() as jsPDFWithPlugin;
        const pageWidth = doc.internal.pageSize.width;
        const today = new Date();

        try {
            // Cargar logo
            const logoImg = await this.loadImage('/assets/images/logo/logo.svg');
            const canvas = document.createElement('canvas');
            canvas.width = 100;
            canvas.height = 100;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(logoImg, 0, 0, canvas.width, canvas.height);
            const logoBase64 = canvas.toDataURL('image/png');

            // Agregar logo
            doc.addImage(logoBase64, 'PNG', 15, 10, 25, 25);

            // Título
            doc.setFontSize(16);
            doc.text('Detalle de Servicio Técnico', pageWidth/2, 25, { align: 'center' });
            
            doc.setFontSize(12);
            doc.text(`Fecha de generación: ${today.toLocaleDateString()} ${today.toLocaleTimeString()}`, pageWidth/2, 35, { align: 'center' });

            // Información del servicio
            const data = [
               
                ['Tipo de Servicio', this.servicio.tipo || 'N/A'],
                ['Estado', this.servicio.estado || 'N/A'],
                ['Gestión', this.servicio.gestion?.toString() || 'N/A'],
                ['Fecha de Registro', new Date(this.servicio.fechaRegistro).toLocaleDateString() || 'N/A'],
                ['Fecha de Inicio', this.servicio.fechaInicio || 'N/A'],
                ['Fecha de Terminado', this.servicio.fechaTerminado || 'N/A'],                
                ['Nombre Solicitante', this.servicio.nombreSolicitante || 'N/A'],
                ['CI Solicitante', this.servicio.ciSolicitante || 'N/A'],
                ['Cargo Solicitante', this.servicio.cargoSolicitante || 'N/A'],
                ['Tipo Solicitante', this.servicio.tipoSolicitante || 'N/A'],
                ['Oficina Solicitante', this.servicio.oficinaSolicitante || 'N/A'],
                ['Teléfono Solicitante', this.servicio.telefonoSolicitante || 'N/A'],
                ['Problema', this.servicio.problema || 'N/A'],
                ['Observaciones', this.servicio.observaciones || 'N/A'],
                ['Informe', this.servicio.informe || 'N/A'],
                ['Técnico Asignado', this.servicio.tecnicoAsignadoString || 'N/A'],
                ['Técnico Registro', this.servicio.tecnicoRegistroString || 'N/A'],
                
                
            ];

            doc.autoTable({
                startY: 45,
                head: [['Campo', 'Valor']],
                body: data,
                theme: 'grid',
                headStyles: {
                    fillColor: [63, 81, 181],
                    textColor: 255,
                    fontSize: 10,
                    fontStyle: 'bold',
                },
                styles: {
                    fontSize: 9,
                    cellPadding: 3,
                },
            });

            // Si hay información de bienes, agregar en una nueva página
            if (this.bienes?.data) {
                doc.addPage();
                doc.setFontSize(14);
                doc.text('Información de Bienes', pageWidth/2, 20, { align: 'center' });

                const bienesData = [
                    ['Tipo Hardware', this.bienes.data.tipo || 'N/A'],
                    ['Descripción', this.bienes.data.observacion || 'N/A'],
                    ['Unidad', this.bienes.data.unidad || 'N/A'],
                    ['Marca (Bienes)', this.bienes.data.caracteristicas?.MARCA || 'N/A'],
                    ['Modelo (Bienes)', this.bienes.data.caracteristicas?.MODELO || 'N/A'],
                    ['Serie (Bienes)', this.bienes.data.caracteristicas?.SERIE || 'N/A']
                ];

                doc.autoTable({
                    startY: 30,
                    head: [['Característica', 'Valor']],
                    body: bienesData,
                    theme: 'grid',
                    headStyles: {
                        fillColor: [63, 81, 181],
                        textColor: 255,
                        fontSize: 10,
                        fontStyle: 'bold',
                    },
                    styles: {
                        fontSize: 9,
                        cellPadding: 3,
                    },
                });
            }

            // Agregar numeración de páginas
            const pageCount = doc.internal.getNumberOfPages();
            for(let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.text(`Página ${i} de ${pageCount}`, pageWidth - 20, doc.internal.pageSize.height - 10);
            }

        } catch (error) {
            console.error('Error al generar el PDF:', error);
            throw error;
        }

        return doc;
    }

    async generarPDF(): Promise<void> {
        try {
            const doc = await this.generarPDFCompleto();
            const pdfBuffer = doc.output('arraybuffer');
            const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
            
            // Crear URL para el blob
            const blobUrl = window.URL.createObjectURL(blob);
            
            // Abrir en nueva pestaña
            window.open(blobUrl, '_blank');
            
            // Crear el link de descarga
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `servicio_${this.servicio.servicios_id}_${new Date().toISOString().split('T')[0]}.pdf`;
            
            // Simular click para mostrar el diálogo nativo de descarga
            link.click();
            
            // Limpiar
            setTimeout(() => {
                window.URL.revokeObjectURL(blobUrl);
            }, 2000);
        } catch (error) {
            console.error('Error al generar el PDF:', error);
        }
    }

    async imprimirPDF(): Promise<void> {
        try {
            const doc = await this.generarPDFCompleto();
            const printFrame = document.createElement('iframe');
            printFrame.style.position = 'fixed';
            printFrame.style.right = '0';
            printFrame.style.bottom = '0';
            printFrame.style.width = '0';
            printFrame.style.height = '0';
            printFrame.style.border = 'none';
            document.body.appendChild(printFrame);

            const blob = doc.output('blob');
            const blobUrl = URL.createObjectURL(blob);

            printFrame.onload = () => {
                printFrame.contentWindow?.focus();
                printFrame.contentWindow?.print();
            };

            printFrame.src = blobUrl;
        } catch (error) {
            console.error('Error al imprimir el PDF:', error);
        }
    }

    // Agregar nuevo método
    getTecnicoEstado(): { message: string; color: string } | null {
        // Obtener el usuario actual del localStorage
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        const userRole = user?.data?.role;

        // Solo mostrar el estado si el usuario es admin (role 1)
        if (userRole !== '1') {
            return null;
        }

        const selectedTecnico = this.tecnicos.find(t => 
            t.id === this.servicioForm.get('tecnicoAsignado').value
        );

        if (!selectedTecnico) {
            return null;
        }

        return {
            message: selectedTecnico.estado === 1 
                ? 'Asignado a técnico activo' 
                : 'Asignado a técnico inactivo',
            color: selectedTecnico.estado === 1 ? 'text-red-500' : 'text-green-500'
        };
    }
}
