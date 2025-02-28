import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { 
    NotificacionPush, 
    FiltroNotificacion, 
    DestinatarioNotificacion 
} from '../tasks.types';
import { TasksService } from '../tasks.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, DateAdapter } from '@angular/material/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as moment from 'moment';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmacionModalComponent } from '../notificacion-modal/notificacion-modal.component';

// Registrar el locale español
registerLocaleData(localeEs);

// Actualizar el formato de fecha
export const MY_DATE_FORMATS = {
    parse: {
        dateInput: 'DD/MM/YYYY',
    },
    display: {
        dateInput: 'DD/MM/YYYY',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
    },
};

@Component({
    selector: 'tasks-list',
    templateUrl: './list.component.html',
    standalone: true,
    providers: [
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_LOCALE, useValue: 'es' },
        { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }
    ],
    imports: [
        CommonModule,
        MatSidenavModule,
        MatSelectModule,
        FormsModule,
        MatSnackBarModule,
        MatIconModule,
        MatButtonModule,
        HttpClientModule,
        MatExpansionModule,
        MatButtonToggleModule,
        MatCheckboxModule,
        MatSlideToggleModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatFormFieldModule,
        MatInputModule,
        MatDialogModule,
        ConfirmacionModalComponent
    ]
})
export class TasksListComponent implements OnInit {
    @ViewChild('matDrawer', {static: true}) matDrawer: MatDrawer;
    @ViewChild('fileInput') fileInput: ElementRef;

    // Propiedades de notificación
    notificacionForm = {
        titulo: '',
        mensaje: '',
        imagen: '',
        nombreNotificacion: '',
        roles: [],
        unidades: [],
        estados: [],
        tipos: [],
        programarEnvio: false,
        fechaProgramada: null,
        horaProgramada: '',
        tipoProgramacion: 'unica',
        frecuencia: 'diaria',
        diasSeleccionados: {
            lunes: false,
            martes: false,
            miercoles: false,
            jueves: false,
            viernes: false,
            sabado: false,
            domingo: false
        },
        horaRecurrente: '',
        fechaInicio: null,
        fechaFin: null
    };

    vistaPrevia: 'inicial' | 'expandida' = 'inicial';
    destinatariosPreview: DestinatarioNotificacion[] = [];

    rolesDisponibles = [
        { value: 'admin', label: 'Administrador' },
        { value: 'tecnico', label: 'Técnico' },
        { value: 'usuario', label: 'Usuario' }
    ];

    unidadesDisponibles = [
        'Sistemas', 
        'Soporte', 
        'Infraestructura', 
        'Recursos Humanos'
    ];

    estadosDisponibles = [
        'Pendiente', 
        'En Proceso', 
        'Completado'
    ];

    tiposDisponibles = [
        'Mantenimiento', 
        'Soporte', 
        'Consultoría'
    ];

    // Añadir nueva propiedad para tipo de envío
    tipoEnvio: 'individual' | 'grupo' | 'todos' = 'todos';

    // Tipos de envío disponibles
    tiposEnvio = [
        { value: 'individual', label: 'Individual' },
        { value: 'grupo', label: 'Grupo Específico' },
        { value: 'todos', label: 'Todos los Usuarios' }
    ];

    minDate = new Date(); // Fecha mínima para el datepicker (hoy)

    // Agregar array de días de la semana
    diasSemana = [
        { nombre: 'Lunes', valor: 'lunes' },
        { nombre: 'Martes', valor: 'martes' },
        { nombre: 'Miércoles', valor: 'miercoles' },
        { nombre: 'Jueves', valor: 'jueves' },
        { nombre: 'Viernes', valor: 'viernes' },
        { nombre: 'Sábado', valor: 'sabado' },
        { nombre: 'Domingo', valor: 'domingo' }
    ];

    // Array de horas para el desplegable con todos los intervalos de 15 minutos
    horasDisponibles: string[] = [
        // AM
        '12:00 am', '12:15 am', '12:30 am', '12:45 am',
        '1:00 am', '1:15 am', '1:30 am', '1:45 am',
        '2:00 am', '2:15 am', '2:30 am', '2:45 am',
        '3:00 am', '3:15 am', '3:30 am', '3:45 am',
        '4:00 am', '4:15 am', '4:30 am', '4:45 am',
        '5:00 am', '5:15 am', '5:30 am', '5:45 am',
        '6:00 am', '6:15 am', '6:30 am', '6:45 am',
        '7:00 am', '7:15 am', '7:30 am', '7:45 am',
        '8:00 am', '8:15 am', '8:30 am', '8:45 am',
        '9:00 am', '9:15 am', '9:30 am', '9:45 am',
        '10:00 am', '10:15 am', '10:30 am', '10:45 am',
        '11:00 am', '11:15 am', '11:30 am', '11:45 am',

        // PM
        '12:00 pm', '12:15 pm', '12:30 pm', '12:45 pm',
        '1:00 pm', '1:15 pm', '1:30 pm', '1:45 pm',
        '2:00 pm', '2:15 pm', '2:30 pm', '2:45 pm',
        '3:00 pm', '3:15 pm', '3:30 pm', '3:45 pm',
        '4:00 pm', '4:15 pm', '4:30 pm', '4:45 pm',
        '5:00 pm', '5:15 pm', '5:30 pm', '5:45 pm',
        '6:00 pm', '6:15 pm', '6:30 pm', '6:45 pm',
        '7:00 pm', '7:15 pm', '7:30 pm', '7:45 pm',
        '8:00 pm', '8:15 pm', '8:30 pm', '8:45 pm',
        '9:00 pm', '9:15 pm', '9:30 pm', '9:45 pm',
        '10:00 pm', '10:15 pm', '10:30 pm', '10:45 pm',
        '11:00 pm', '11:15 pm', '11:30 pm', '11:45 pm'
    ];

    constructor(
        private _tasksService: TasksService,
        private _snackBar: MatSnackBar,
        private _http: HttpClient,
        private _dialog: MatDialog
    ) {}

    ngOnInit(): void {
        // Optional: Add any initialization logic if needed
    }

    // Métodos de notificación
    cambiarVistaPrevia(vista: 'inicial' | 'expandida') {
        this.vistaPrevia = vista;
    }

    // Método para cambiar tipo de envío
    cambiarTipoEnvio(tipo: 'individual' | 'grupo' | 'todos') {
        this.tipoEnvio = tipo;
        
        // Limpiar filtros si no es grupo
        if (tipo !== 'grupo') {
            this.notificacionForm.roles = [];
            this.notificacionForm.unidades = [];
            this.notificacionForm.estados = [];
            this.notificacionForm.tipos = [];
        }
    }

    // Método de validación considerando el tipo de envío
    validarFormularioNotificacion(): boolean {
        // Validación base
        const validacionBase = !!(this.notificacionForm.titulo && this.notificacionForm.mensaje);

        // Validación adicional para envío por grupo
        if (this.tipoEnvio === 'grupo') {
            return validacionBase && 
                   (this.notificacionForm.roles.length > 0 || 
                    this.notificacionForm.unidades.length > 0 || 
                    this.notificacionForm.estados.length > 0 || 
                    this.notificacionForm.tipos.length > 0);
        }

        return validacionBase;
    }

    previsualizarDestinatarios() {
        // Abrir modal de confirmación
        const dialogRef = this._dialog.open(ConfirmacionModalComponent, {
            width: '400px',
            data: {
                esEnvioProgramado: this.notificacionForm.programarEnvio
            }
        });

        dialogRef.afterClosed().subscribe(resultado => {
            if (resultado) {
                // Verificar la contraseña con el servicio de autenticación
                this.validarYEnviarNotificacion(resultado);
            }
        });
    }

    validarYEnviarNotificacion(contrasena: string) {
        // Llamar al servicio de autenticación para validar contraseña
        this._tasksService.validarContrasena(contrasena).subscribe({
            next: (esValida) => {
                if (esValida) {
                    // Si la contraseña es válida, proceder con el envío
                    this.enviarNotificacion();
                } else {
                    // Mostrar error si la contraseña es incorrecta
                    this._snackBar.open('Contraseña incorrecta', 'Cerrar', { duration: 3000 });
                }
            },
            error: (error) => {
                this._snackBar.open('Error al validar contraseña', 'Cerrar', { duration: 3000 });
            }
        });
    }

    enviarNotificacion() {
        let fechaProgramada = null;

        if (this.notificacionForm.programarEnvio) {
            if (this.notificacionForm.tipoProgramacion === 'unica') {
                fechaProgramada = this.combinarFechaHora(
                    this.notificacionForm.fechaProgramada,
                    this.notificacionForm.horaProgramada
                );
            } else {
                // Aquí manejarías la lógica para programación recurrente
                // Podrías enviar los datos de recurrencia al backend
                fechaProgramada = {
                    tipo: 'recurrente',
                    frecuencia: this.notificacionForm.frecuencia,
                    hora: this.notificacionForm.horaRecurrente,
                    fechaInicio: this.notificacionForm.fechaInicio,
                    fechaFin: this.notificacionForm.fechaFin,
                    diasSemana: this.notificacionForm.frecuencia === 'semanal' 
                        ? this.notificacionForm.diasSeleccionados 
                        : null
                };
            }
        }

        const notificacion: NotificacionPush = {
            titulo: this.notificacionForm.titulo,
            mensaje: this.notificacionForm.mensaje,
            imagen: this.notificacionForm.imagen,
            nombreNotificacion: this.notificacionForm.nombreNotificacion,
            fechaCreacion: new Date(),
            fechaProgramada: fechaProgramada,
            tipoEnvio: 'grupo',
            destinatarios: this.destinatariosPreview.map(d => ({
                usuarioId: d.id,
                estado: fechaProgramada ? 'programada' : 'enviada'
            }))
        };

        this._tasksService.enviarNotificacionPush(notificacion)
            .subscribe({
                next: (respuesta) => {
                    this._snackBar.open('Notificación enviada exitosamente', 'Cerrar', { duration: 3000 });
                    this.cancelarNotificacion();
                },
                error: (error) => {
                    this._snackBar.open('Error al enviar notificación', 'Cerrar', { duration: 3000 });
                }
            });
    }

    cancelarNotificacion() {
        this.notificacionForm = {
            titulo: '',
            mensaje: '',
            imagen: '',
            nombreNotificacion: '',
            roles: [],
            unidades: [],
            estados: [],
            tipos: [],
            programarEnvio: false,
            fechaProgramada: null,
            horaProgramada: '',
            tipoProgramacion: 'unica',
            frecuencia: 'diaria',
            diasSeleccionados: {
                lunes: false,
                martes: false,
                miercoles: false,
                jueves: false,
                viernes: false,
                sabado: false,
                domingo: false
            },
            horaRecurrente: '',
            fechaInicio: null,
            fechaFin: null
        };
        this.destinatariosPreview = [];
    }

    enviarMensajePrueba() {
        // Implementa la lógica para enviar un mensaje de prueba
        this._snackBar.open('Mensaje de prueba enviado', 'Cerrar', { duration: 3000 });
    }

    get notificationTitle(): string {
        return this.notificacionForm.titulo || 'Notification Title';
    }

    get notificationText(): string {
        return this.notificacionForm.mensaje || 'Notification Text';
    }

    // Método para manejar la selección de archivos
    onFileSelected(event: any) {
        const file: File = event.target.files[0];
        
        if (file) {
            // Validar tipo y tamaño de imagen
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
            const maxSize = 5 * 1024 * 1024; // 5MB

            if (!allowedTypes.includes(file.type)) {
                this._snackBar.open('Tipo de archivo no permitido', 'Cerrar', { duration: 3000 });
                return;
            }

            if (file.size > maxSize) {
                this._snackBar.open('El archivo es demasiado grande', 'Cerrar', { duration: 3000 });
                return;
            }

            // Crear URL temporal para previsualización
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.notificacionForm.imagen = e.target.result;
            };
            reader.readAsDataURL(file);

            // Opcional: Subir imagen al servidor
            this.subirImagen(file);
        }
    }

    // Método para subir imagen al servidor
    subirImagen(file: File) {
        const formData = new FormData();
        formData.append('imagen', file);

        this._tasksService.subirImagenNotificacion(formData)
            .subscribe({
                next: (respuesta: any) => {
                    // Actualizar URL de imagen si el servidor devuelve una URL
                    if (respuesta.url) {
                        this.notificacionForm.imagen = respuesta.url;
                    }
            },
            error: (error) => {
                    this._snackBar.open('Error al subir imagen', 'Cerrar', { duration: 3000 });
            }
        });
    }

    // Método para abrir selector de archivos
    triggerFileInput() {
        this.fileInput.nativeElement.click();
    }

    // Método para eliminar imagen
    eliminarImagen() {
        this.notificacionForm.imagen = '';
    }

    // Método auxiliar para combinar fecha y hora
    private combinarFechaHora(fecha: Date, hora: string): Date {
        if (!fecha || !hora) return null;

        const [horas, minutos] = hora.split(':').map(Number);
        const fechaCompleta = new Date(fecha);
        fechaCompleta.setHours(horas, minutos, 0);
        
        return fechaCompleta;
    }

    // Método para manejar cambios en la programación
    onProgramacionChange() {
        if (!this.notificacionForm.programarEnvio) {
            // Resetear valores si se desactiva la programación
            this.notificacionForm.fechaProgramada = null;
            this.notificacionForm.horaProgramada = '';
            this.notificacionForm.tipoProgramacion = 'unica';
            this.notificacionForm.frecuencia = 'diaria';
            this.notificacionForm.diasSeleccionados = {
                lunes: false,
                martes: false,
                miercoles: false,
                jueves: false,
                viernes: false,
                sabado: false,
                domingo: false
            };
            this.notificacionForm.horaRecurrente = '';
            this.notificacionForm.fechaInicio = null;
            this.notificacionForm.fechaFin = null;
        }
    }

    // Método para validar la programación
    validarProgramacion(): boolean {
        if (!this.notificacionForm.programarEnvio) {
            return true;
        }

        if (this.notificacionForm.tipoProgramacion === 'unica') {
            return !!(this.notificacionForm.fechaProgramada && this.notificacionForm.horaProgramada);
        }

        // Validación para programación recurrente
        if (this.notificacionForm.tipoProgramacion === 'recurrente') {
            const tieneHora = !!this.notificacionForm.horaRecurrente;
            const tieneFechaInicio = !!this.notificacionForm.fechaInicio;
            
            if (this.notificacionForm.frecuencia === 'semanal') {
                const tieneDiasSeleccionados = Object.values(this.notificacionForm.diasSeleccionados).some(v => v);
                return tieneHora && tieneFechaInicio && tieneDiasSeleccionados;
            }

            return tieneHora && tieneFechaInicio;
        }

        return false;
    }

    // Método para formatear la hora
    formatTime(event: any) {
        const input = event.target;
        let value = input.value.replace(/\D/g, '');
        
        if (value.length > 4) {
            value = value.substr(0, 4);
        }
        
        if (value.length >= 2) {
            const hours = parseInt(value.substr(0, 2));
            if (hours > 23) {
                value = '23' + value.substr(2);
            }
            
            if (value.length >= 4) {
                const minutes = parseInt(value.substr(2));
                if (minutes > 59) {
                    value = value.substr(0, 2) + '59';
                }
            }
            
            value = value.substr(0, 2) + ':' + value.substr(2);
        }
        
        this.notificacionForm.horaProgramada = value;
    }

    // Método para seleccionar hora desde el desplegable
    seleccionarHora(hora: string) {
        this.notificacionForm.horaProgramada = hora;
    }
}
