import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { Board, Card, EstadoServicio, TipoServicio } from '../scrumboard.models';
import { ScrumboardService } from '../scrumboard.service';
import { BoardFiltersComponent } from './board-filters/board-filters.component';
import { ScrumboardCardComponent } from '../card/card.component';
import { AddCardComponent } from './add-card/add-card.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ScrumboardCardDetailsComponent } from '../card/details/details.component';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';

interface ListState {
    page: number;
    limit: number;
    total: number;
    loading: boolean;
}

@Component({
    selector: 'scrumboard-board',
    templateUrl: './board.component.html',
    styleUrls: ['./board.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        RouterLink,
        NgFor,
        NgIf,
        FormsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatIconModule,
        MatButtonModule,
        MatDialogModule,
        MatMenuModule,
        DragDropModule,
        BoardFiltersComponent,
        ScrumboardCardComponent,
        MatTooltipModule,
        MatSnackBarModule,
        MatInputModule
    ]
})
export class ScrumboardBoardComponent implements OnInit, OnDestroy {
    board: Board = {
        id: '',
        title: '',
        description: '',
        icon: '',
        lists: []
    };
    
    filteredCards: Card[] = [];
    tecnicos: any[] = [];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    hiddenLists: string[] = [];
    selectedTecnicoId: string ='';
    selectedTipoServicio: string = 'asistencia';
    canSelectTecnico: boolean = true;
    searchTerm: string = '';
    filteredTecnicos: any[] = [];
    userRole: string = '3'; // valor por defecto

    private readonly HIDDEN_LISTS_KEY = 'scrumboard_hidden_lists';

    lists = [
        {
            id: 'sin-asignar',
            title: EstadoServicio.SIN_ASIGNAR,
            position: 1,
            cards: []
        },
        {
            id: 'pendiente',
            title: EstadoServicio.PENDIENTE,
            position: 2,
            cards: []
        },
        {
            id: 'en-progreso',
            title: EstadoServicio.EN_PROGRESO,
            position: 3,
            cards: []
        },
        {
            id: 'terminado',
            title: EstadoServicio.TERMINADO,
            position: 4,
            cards: []
        }
    ];

    listStates: { [key: string]: ListState } = {
        'sin-asignar': { page: 1, limit: 10, total: 0, loading: false },
        'pendiente': { page: 1, limit: 10, total: 0, loading: false },
        'en-progreso': { page: 1, limit: 10, total: 0, loading: false },
        'terminado': { page: 1, limit: 10, total: 0, loading: false }
    };

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _dialog: MatDialog,
        private _scrumboardService: ScrumboardService,
        private _snackBar: MatSnackBar
    ) {
        this.loadHiddenListsFromStorage();
    }

    ngOnInit(): void {
        // Obtener el ID del tablero de la URL
        const boardId = this._activatedRoute.snapshot.paramMap.get('boardId');
        if (boardId) {
            // Inicializar el tablero con las listas
            this.board = {
                id: boardId,
                title: this.getTipoServicio(boardId),
                description: '',
                icon: '',
                lists: this.lists
            };
            
            // Sincronizar el tipo de servicio seleccionado una sola vez al inicio
            this.selectedTipoServicio = this.getTipoServicioFromTitle(this.board.title);
            
            // Inicializar las listas con arrays vacíos
            this.lists.forEach(list => {
                list.cards = [];
            });

            // Forzar detección de cambios inicial
            this._changeDetectorRef.detectChanges();

            // Cargar datos
            //this.reloadAllLists();

            // Obtener datos del usuario del localStorage
            const userString = localStorage.getItem('user');
            console.log('Usuario en localStorage:', userString);
            
            let userData;
            try {
                // Obtener el token del localStorage
                const token = localStorage.getItem('accessToken');
                if (token) {
                    // Decodificar el token (la parte payload)
                    const tokenParts = token.split('.');
                    const payload = JSON.parse(atob(tokenParts[1]));
                    console.log('Token decodificado:', payload);
                    
                    userData = {
                        role: payload.role,
                        id: payload.id
                    };
                } else {
                    userData = null;
                }
                console.log('Datos del usuario:', userData);
            } catch (e) {
                console.error('Error al obtener datos del usuario:', e);
                userData = null;
            }

            // Verificar la estructura específica de los datos del usuario
            const userRole = userData?.role || 'user';
            const userId = userData?.id;
            
            console.log('Role del usuario:', userRole);
            console.log('ID del usuario:', userId);
            
            this.selectedTecnicoId = userId;

            // Cargar técnicos después de establecer el ID inicial
            this._scrumboardService.getTecnicos()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe({
                    next: (response) => {
                        this.tecnicos = response;
                        this.filteredTecnicos = response;
                        
                        // Siempre inicializar con el ID del usuario actual
                        this.selectedTecnicoId = userId;
                        
                        // Establecer permisos según el rol
                        if (userRole === '3') {
                            // Role TECNICO: No puede cambiar la selección
                            this.canSelectTecnico = false;
                        } else if (userRole === '2') {
                            // Role Supervisor: Puede ver todos los activos
                            this.canSelectTecnico = true;
                            this.tecnicos = this.tecnicos.filter(t => t.estado === 1);
                        } else if (userRole === '1') {
                            // Role Admin: Puede ver todos
                            this.canSelectTecnico = true;
                        }
                        
                        // Recargar las listas con el técnico seleccionado
                        this.reloadAllLists();
                        this._changeDetectorRef.detectChanges();
                    },
                    error: (error) => {
                        console.error('Error al cargar técnicos:', error);
                        this.tecnicos = [];
                        this._changeDetectorRef.detectChanges();
                    }
                });

            // Suscribirse a las actualizaciones de tarjetas
            this._scrumboardService.cardUpdates$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe(update => {
                    if (update.type === 'update') {
                        // Recargar solo la lista afectada
                        if (update.listId) {
                            const list = this.lists.find(l => l.id === update.listId);
                            if (list) {
                                const currentCards = [...list.cards];
                                this.loadCardsForList(list.id, true, currentCards);
                            }
                        } else {
                            // Si no hay listId, recargar todas las listas
                            this.reloadAllLists();
                        }
                    } else if (update.type === 'delete') {
                        // Recargar la lista específica donde estaba la tarjeta
                        if (update.listId) {
                            const list = this.lists.find(l => l.id === update.listId);
                            if (list) {
                                // Eliminar la tarjeta de la lista actual
                                list.cards = list.cards.filter(card => card.id !== update.cardId);
                                this.listStates[list.id].total--;
                                
                                // Recargar la lista para asegurar sincronización
                                const currentCards = [...list.cards];
                                this.loadCardsForList(list.id, true, currentCards);
                            }
                        } else {
                            // Si no hay listId, recargar todas las listas
                            this.reloadAllLists();
                        }
                        
                        // Forzar actualización de la vista
                        this._changeDetectorRef.markForCheck();
                        this._changeDetectorRef.detectChanges();
                    }
                });
        }

        // Obtener el rol del usuario del token
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                const tokenParts = token.split('.');
                const payload = JSON.parse(atob(tokenParts[1]));
                this.userRole = payload.role;
            } catch (e) {
                console.error('Error al obtener rol del usuario:', e);
            }
        }
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    /**
     * Cargar tarjetas
     */
    loadCards(boardId: string): void {
        this._scrumboardService.getServices(this.getTipoServicio(boardId))
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(cards => {
                this.filteredCards = cards;
                this.distributeCards(cards);
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * Manejar cambio de filtro de técnico
     */
    onTecnicoFilterChange(tecnicoId: string): void {
        this.selectedTecnicoId = tecnicoId;
        // Pasar null al servicio cuando se selecciona 'TODOS'
        const filterId = tecnicoId === 'TODOS' ? null : tecnicoId;
        
        // Recargar todas las listas con el nuevo filtro
        this._changeDetectorRef.detectChanges();
        this.reloadAllLists();
    }

    /**
     * Filtrar tarjetas
     */
    filterCards(cards: Card[]): void {
        this.filteredCards = cards;
        this.distributeCards(cards);
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Abrir diálogo de nueva tarjeta
     */
    openNewCardDialog(): void {
        const dialogRef = this._dialog.open(AddCardComponent, {
            width: '700px',
            maxHeight: '90vh',
            disableClose: false,
            autoFocus: false,
            data: {
                card: {
                    tipo: this.getTipoServicio(this.board.id),
                    estado: 'SIN ASIGNAR',
                    fechaRegistro: new Date().toISOString()
                },
                isEdit: false
            },
            backdropClass: 'cursor-pointer'
        });

        dialogRef.backdropClick().subscribe(() => {
            dialogRef.close();
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.reloadAllLists();
            }
        });
    }

    /**
     * Manejar el drop de una tarjeta
     */
    cardDropped(event: CdkDragDrop<Card[]>): void {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            const card = event.previousContainer.data[event.previousIndex];
            const newStatus = this.lists.find(list => list.id === event.container.id)?.title;

            if (newStatus) {
                // Mantener copias de las listas originales
                const sourceList = [...event.previousContainer.data];
                const targetList = [...event.container.data];

                // Realizar el movimiento en la UI
                transferArrayItem(
                    event.previousContainer.data,
                    event.container.data,
                    event.previousIndex,
                    event.currentIndex
                );

                // Actualizar contadores inmediatamente
                this.listStates[event.previousContainer.id].total -= 1;
                this.listStates[event.container.id].total += 1;

                // Actualizar el estado y fechas de la tarjeta movida
                const movedCard = event.container.data[event.currentIndex];
                movedCard.estado = newStatus as EstadoServicio;

                // Actualizar fechas según el estado
                switch (newStatus) {
                    case EstadoServicio.SIN_ASIGNAR:
                    case EstadoServicio.PENDIENTE:
                        movedCard.fechaInicio = " ";
                        movedCard.fechaTerminado = " ";
                        break;
                    case EstadoServicio.EN_PROGRESO:
                        movedCard.fechaInicio = new Date().toISOString();
                        movedCard.fechaTerminado = " ";
                        break;
                    case EstadoServicio.TERMINADO:
                        // Si no tiene fecha de inicio o está vacía, establecerla
                        if (!movedCard.fechaInicio || movedCard.fechaInicio === " ") {
                            movedCard.fechaInicio = new Date().toISOString();
                        }
                        movedCard.fechaTerminado = new Date().toISOString();
                        break;
                }

                // Forzar actualización de la UI
                this._changeDetectorRef.detectChanges();

                // Actualizar en el backend
                this._scrumboardService.updateServiceStatus(card.id, newStatus as EstadoServicio)
                    .subscribe({
                        next: (updatedCard) => {
                            // Actualizar la tarjeta con los datos del servidor
                            Object.assign(movedCard, updatedCard);
                            this._changeDetectorRef.detectChanges();
                        },
                        error: (error) => {
                            console.error('Error al actualizar el estado:', error);
                            
                            // Revertir contadores y cambios en caso de error
                            this.listStates[event.previousContainer.id].total += 1;
                            this.listStates[event.container.id].total -= 1;
                            event.previousContainer.data = sourceList;
                            event.container.data = targetList;
                            
                            this._snackBar.open(
                                'Error al actualizar el estado. Intente nuevamente.',
                                'Cerrar',
                                {
                                    duration: 3000,
                                    horizontalPosition: 'end',
                                    verticalPosition: 'top',
                                    panelClass: ['error-snackbar']
                                }
                            );
                            
                            this._changeDetectorRef.detectChanges();
                        }
                    });
            }
        }
    }

    /**
     * Reintentar actualización de estado
     */
    private retryUpdateStatus(cardId: string, newStatus: EstadoServicio): void {
        // Esperar 3 segundos antes de reintentar
        setTimeout(() => {
            this._scrumboardService.updateServiceStatus(cardId, newStatus)
                .subscribe({
                    error: () => this.retryUpdateStatus(cardId, newStatus), // Reintentar indefinidamente
                    complete: () => this.reloadAllLists()
                });
        }, 3000);
    }

    /**
     * Distribuir tarjetas en las listas
     */
    private distributeCards(cards: Card[]): void {
        // Limpiar las listas existentes
        this.lists.forEach(list => list.cards = []);
        
        // Distribuir las tarjetas según su estado
        cards.forEach(card => {
            const list = this.lists.find(l => l.title === card.estado);
            if (list) {
                list.cards.push(card);
            }
        });
    }

    private getTipoServicio(boardId: string): TipoServicio {
        switch (boardId) {
            case 'asistencia-sitio':
                return TipoServicio.ASISTENCIA_SITIO;
            case 'servicio-laboratorio':
                return TipoServicio.SERVICIO_LABORATORIO;
            case 'asistencia-remota':
                return TipoServicio.ASISTENCIA_REMOTA;
            default:
                console.error('ID de tablero no válido:', boardId);
                return null;
        }
    }

    /**
     * Cargar listas ocultas del localStorage
     */
    private loadHiddenListsFromStorage(): void {
        const boardId = this._activatedRoute.snapshot.paramMap.get('boardId');
        if (boardId) {
            const storedLists = localStorage.getItem(`${this.HIDDEN_LISTS_KEY}_${boardId}`);
            if (storedLists) {
                this.hiddenLists = JSON.parse(storedLists);
            }
        }
    }

    /**
     * Guardar listas ocultas en localStorage
     */
    private saveHiddenListsToStorage(): void {
        const boardId = this._activatedRoute.snapshot.paramMap.get('boardId');
        if (boardId) {
            localStorage.setItem(
                `${this.HIDDEN_LISTS_KEY}_${boardId}`, 
                JSON.stringify(this.hiddenLists)
            );
        }
    }

    /**
     * Ocultar lista
     */
    hideList(listId: string): void {
        if (!this.hiddenLists.includes(listId)) {
            this.hiddenLists.push(listId);
            this.saveHiddenListsToStorage();
            this._changeDetectorRef.markForCheck();
        }
    }

    /**
     * Mostrar lista
     */
    showList(listId: string): void {
        const index = this.hiddenLists.indexOf(listId);
        if (index !== -1) {
            this.hiddenLists.splice(index, 1);
            this.saveHiddenListsToStorage();
            this._changeDetectorRef.markForCheck();
        }
    }

    /**
     * Verificar si una lista está oculta
     */
    isListHidden(listId: string): boolean {
        return this.hiddenLists.includes(listId);
    }

    /**
     * Obtener título de una lista
     */
    getListTitle(listId: string): string {
        const list = this.lists.find(l => l.id === listId);
        return list ? list.title : '';
    }

    /**
     * Obtener total de páginas para una lista
     */
    getTotalPages(listId: string): number {
        const state = this.listStates[listId];
        return Math.ceil(state.total / state.limit);
    }

    /**
     * Ir a una página específica
     */
    goToPage(listId: string, page: number): void {
        const state = this.listStates[listId];
        const totalPages = this.getTotalPages(listId);

        if (page < 1 || page > totalPages || state.loading) {
            return;
        }

        state.page = page;
        this.loadCardsForList(listId, true);
    }

    /**
     * Cargar tarjetas para una lista específica
     */
    loadCardsForList(listId: string, reset: boolean = false, currentCards: Card[] = []): void {
        const state = this.listStates[listId];
        if (state.loading) return;

        state.loading = true;
        const list = this.lists.find(l => l.id === listId);
        
        // Convertir 'TODOS' a null para la consulta al backend
        const tecnicoId = this.selectedTecnicoId === 'TODOS' ? null : this.selectedTecnicoId;

        this._scrumboardService.getCardsByStatus(
            this.getTipoServicio(this.board.id),
            list.title as EstadoServicio,
            tecnicoId,
            state.page,
            state.limit
        ).pipe(
            takeUntil(this._unsubscribeAll)
        ).subscribe({
            next: (response) => {
                if (reset) {
                    // Mantener el orden actual de las tarjetas
                    const updatedCards = response.cards.map(newCard => {
                        const existingCard = currentCards.find(card => card.id === newCard.id);
                        return existingCard || newCard;
                    });
                    
                    // Mantener el orden original
                    list.cards = updatedCards.sort((a, b) => {
                        const indexA = currentCards.findIndex(card => card.id === a.id);
                        const indexB = currentCards.findIndex(card => card.id === b.id);
                        return indexA - indexB;
                    });
                } else {
                    // Para paginación, agregar solo las nuevas tarjetas al final
                    const newCards = response.cards.filter(newCard => 
                        !list.cards.some(existingCard => existingCard.id === newCard.id)
                    );
                    list.cards = [...list.cards, ...newCards];
                }
                
                state.total = response.total;
                state.loading = false;
                this._changeDetectorRef.detectChanges();
            },
            error: (error) => {
                console.error('Error al cargar tarjetas:', error);
                state.loading = false;
                list.cards = currentCards;
                this._changeDetectorRef.detectChanges();
            }
        });
    }

    /**
     * Recargar todas las listas
     */
    reloadAllLists(): void {
        // Guardar el estado actual de todas las listas
        const currentLists = this.lists.map(list => ({
            ...list,
            cards: [...(list.cards || [])]
        }));

        // Resetear los estados de paginación
        Object.keys(this.listStates).forEach(listId => {
            this.listStates[listId].page = 1;
        });

        // Cargar las nuevas tarjetas manteniendo las existentes mientras se cargan
        Object.keys(this.listStates).forEach(listId => {
            const list = this.lists.find(l => l.id === listId);
            if (list) {
                list.cards = currentLists.find(l => l.id === listId)?.cards || [];
                this.loadCardsForList(listId, true);
            }
        });
    }

    /**
     * Obtener índice inicial de los items mostrados
     */
    getStartIndex(listId: string): number {
        const state = this.listStates[listId];
        return ((state.page - 1) * state.limit) + 1;
    }

    /**
     * Obtener índice final de los items mostrados
     */
    getEndIndex(listId: string): number {
        const state = this.listStates[listId];
        const endIndex = state.page * state.limit;
        return Math.min(endIndex, state.total);
    }

    /**
     * Abrir diálogo de nuevo servicio
     */
    openNewServiceDialog(): void {
        const dialogRef = this._dialog.open(AddCardComponent, {
            data: {
                card: {
                    tipo: this.getTipoServicio(this.board.id),
                    estado: 'SIN ASIGNAR',
                    fechaRegistro: new Date().toISOString()
                },
                isEdit: false
            },
            width: '700px',
            height: 'auto',
            maxHeight: '90vh',
            panelClass: ['service-dialog', 'dark'],
            autoFocus: false,
            disableClose: false,
            backdropClass: 'cursor-pointer'
        });

        dialogRef.backdropClick().subscribe(() => {
            dialogRef.close();
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                // Mantener las tarjetas existentes mientras se cargan las nuevas
                const currentCards = this.lists.map(list => ({
                    id: list.id,
                    cards: [...(list.cards || [])]
                }));

                // Resetear solo la lista "SIN ASIGNAR" ya que el nuevo servicio irá allí
                const sinAsignarList = this.lists.find(l => l.id === 'sin-asignar');
                if (sinAsignarList) {
                    this.listStates['sin-asignar'].page = 1;
                    this.loadCardsForList('sin-asignar', true);
                }

                // Forzar la detección de cambios
                this._changeDetectorRef.detectChanges();
            }
        });
    }

    /**
     * Obtener IDs de listas conectadas para drag&drop
     */
    getConnectedLists(): string[] {
        return this.lists.map(list => list.id);
    }

    /**
     * Cargar todas las tarjetas
     */
    private loadAllCards(): void {
        const estados = [
            EstadoServicio.SIN_ASIGNAR,
            EstadoServicio.PENDIENTE,
            EstadoServicio.EN_PROGRESO,
            EstadoServicio.TERMINADO
        ];

        // Crear un array de observables para cada estado
        const observables = estados.map(estado =>
            this._scrumboardService.getCardsByStatus(
                this.getTipoServicio(this.board.id),
                estado,
                this.selectedTecnicoId,
                1,
                100 // Aumentar el límite para obtener más tarjetas
            )
        );

        // Combinar todos los observables
        forkJoin(observables)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(results => {
                // Combinar todas las tarjetas
                const allCards = results.reduce((acc, curr) => [...acc, ...curr.cards], []);
                this.filteredCards = allCards;
                this.distributeCards(allCards);
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * Crear nuevo servicio directamente
     */
    createNewService(): void {
        const tipoServicio = this.getTipoServicio(this.board.id);
        
        if (!tipoServicio) {
            this._snackBar.open('Error: Tipo de servicio no válido', 'Cerrar', {
                duration: 3000,
                horizontalPosition: 'end',
                verticalPosition: 'top',
                panelClass: ['error-snackbar']
            });
            return;
        }

        // Obtener el ID del usuario del token
        const token = localStorage.getItem('accessToken');
        let userId = 3;
        if (token) {
            try {
                const tokenParts = token.split('.');
                const payload = JSON.parse(atob(tokenParts[1]));
                userId = payload.id;
            } catch (e) {
                console.error('Error al obtener ID del usuario:', e);
            }
        }

        // Crear el servicio solo con los datos mínimos necesarios
        const serviceData = {
            tipo: tipoServicio,
            estado: EstadoServicio.SIN_ASIGNAR,
            fechaRegistro: new Date().toISOString(),
            // Campos requeridos con valores por defecto
            nombreResponsableEgreso: ' ',
            cargoResponsableEgreso: ' ',
            oficinaResponsableEgreso: ' ',
            telefonoResponsableEgreso: ' ',
            tipoResponsableEgreso: ' ',
            ciResponsableEgreso: ' ',
            tecnicoEgreso: ' ',
            fechaEgreso: ' ',
            observaciones: ' ',
            gestion: 3,
            tecnicoRegistro: userId,
            tecnicoAsignado: this.selectedTecnicoId === 'TODOS' ? userId : Number(this.selectedTecnicoId) || userId,
            numero: 0,
            equipo: null
        };

        this._scrumboardService.createService(serviceData, tipoServicio)
            .subscribe({
                next: (response) => {
                    this._snackBar.open('Servicio creado correctamente', 'Cerrar', {
                        duration: 3000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top',
                        panelClass: ['success-snackbar']
                    });

                    // Actualizar solo la lista "SIN ASIGNAR"
                    const sinAsignarList = this.lists.find(l => l.id === 'sin-asignar');
                    if (sinAsignarList) {
                        // Crear una nueva tarjeta con los datos de respuesta
                        const newCard: Card = {
                            id: response.data.servicios_id,
                            tipo: tipoServicio,
                            estado: EstadoServicio.SIN_ASIGNAR,
                            fechaRegistro: new Date().toISOString(),
                            nombreSolicitante: '',
                            solicitante: '',
                            carnet: '',
                            cargo: '',
                            tipoSolicitante: '',
                            oficinaSolicitante: '',
                            telefonoSolicitante: '',
                            tecnicoAsignado: null,
                            fechaInicio: null,
                            fechaTerminado: null,
                            problema: '',
                            observacionesProblema: '',
                            informe: '',
                            codigoBienes: '',
                            tipoHardware: '',
                            descripcion: '',
                            listId: 'sin-asignar',
                            position: 0,
                            tecnicoRegistro: response.data.tecnicoRegistro  // Agregar esta línea
                        };

                        // Agregar la nueva tarjeta al principio de la lista
                        sinAsignarList.cards = [newCard, ...(sinAsignarList.cards || [])];
                        
                        // Actualizar el total inmediatamente
                        this.listStates['sin-asignar'].total += 1;
                        
                        // Forzar actualización de la vista
                        this._changeDetectorRef.detectChanges();
                        
                        // Recargar la lista después de asegurarnos que se guardó
                        setTimeout(() => {
                            this.reloadAllLists();
                        }, 500);
                    }
                },
                error: (error) => {
                    console.error('Error al crear servicio:', error);
                    this._snackBar.open('Error al crear el servicio', 'Cerrar', {
                        duration: 3000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top',
                        panelClass: ['error-snackbar']
                    });
                }
            });
    }

    // Método que devuelve el nombre del técnico seleccionado para mostrar en la interfaz.
    // Si el técnico seleccionado es 'TODOS', se devuelve la cadena 'TODOS'.
    // De lo contrario, se busca el técnico en la lista de técnicos y se devuelve su nombre.
    // Si no se encuentra el técnico, también se devuelve 'TODOS'.
    getSelectedTecnicoDisplay(): string {
        return this.selectedTecnicoId === 'TODOS' ? 'TODOS' : 
            (this.tecnicos.find(t => t.id === this.selectedTecnicoId)?.nombre || 'TODOS');
    }

    /**
     * Limpia todos los filtros
     */
    clearFilters(): void {
        // Mostrar todas las listas
        this.hiddenLists = [];
        
        // Resetear el filtro de técnico
       // this.selectedTecnicoId = 'TODOS';
        
        // Recargar todas las listas
        Object.keys(this.listStates).forEach(listId => {
            this.goToPage(listId, 1); // Volver a la primera página
        });
        
        // Actualizar la vista
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Filtra por estado
     */
    filterByStatus(status: 'pendiente' | 'completado'): void {
        // Ocultar todas las listas primero
        const allListIds = Object.keys(this.listStates);
        this.hiddenLists = [...allListIds];
        
        // Mostrar solo las listas correspondientes al estado
        switch(status) {
            case 'pendiente':
                // Mostrar listas de "Por hacer" y "En progreso"
                this.hiddenLists = this.hiddenLists.filter(id => 
                    !['por-hacer', 'en-progreso'].includes(id)
                );
                break;
                
            case 'completado':
                // Mostrar lista de "Completado"
                this.hiddenLists = this.hiddenLists.filter(id => 
                    id !== 'completado'
                );
                break;
        }
        
        // Recargar las listas visibles
        allListIds.forEach(listId => {
            if (!this.hiddenLists.includes(listId)) {
                this.goToPage(listId, 1); // Volver a la primera página
            }
        });
        
        // Actualizar la vista
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Filtra por tipo de servicio
     */
    filterByType(type: 'asistencia' | 'laboratorio' | 'remota'): void {
        // Guardar las listas actuales antes de la actualización
        const previousLists = this.lists.map(list => ({
            ...list,
            cards: [...list.cards]
        }));

        // Actualizar el tipo seleccionado y el board
        this.selectedTipoServicio = type;
        
        switch(type) {
            case 'asistencia':
                this.board.title = TipoServicio.ASISTENCIA_SITIO;
                this.board.id = 'asistencia-sitio';
                break;
            case 'laboratorio':
                this.board.title = TipoServicio.SERVICIO_LABORATORIO;
                this.board.id = 'servicio-laboratorio';
                break;
            case 'remota':
                this.board.title = TipoServicio.ASISTENCIA_REMOTA;
                this.board.id = 'asistencia-remota';
                break;
        }

        // Mostrar todas las listas
        this.hiddenLists = [];
        
        // Resetear estados de las listas pero mantener las tarjetas existentes
        Object.keys(this.listStates).forEach(listId => {
            this.listStates[listId].page = 1;
            this.listStates[listId].total = 0;
        });

        // Mantener las tarjetas anteriores mientras se cargan las nuevas
        this.lists.forEach((list, index) => {
            list.cards = previousLists[index].cards;
        });

        // Resetear el filtro de técnico
        //this.selectedTecnicoId = 'TODOS';
        
        // Actualizar la vista una vez
        this._changeDetectorRef.detectChanges();

        // Cargar los nuevos datos
        requestAnimationFrame(() => {
            this.reloadAllLists();
        });
    }

    getSelectedServiceIcon(): string {
        switch(this.board?.id) {
            case 'asistencia-sitio':
                return 'heroicons_outline:computer-desktop';
            case 'servicio-laboratorio':
                return 'heroicons_outline:beaker';
            case 'asistencia-remota':
                return 'heroicons_outline:globe-alt';
            default:
                return 'heroicons_outline:computer-desktop';
        }
    }

    getSelectedServiceDescription(): string {
        switch(this.board?.id) {
            case 'asistencia-sitio':
                return 'Servicios de asistencia técnica en sitio';
            case 'servicio-laboratorio':
                return 'Servicios de mantenimiento en laboratorio';
            case 'asistencia-remota':
                return 'Servicios de asistencia técnica remota';
            default:
                return '';
        }
    }

    getTipoServicioFromTitle(title: string): string {
        switch(title) {
            case TipoServicio.ASISTENCIA_SITIO:
                return 'asistencia';
            case TipoServicio.SERVICIO_LABORATORIO:
                return 'laboratorio';
            case TipoServicio.ASISTENCIA_REMOTA:
                return 'remota';
            default:
                return 'asistencia';
        }
    }

    onSearchChange(term: string): void {
        this.searchTerm = term;
        if (!term) {
            this.filteredTecnicos = this.tecnicos;
            return;
        }

        // Filtrar técnicos basado en el término de búsqueda
        this.filteredTecnicos = this.tecnicos.filter(tecnico => 
            //tecnico.id === 'TODOS' || // Mantener siempre la opción "TODOS"
            tecnico.nombre.toLowerCase().includes(term.toLowerCase())
        );
        
        this._changeDetectorRef.detectChanges();
    }

    /**
     * Filtrar listas según el rol del usuario
     */
    filterListsByRole(lists: any[]): any[] {
        if (this.userRole === '3') {
            // Para rol 3, filtrar la lista "SIN ASIGNAR"
            return lists.filter(list => list.title !== 'SIN ASIGNAR');
        }
        return lists; // Roles 1 y 2 ven todas las listas
    }

    /**
     * Verificar si el usuario puede crear servicios
     */
    canCreateService(): boolean {
        // Obtener el token del localStorage
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                // Decodificar el token
                const tokenParts = token.split('.');
                const payload = JSON.parse(atob(tokenParts[1]));
                console.log("rol del usuario:", payload.role);
                // Retornar true solo si el rol es 1 o 2
                return ['1', '2'].includes(payload.role);
            } catch (e) {
                console.error('Error al verificar permisos:', e);
                return false;
            }
        }
        return false; // Si no hay token, no permitir crear
    }
}
