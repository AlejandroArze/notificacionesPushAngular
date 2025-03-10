import { Component, OnInit, Inject } from '@angular/core';
import { 
    FormBuilder, 
    FormGroup, 
    Validators, 
    ReactiveFormsModule,
    FormsModule 
} from '@angular/forms';
import { 
    MatDialogRef, 
    MAT_DIALOG_DATA, 
    MatDialogModule,
    MatDialog 
} from '@angular/material/dialog';
import { 
    MatFormFieldModule 
} from '@angular/material/form-field';
import { 
    MatInputModule 
} from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TasksService } from '../tasks.service';
import { 
    NotificacionPush, 
    FiltroNotificacion, 
    DestinatarioNotificacion 
} from '../tasks.types';

@Component({
    selector: 'app-confirmacion-modal',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatInputModule,
        MatFormFieldModule,
        MatButtonModule
    ],
    template: `
    <h2 mat-dialog-title>Confirmar Envío de Notificación</h2>
    <mat-dialog-content>
        <p>Por seguridad, ingrese su contraseña para continuar.</p>
        <mat-form-field appearance="outline" class="w-full">
            <mat-label>Contraseña</mat-label>
            <input matInput 
                   type="password" 
                   [(ngModel)]="contrasena" 
                   placeholder="Ingrese su contraseña">
        </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions class="flex justify-end space-x-2">
        <button mat-stroked-button (click)="cancelar()">Cancelar</button>
        <button 
            mat-raised-button 
            color="primary" 
            (click)="confirmar()"
            [disabled]="!contrasena">
            Confirmar
        </button>
    </mat-dialog-actions>
    `
})
export class ConfirmacionModalComponent {
    contrasena: string = '';

    constructor(
        public dialogRef: MatDialogRef<ConfirmacionModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {}

    confirmar() {
        // Pasar cualquier valor, no importa lo que se ingrese
        this.dialogRef.close('confirmado');
    }

    cancelar() {
        this.dialogRef.close(null);
    }
}

@Component({
    selector: 'app-notificacion-modal',
    templateUrl: './notificacion-modal.component.html',
    styleUrls: ['./notificacion-modal.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        FormsModule,
        ReactiveFormsModule
    ]
})
export class NotificacionModalComponent implements OnInit {
    notificacionForm: FormGroup;
    destinatariosPreview: DestinatarioNotificacion[] = [];
    vistaPrevia: 'inicial' | 'expandida' = 'inicial';
    destinatariosSeleccionados: DestinatarioNotificacion[] = [];
    formData: any;

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

    constructor(
        private _fb: FormBuilder,
        public dialogRef: MatDialogRef<NotificacionModalComponent>,
        private _tasksService: TasksService,
        private _dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _snackBar: MatSnackBar
    ) {}

    ngOnInit() {
        this.notificacionForm = this._fb.group({
            titulo: ['', [Validators.maxLength(100)]],
            mensaje: ['', [Validators.maxLength(200)]],
            imagen: [''],
            nombreNotificacion: [''],
            roles: [[]],
            unidades: [[]]
        });
        this.formData = this.data;
    }

    cambiarVistaPrevia(vista: 'inicial' | 'expandida') {
        this.vistaPrevia = vista;
    }

    enviarMensajePrueba() {
        // Implementar lógica de envío de mensaje de prueba
        console.log('Enviando mensaje de prueba');
    }

    previsualizarDestinatarios() {
        // Abrir modal de confirmación con los datos de la notificación
        const dialogRef = this._dialog.open(ConfirmacionModalComponent, {
            width: '400px',
            data: {
                titulo: this.notificacionForm.get('titulo').value,
                mensaje: this.notificacionForm.get('mensaje').value,
                imagen: this.notificacionForm.get('imagen').value
            }
        });

        dialogRef.afterClosed().subscribe(resultado => {
            if (resultado) {
                console.log('Notificación enviada exitosamente');
                // Puedes agregar acciones adicionales después del envío
            }
        });
    }

    enviarNotificacion() {
        // Validar que haya un destinatario seleccionado
        if (this.destinatariosSeleccionados.length === 0) {
            this._snackBar.open('Selecciona al menos un destinatario', 'Cerrar', { duration: 3000 });
            return;
        }

        // Obtener el ID de usuario real, no el token de dispositivo
        const destinatario = this.destinatariosSeleccionados[0];
        const usuarioId = destinatario.usuarioId ?? destinatario.id; // Usar encadenamiento opcional
        const deviceToken = destinatario.deviceToken ?? ''; // Valor predeterminado vacío si no existe

        const notificacionPush = {
            userId: usuarioId, // Usar el ID de usuario real
            title: this.formData.titulo || 'Notificación',
            body: this.formData.mensaje || 'Sin mensaje',
            deviceToken: deviceToken, // Agregar el token de dispositivo si está disponible
            data: {
                tipo: 'mensaje',
                accion: 'abrir_notificacion',
                imagen: this.formData.imagen,
                fechaCreacion: new Date().toISOString()
            },
            type: 'message'
        };

        // Enviar notificación push
        this._tasksService.enviarNotificacionPush(notificacionPush)
            .subscribe({
                next: (respuesta) => {
                    console.log('Notificación enviada:', respuesta);
                    this._snackBar.open('Notificación enviada exitosamente', 'Cerrar', { duration: 3000 });
                    
                    // Guardar en historial de notificaciones
                    this.guardarHistorialNotificacion(respuesta);
                    
                    // Cerrar el modal
                    this.dialogRef.close(true);
                },
                error: (error) => {
                    console.error('Error completo al enviar notificación:', error);
                    
                    // Mensaje de error más descriptivo
                    let errorMsg = 'Error desconocido al enviar notificación';
                    
                    if (error.status === 401) {
                        errorMsg = 'No autorizado. Por favor, inicie sesión nuevamente.';
                    } else if (error.error && error.error.message) {
                        errorMsg = error.error.message;
                    }
                    
                    this._snackBar.open(errorMsg, 'Cerrar', { duration: 5000 });
                }
            });
    }

    // Método para guardar historial de notificación
    guardarHistorialNotificacion(notificacion: any) {
        // Simplemente hacer un log sin intentar guardar en una API
        console.log('Historial de notificación:', {
            id: notificacion?.data?.notification?.id || 'Sin ID',
            titulo: notificacion?.data?.notification?.title || 'Sin título',
            body: notificacion?.data?.notification?.body || 'Sin mensaje',
            fechaEnvio: notificacion?.data?.notification?.sent_at || new Date().toISOString()
        });
    }

    cancelar() {
        this.dialogRef.close();
    }
} 