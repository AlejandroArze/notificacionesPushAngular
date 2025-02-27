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

@Component({
    selector: 'tasks-list',
    templateUrl: './list.component.html',
    standalone: true,
    imports: [
        CommonModule,
        MatSidenavModule,
        MatSelectModule,
        FormsModule,
        MatSnackBarModule,
        MatIconModule,
        MatButtonModule,
        HttpClientModule
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
        tipos: []
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

    constructor(
        private _tasksService: TasksService,
        private _snackBar: MatSnackBar,
        private _http: HttpClient
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
        const filtros: FiltroNotificacion = {
            roles: this.notificacionForm.roles,
            unidades: this.notificacionForm.unidades,
            estados: this.notificacionForm.estados,
            tipos: this.notificacionForm.tipos
        };

        this._tasksService.obtenerDestinatarios(filtros)
            .subscribe(destinatarios => {
                this.destinatariosPreview = destinatarios;
                this.enviarNotificacion();
            });
    }

    enviarNotificacion() {
        const notificacion: NotificacionPush = {
            titulo: this.notificacionForm.titulo,
            mensaje: this.notificacionForm.mensaje,
            imagen: this.notificacionForm.imagen,
            nombreNotificacion: this.notificacionForm.nombreNotificacion,
            fechaCreacion: new Date(),
            tipoEnvio: 'grupo',
            destinatarios: this.destinatariosPreview.map(d => ({
                usuarioId: d.id,
                estado: 'enviada'
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
            tipos: []
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
}
