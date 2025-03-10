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
import { MatListModule } from '@angular/material/list';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

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

// Modificar la interfaz de usuario
interface UsuarioSeleccionable {
    id: number;
    nombre: string;
    carnet: string;
    user_id?: number; // Añadir user_id
}

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
        ConfirmacionModalComponent,
        MatListModule,
        MatAutocompleteModule
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

    // Datos de ejemplo de usuarios
    usuariosDisponibles: UsuarioSeleccionable[] = [
        { id: 1, nombre: 'Juan Pérez', carnet: 'JP001' },
        { id: 2, nombre: 'María González', carnet: 'MG002' },
        { id: 3, nombre: 'Carlos Rodríguez', carnet: 'CR003' },
        { id: 4, nombre: 'Ana Martínez', carnet: 'AM004' },
        { id: 5, nombre: 'Luis Fernández', carnet: 'LF005' },
        { id: 6, nombre: 'Elena Sánchez', carnet: 'ES006' },
        { id: 7, nombre: 'Pedro Ramírez', carnet: 'PR007' },
        { id: 8, nombre: 'Laura Torres', carnet: 'LT008' },
        { id: 9, nombre: 'Miguel Hernández', carnet: 'MH009' },
        { id: 10, nombre: 'Sofía Díaz', carnet: 'SD010' }
    ];

    // Usuarios filtrados para búsqueda
    usuariosFiltradosPorNombre: UsuarioSeleccionable[] = [];
    usuariosFiltradosPorCarnet: UsuarioSeleccionable[] = [];

    // Propiedades para mantener los valores de búsqueda
    usuarioBusquedaNombre: string = '';
    usuarioBusquedaCarnet: string = '';

    // Propiedades para almacenar el usuario seleccionado
    usuarioSeleccionado: UsuarioSeleccionable | null = null;

    // Nueva propiedad para el usuario que envía la notificación
    usuarioEnvio = {
        id: '',
        nombre: ''
    };

    constructor(
        private _tasksService: TasksService,
        private _snackBar: MatSnackBar,
        private _http: HttpClient,
        private _dialog: MatDialog
    ) {}

    ngOnInit(): void {
        // Obtener información del usuario desde localStorage
        this.cargarUsuarioActual();
    }

    cargarUsuarioActual() {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const userData = JSON.parse(userStr);
                this.usuarioEnvio = {
                    id: userData.data.usuarios_id, // Ajusta según la estructura de tu localStorage
                    nombre: `${userData.data.nombres} ${userData.data.apellidos}`.trim()
                };
            } catch (error) {
                console.error('Error al parsear datos de usuario', error);
                this._snackBar.open('No se pudo cargar la información del usuario', 'Cerrar', { duration: 3000 });
            }
        }
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
        // Verificar que se haya seleccionado un usuario
        if (!this.usuarioSeleccionado) {
            this._snackBar.open('Selecciona un usuario', 'Cerrar', { duration: 3000 });
            return;
        }

        // Verificar que los campos de notificación estén completos
        if (!this.notificacionForm.titulo || !this.notificacionForm.mensaje) {
            this._snackBar.open('Completa el título y el mensaje', 'Cerrar', { duration: 3000 });
            return;
        }

        // Crear notificación con el ID del usuario seleccionado
        const notificacionPush = {
            userId: this.usuarioSeleccionado.id, // Usar el ID del usuario seleccionado
            title: this.notificacionForm.titulo || 'Notificación',
            body: this.notificacionForm.mensaje || 'Sin mensaje',
            data: {
                tipo: 'mensaje',
                accion: 'abrir_notificacion'
            },
            type: 'message'
        };

        // Log adicional justo antes de enviar
        console.group('Enviando Notificación');
        console.log('Datos de notificación:', notificacionPush);
        console.groupEnd();

        // Enviar notificación push
        this._tasksService.enviarNotificacionPush(notificacionPush)
            .subscribe({
                next: (respuesta) => {
                    console.log('Notificación enviada:', respuesta);
                    this._snackBar.open('Notificación enviada exitosamente', 'Cerrar', { duration: 3000 });
                    
                    // Guardar en historial de notificaciones
                    this.guardarHistorialNotificacion(respuesta?.data?.notification || respuesta);
                    
                    // Limpiar formulario
                    this.cancelarNotificacion();
                },
                error: (error) => {
                    console.error('Error al enviar notificación:', error);
                    this._snackBar.open('Error al enviar notificación', 'Cerrar', { duration: 3000 });
                }
            });
    }

    // Método de guardado de historial más robusto
    guardarHistorialNotificacion(notificacion: any) {
        // Simplemente hacer un log sin intentar guardar en una API
        console.log('Historial de notificación:', {
            id: notificacion?.data?.notification?.id || 'Sin ID',
            titulo: notificacion?.data?.notification?.title || 'Sin título',
            body: notificacion?.data?.notification?.body || 'Sin mensaje',
            fechaEnvio: notificacion?.data?.notification?.sent_at || new Date().toISOString()
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

    // Métodos de búsqueda y selección
    filtrarUsuariosPorNombre(termino: string) {
        if (!termino) {
            this.usuariosFiltradosPorNombre = [];
            return;
        }
        
        // Llamar a la API de búsqueda con parámetro de nombre
        this._tasksService.buscarUsuarios({ nombres: termino })
            .subscribe({
                next: (respuesta) => {
                    // Mapear la respuesta de la API a UsuarioSeleccionable
                    this.usuariosFiltradosPorNombre = respuesta.data.map(usuario => ({
                        id: usuario.id,
                        nombre: `${usuario.nombres} ${usuario.paterno} ${usuario.materno}`.trim(),
                        carnet: usuario.nro_documento, // Usar número de documento como carnet
                        user_id: usuario.user_id
                    }));
                },
                error: (error) => {
                    console.error('Error al buscar usuarios por nombre', error);
                    this._snackBar.open('Error al buscar usuarios', 'Cerrar', { duration: 3000 });
                }
            });
    }

    filtrarUsuariosPorCarnet(termino: string) {
        if (!termino) {
            this.usuariosFiltradosPorCarnet = [];
            return;
        }
        
        // Llamar a la API de búsqueda con parámetro de número de documento
        this._tasksService.buscarUsuarios({ nro_documento: termino })
            .subscribe({
                next: (respuesta) => {
                    // Mapear la respuesta de la API a UsuarioSeleccionable
                    this.usuariosFiltradosPorCarnet = respuesta.data.map(usuario => ({
                        id: usuario.id,
                        nombre: `${usuario.nombres} ${usuario.paterno} ${usuario.materno}`.trim(),
                        carnet: usuario.nro_documento,
                        user_id: usuario.user_id
                    }));
                },
                error: (error) => {
                    console.error('Error al buscar usuarios por carnet', error);
                    this._snackBar.open('Error al buscar usuarios', 'Cerrar', { duration: 3000 });
                }
            });
    }

    // Método para seleccionar usuario
    seleccionarUsuario(usuario: UsuarioSeleccionable) {
        // Actualizar ambos campos de búsqueda
        this.usuarioBusquedaNombre = usuario.nombre;
        this.usuarioBusquedaCarnet = usuario.carnet;

        // Almacenar usuario seleccionado
        this.usuarioSeleccionado = usuario;

        // Actualizar lista de destinatarios
        this.destinatariosPreview = [{
            id: Number(usuario.id),
            nombre: usuario.nombre,
            rol: 'usuario',
            unidad: 'General'
        }];

        // Limpiar listas de filtrados
        this.usuariosFiltradosPorNombre = [];
        this.usuariosFiltradosPorCarnet = [];
    }

    // Método para manejar cambios en el campo de nombre
    onNombreChange() {
        // Filtrar usuarios por nombre
        this.filtrarUsuariosPorNombre(this.usuarioBusquedaNombre);
        
        // Si hay solo un resultado, seleccionarlo automáticamente
        if (this.usuariosFiltradosPorNombre.length === 1) {
            this.seleccionarUsuario(this.usuariosFiltradosPorNombre[0]);
        }
    }

    // Método para manejar cambios en el campo de carnet
    onCarnetChange() {
        // Filtrar usuarios por carnet
        this.filtrarUsuariosPorCarnet(this.usuarioBusquedaCarnet);
        
        // Si hay solo un resultado, seleccionarlo automáticamente
        if (this.usuariosFiltradosPorCarnet.length === 1) {
            this.seleccionarUsuario(this.usuariosFiltradosPorCarnet[0]);
        }
    }

    abrirModalConfirmacion() {
        const dialogRef = this._dialog.open(ConfirmacionModalComponent, {
            width: '350px',
            data: {
                titulo: 'Confirmar Envío de Notificación',
                mensaje: '¿Estás seguro de enviar esta notificación?'
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            // Enviar la notificación sin importar el valor de result
            if (result !== null) {
                this.validarYEnviarNotificacion('cualquier_valor');
            }
        });
    }
}
