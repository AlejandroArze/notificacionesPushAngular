import { Component, Inject, OnInit, OnDestroy, ChangeDetectorRef, HostListener, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { Card, TipoServicio, Equipo } from '../../scrumboard.models';
import { ScrumboardService } from '../../scrumboard.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { debounceTime, Subject, takeUntil, delay } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmationDialogComponent } from '../../dialogs/confirmation-dialog.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCardModule } from '@angular/material/card';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Agregar la interfaz para jsPDF con autoTable
interface jsPDFWithPlugin extends jsPDF {
    autoTable: (options: any) => jsPDF;
    internal: any;
}

@Component({
    selector: 'scrumboard-card-details',
    templateUrl: './details.component.html',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        DatePipe,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDialogModule,
        MatIconModule,
        MatDatepickerModule,
        MatNativeDateModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatTooltipModule,
        MatAutocompleteModule,
        MatCardModule
    ]
})
export class ScrumboardCardDetailsComponent implements OnInit, OnDestroy {
    cardForm: FormGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    tecnicoRegistroNombre: string = '';
    tiposServicio = Object.values(TipoServicio);
    actualizando = false;
    searchEquipoCtrl = new FormControl('');
    filteredEquipos: Equipo[] = [];
    bienes: any = null;
    isOptionSelected = false;
    filtredEquipos: { equipos_id: number; codigo: string }[] = [];
    showTecnicosDropdown = false;
    filteredTecnicos: any[] = [];
    tecnicos: any[] = [];
    searchTerm: string = '';
    canSelectTecnico: boolean = true;
    showEquiposDropdown = false;

    @ViewChild('searchInput') searchInput: ElementRef;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { card: Card; isNew: boolean },
        private dialogRef: MatDialogRef<ScrumboardCardDetailsComponent>,
        private _formBuilder: FormBuilder,
        private _scrumboardService: ScrumboardService,
        private _snackBar: MatSnackBar,
        private _dialog: MatDialog,
        private _changeDetectorRef: ChangeDetectorRef
    ) {
        // Cargar técnicos al inicializar
        this._scrumboardService.getTecnicos()
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

                        // Si hay un técnico asignado, mostrar su nombre
                        if (this.data.card?.tecnicoAsignado) {
                            const tecnicoAsignado = this.tecnicos.find(t => t.id === this.data.card.tecnicoAsignado);
                            if (tecnicoAsignado) {
                                this.cardForm.patchValue({
                                    tecnicoAsignado: tecnicoAsignado.id
                                });
                            }
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

    ngOnInit(): void {
        // Inicializar el formulario sin validadores inicialmente
        this.cardForm = this._formBuilder.group({
            solicitante: [''],
            carnet: [''],
            cargoSolicitante: [''],
            tipoSolicitante: [''],
            oficina: [''],
            telefono: [''],
            tipoServicio: [''],
            estado: ['SIN ASIGNAR'],
            tecnicoRegistro: [''],
            fechaRegistro: [null],
            fechaInicio: [null],
            fechaTerminado: [null],
            problema: [''],
            observaciones: [''],
            informe: [''],
            equipo: [''],
            tipoHardware: [''],
            nombreResponsableEgreso: [''],
            cargoResponsableEgreso: [''],
            telefonoResponsableEgreso: [''],
            gestion: [3],
            tecnicoAsignado: [3],
            tipoResponsableEgreso: [''],
            oficinaResponsableEgreso: [''],
            numero: [464],
            fechaEgreso: [''],
            tecnicoEgreso: [''],
            ciResponsableEgreso: ['']
        });

        // Si no es nuevo, cargar los datos de la tarjeta
        if (!this.data.isNew && this.data.card) {
            console.log('Cargando datos de la tarjeta:', this.data.card);
            
            // Primero cargar los datos básicos
            this.cardForm.patchValue({
                solicitante: this.data.card.nombreSolicitante || '',
                carnet: this.data.card.carnet || '',
                cargoSolicitante: this.data.card.cargo || '',
                tipoSolicitante: this.data.card.tipoSolicitante || '',
                oficina: this.data.card.oficinaSolicitante || '',
                telefono: this.data.card.telefonoSolicitante || '',
                tipoServicio: this.data.card.tipo || '',
                estado: this.data.card.estado || 'SIN ASIGNAR',
                tecnicoRegistro: this.data.card.tecnicoRegistro ,
                fechaRegistro: this.data.card.fechaRegistro || new Date().toISOString(),
                fechaInicio: this.data.card.fechaInicio || null,
                fechaTerminado: this.data.card.fechaTerminado || null,
                problema: this.data.card.problema || '',
                observaciones: this.data.card.observacionesProblema || '',
                informe: this.data.card.informe || '',
                equipo: this.data.card.codigoBienes || '',
                tecnicoAsignado: this.data.card.tecnicoAsignado
            });

            // Si hay un equipo_id, buscar su código
            if (this.data.card.codigoBienes) {
                this._scrumboardService.buscarEquipos(1, 100, '')
                    .subscribe({
                        next: (equipos) => {
                            const equipo = equipos.find(e => e.equipos_id === parseInt(this.data.card.codigoBienes));
                            if (equipo) {
                                this.searchEquipoCtrl.setValue(equipo.codigo, { emitEvent: false });
                                this.cardForm.controls['equipo'].setValue(equipo.equipos_id);
                                // También obtener la información del bien
                                this._scrumboardService.getBienes(equipo.codigo)
                                    .subscribe({
                                        next: (response) => {
                                            this.bienes = response;
                                        },
                                        error: (err) => {
                                            console.error('Error al obtener bienes:', err);
                                            this.bienes = null;
                                        }
                                    });
                            }
                        },
                        error: (err) => {
                            console.error('Error al buscar equipo:', err);
                        }
                    });
            }
        }

        // Marcar todos los campos como touched para activar la validación
        Object.keys(this.cardForm.controls).forEach(key => {
            const control = this.cardForm.get(key);
            control.markAsTouched();
        });

        // Suscribirse a los cambios del input
        this.searchEquipoCtrl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(value => {
                if (typeof value === 'string') {
                    this.onSearchEquipos(value);
                }
            });

        // Si no es nuevo y hay un equipo_id, buscar y cargar su información
        if (!this.data.isNew && this.data.card?.codigoBienes) {
            console.log('Buscando equipo con ID:', this.data.card.codigoBienes);
            
            // Primero buscar el equipo por su ID
            this._scrumboardService.buscarEquipos(1, 100, '')
                .subscribe({
                    next: (equipos) => {
                        // Encontrar el equipo que coincida con el ID
                        const equipo = equipos.find(e => e.equipos_id === parseInt(this.data.card.codigoBienes));
                        if (equipo) {
                            console.log('Equipo encontrado:', equipo);
                            
                            // Establecer el código en el input y el ID en el formulario
                            this.searchEquipoCtrl.setValue(equipo.codigo, { emitEvent: false });
                            this.cardForm.controls['equipo'].setValue(equipo.equipos_id);

                            // Cargar la información de bienes
                            this._scrumboardService.getBienes(equipo.codigo)
                                .subscribe({
                                    next: (response) => {
                                        this.bienes = response;
                                        console.log('Información de bienes cargada:', this.bienes);
                                    },
                                    error: (err) => {
                                        console.error('Error al obtener bienes:', err);
                                        this.bienes = null;
                                    }
                                });

                            // También cargar los equipos filtrados para el dropdown
                            this.filtredEquipos = equipos
                                .filter(e => e.codigo && e.codigo.trim() !== '')
                                .reduce((acc, current) => {
                                    const exists = acc.find(item => item.codigo === current.codigo);
                                    if (!exists) {
                                        return [...acc, current];
                                    }
                                    return acc;
                                }, []);
                        } else {
                            console.warn('No se encontró el equipo con ID:', this.data.card.codigoBienes);
                        }
                    },
                    error: (err) => {
                        console.error('Error al buscar equipo:', err);
                    }
                });
        }

        // Suscribirse a cambios en el formulario para actualización automática
        this.cardForm.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(2000)  // Esperar 2 segundos después del último cambio
            )
            .subscribe(formValue => {
                console.log('Detectado cambio en el formulario:', {
                    formValue,
                    isDirty: this.cardForm.dirty,
                    isValid: this.cardForm.valid,
                    actualizando: this.actualizando
                });

                if (!this.actualizando && this.cardForm.dirty) {
                    console.log('Iniciando actualización automática...');
                    this.onSubmit();
                }
            });

        if (this.data.card) {
            this.cardForm.patchValue(this.data.card);
            
            // Cargar el nombre del técnico registro
            if (this.data.card.tecnicoRegistro) {
                this._scrumboardService.getTecnicoById(this.data.card.tecnicoRegistro)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((response: any) => {
                        if (response?.data) {
                            this.tecnicoRegistroNombre = 
                                `${response.data.nombres} ${response.data.apellidos}`.trim();
                        }
                    });
            }
        }
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }


    onSubmit(): void {
        if (this.actualizando) {
            return;
        }

        this.actualizando = true;
        const formData = this.cardForm.getRawValue();
        const updateData = {
            servicios_id: parseInt(this.data.card.id),
            nombreResponsableEgreso: " edit",
            cargoSolicitante: formData.cargoSolicitante || " ",
            informe: formData.informe || "SE ACTIVO EL OFFICE",
            cargoResponsableEgreso: " ",
            oficinaSolicitante: formData.oficina || "SECRETARIA DE DESARROLLO HUMANO",
            fechaRegistro: formData.fechaRegistro || "2020-04-16T12:20:58.420Z",
            equipo: formData.equipo || 1,
            problema: formData.problema || "ACTIVAR OFFICE",
            telefonoResponsableEgreso: " ",
            gestion: 3,
            telefonoSolicitante: formData.telefono || "4460697",
            tecnicoAsignado: formData.tecnicoAsignado ,
            observaciones: formData.observaciones || " ",
            tipoResponsableEgreso: " ",
            estado: formData.estado || "TERMINADO",
            tipoSolicitante: formData.tipoSolicitante || "INDEFINIDO - ITEM",
            fechaTerminado: formData.fechaTerminado || "2020-04-16T12:20:58.420Z",
            oficinaResponsableEgreso: " ",
            numero: 464,
            fechaInicio: formData.fechaInicio || "2020-04-16T12:20:58.420Z",
            fechaEgreso: " ",
            ciSolicitante: formData.carnet || "5676174",
            nombreSolicitante: formData.solicitante || "JASSEL GABRIELA ENCINAS NAVIA",
            tipo: formData.tipoServicio || "ASISTENCIA",
            tecnicoRegistro: formData.tecnicoRegistro ,
            tecnicoEgreso: " ",
            ciResponsableEgreso: " "
        };

        this._scrumboardService.updateService(this.data.card.id, updateData)
            .pipe(delay(700))
            .subscribe({
                next: (response) => {
                    // Notificar la actualización
                    this._scrumboardService.notifyCardUpdate('update', Number(this.data.card.id), this.data.card.listId);
                    
                    this._snackBar.open('Servicio actualizado correctamente', 'Cerrar', {
                        duration: 3000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top',
                        panelClass: ['success-snackbar']
                    });
                    
                    this.actualizando = false;
                    this.cardForm.markAsPristine();
                },
                error: (error) => {
                    console.error('Error en actualización:', error);
                    this._snackBar.open('Error al actualizar el servicio', 'Cerrar', {
                        duration: 3000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top',
                        panelClass: ['error-snackbar']
                    });
                    this.actualizando = false;
                }
            });
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    buscarBien(): void {
        // Aquí implementar la búsqueda del bien
        console.log('Buscando bien...');
        // Cuando se encuentre el bien, actualizar el tipo de hardware
        // this.cardForm.patchValue({ tipoHardware: 'Tipo encontrado' });
    }

    onDelete(): void {
        const dialogRef = this._dialog.open(ConfirmationDialogComponent, {
            data: {
                title: 'Eliminar servicio',
                message: '¿Está seguro de eliminar este servicio?'
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this._scrumboardService.deleteService(this.data.card.id)
                    .subscribe({
                        next: () => {
                            // Notificar la eliminación con el listId
                            this._scrumboardService.notifyCardUpdate('delete', Number(this.data.card.id), this.data.card.listId);
                            
                            this._snackBar.open('Servicio eliminado correctamente', 'Cerrar', {
                                duration: 3000,
                                horizontalPosition: 'end',
                                verticalPosition: 'top',
                                panelClass: ['success-snackbar']
                            });
                            
                            this.dialogRef.close('deleted');
                        },
                        error: (error) => {
                            console.error('Error al eliminar servicio:', error);
                            this._snackBar.open('Error al eliminar el servicio', 'Cerrar', {
                                duration: 3000,
                                horizontalPosition: 'end',
                                verticalPosition: 'top',
                                panelClass: ['error-snackbar']
                            });
                        }
                    });
            }
        });
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        const target = event.target as HTMLElement;
        const isInputClick = target.closest('input') !== null;
        const isTecnicosDropdown = target.closest('.tecnicos-dropdown') !== null;
        const isEquiposDropdown = target.closest('.equipos-dropdown') !== null;
        
        if (!isInputClick) {
            if (!isTecnicosDropdown) {
                this.showTecnicosDropdown = false;
            }
            if (!isEquiposDropdown) {
                this.showEquiposDropdown = false;
            }
            this._changeDetectorRef.detectChanges();
        }
    }

    onSearchEquipos(event: any): void {
        let query = '';
        
        // Manejar tanto el caso cuando recibimos el evento como cuando recibimos el string directamente
        if (typeof event === 'string') {
            query = event;
        } else if (event?.target?.value !== undefined) {
            query = event.target.value;
        }

        // Solo mostrar el dropdown y buscar si hay un query
        if (query.trim() !== '') {
            this.showEquiposDropdown = true;
            
            this._scrumboardService.buscarEquipos(1, 100, query)
                .subscribe({
                    next: (equipos: { equipos_id: number; codigo: string }[]) => {
                        // Filtrar equipos que coincidan con la búsqueda
                        this.filtredEquipos = equipos
                            .filter(equipo => 
                                equipo.codigo && 
                                equipo.codigo.trim() !== '' &&
                                equipo.codigo.toLowerCase().includes(query.toLowerCase())
                            )
                            .reduce((acc, current) => {
                                // Eliminar duplicados
                                const exists = acc.find(item => item.codigo === current.codigo);
                                if (!exists) {
                                    return [...acc, current];
                                }
                                return acc;
                            }, []);

                        this.showEquiposDropdown = this.filtredEquipos.length > 0;
                        this._changeDetectorRef.detectChanges();
                    },
                    error: (err) => {
                        console.error('Error al buscar equipos:', err);
                        this.filtredEquipos = [];
                        this.showEquiposDropdown = false;
                        this._changeDetectorRef.detectChanges();
                    },
                });
        } else {
            this.filtredEquipos = [];
            this.showEquiposDropdown = false;
            this._changeDetectorRef.detectChanges();
        }
    }

    onEquipoSelected(event: MatAutocompleteSelectedEvent): void {
        const equipo = event.option.value as Equipo;
        console.log('Equipo seleccionado:', equipo);
        this.selectEquipo(equipo);
    }

    selectEquipo(equipo: { equipos_id: number; codigo: string }): void {
        this.cardForm.controls['equipo'].setValue(equipo.equipos_id); // Guarda el ID del equipo
        this.searchEquipoCtrl.setValue(equipo.codigo, { emitEvent: false }); // Evitar que se dispare la búsqueda
        this.showEquiposDropdown = false;
        
        // Obtener información del bien después de seleccionar
        if (equipo.codigo) {
            this._scrumboardService.getBienes(equipo.codigo)
                .subscribe({
                    next: (response) => {
                        this.bienes = response;
                        // Forzar la actualización después de obtener los bienes
                        this.onSubmit();
                    },
                    error: (err) => {
                        console.error('Error al obtener bienes:', err);
                        this.bienes = null;
                    }
                });
        }
        
        this._changeDetectorRef.detectChanges();
    }

    displayFn = (equipo: Equipo): string => {
        return equipo ? equipo.codigo : '';
    }

    getBienes(): void {
        const codigoBienes = this.searchEquipoCtrl.value;
        if (codigoBienes) {
            this._scrumboardService.getBienes(codigoBienes)
                .subscribe({
                    next: (response) => {
                        this.bienes = response;
                        console.log('Bienes encontrados:', this.bienes);
                    },
                    error: (err) => {
                        console.error('Error al obtener bienes:', err);
                        this.bienes = null;
                    }
            });
        }
    }

    // Agregar método para manejar el focus
    onFocus(): void {
        // Mostrar todos los equipos al hacer focus
        this._scrumboardService.buscarEquipos(1, 100, '')
            .subscribe({
                next: (equipos: { equipos_id: number; codigo: string }[]) => {
                    this.filtredEquipos = equipos.filter(equipo => 
                        equipo.codigo && equipo.codigo.trim() !== ''
                    );
                    this.showEquiposDropdown = this.filtredEquipos.length > 0;
                    this._changeDetectorRef.detectChanges();
                },
                error: (err) => {
                    console.error('Error al buscar equipos:', err);
                    this.filtredEquipos = [];
                    this.showEquiposDropdown = false;
                    this._changeDetectorRef.detectChanges();
                }
            });
    }

    onTecnicoFilterChange(tecnicoId: string): void {
        // Actualizar el valor en el formulario
        this.cardForm.patchValue({
            tecnicoAsignado: tecnicoId
        });

        const updateData = {
            ...this.cardForm.getRawValue(),
            tecnicoAsignado: tecnicoId
        };

        this._scrumboardService.updateService(this.data.card.id, updateData)
            .subscribe({
                next: () => {
                    this._snackBar.open('Técnico asignado correctamente', 'Cerrar', {
                        duration: 3000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top',
                        panelClass: ['success-snackbar']
                    });
                    this._scrumboardService.notifyCardUpdate('update', Number(this.data.card.id), this.data.card.listId);
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

    getSelectedTecnicoDisplay(): string {
        const selectedTecnico = this.tecnicos.find(t => t.id === this.cardForm.get('tecnicoAsignado').value);
        return selectedTecnico ? selectedTecnico.nombre : 'Sin asignar';
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
            t.id === this.cardForm.get('tecnicoAsignado').value
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

    private loadImage(url: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });
    }

    private async generarPDFCompleto(): Promise<jsPDFWithPlugin> {
        if (!this.data.card) {
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

            // Obtener el nombre del técnico asignado
            const tecnicoAsignado = this.tecnicos.find(t => t.id === this.data.card.tecnicoAsignado)?.nombre || 'Sin asignar';

            // Formatear las fechas
            const fechaRegistro = this.data.card.fechaRegistro ? new Date(this.data.card.fechaRegistro).toLocaleDateString() : 'N/A';
            const fechaInicio = this.data.card.fechaInicio ? new Date(this.data.card.fechaInicio).toLocaleDateString() : 'N/A';
            const fechaTerminado = this.data.card.fechaTerminado ? new Date(this.data.card.fechaTerminado).toLocaleDateString() : 'N/A';

            // Información del servicio
            const data = [
                ['ID Servicio', this.data.card.id || 'N/A'],
                ['Nombre Solicitante', this.data.card.nombreSolicitante || 'N/A'],
                ['Carnet', this.data.card.carnet || 'N/A'],
                ['Cargo', this.data.card.cargo || 'N/A'],
                ['Tipo de Solicitante', this.data.card.tipoSolicitante || 'N/A'],
                ['Oficina', this.data.card.oficinaSolicitante || 'N/A'],
                ['Teléfono', this.data.card.telefonoSolicitante || 'N/A'],
                ['Tipo de Servicio', this.data.card.tipo || 'N/A'],
                ['Estado', this.data.card.estado || 'N/A'],
                ['Técnico Asignado', tecnicoAsignado],
                ['Técnico Registro', this.tecnicoRegistroNombre || 'N/A'],
                ['Fecha de Registro', fechaRegistro],
                ['Fecha de Inicio', fechaInicio],
                ['Fecha de Término', fechaTerminado],
                ['Problema', this.data.card.problema || 'N/A'],
                ['Observaciones', this.data.card.observacionesProblema || 'N/A'],
                ['Informe', this.data.card.informe || 'N/A']
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
                    ['Marca', this.bienes.data.caracteristicas?.MARCA || 'N/A'],
                    ['Modelo', this.bienes.data.caracteristicas?.MODELO || 'N/A'],
                    ['Serie', this.bienes.data.caracteristicas?.SERIE || 'N/A']
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
            link.download = `servicio_${this.data.card.id}_${new Date().toISOString().split('T')[0]}.pdf`;
            
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
}

