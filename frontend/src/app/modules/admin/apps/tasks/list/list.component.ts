import { Component, OnInit, ViewChild } from '@angular/core';
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
        MatButtonModule
    ]
})
export class TasksListComponent implements OnInit {
    @ViewChild('matDrawer', {static: true}) matDrawer: MatDrawer;

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

    constructor(
        private _tasksService: TasksService,
        private _snackBar: MatSnackBar
    ) {}

    ngOnInit(): void {
        // Optional: Add any initialization logic if needed
    }

    // Métodos de notificación
    cambiarVistaPrevia(vista: 'inicial' | 'expandida') {
        this.vistaPrevia = vista;
    }

    validarFormularioNotificacion(): boolean {
        return !!(this.notificacionForm.titulo && this.notificacionForm.mensaje);
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
}
