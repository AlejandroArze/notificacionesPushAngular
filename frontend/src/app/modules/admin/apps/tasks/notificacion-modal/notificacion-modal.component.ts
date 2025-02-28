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
    MatDialogModule 
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

    cancelar(): void {
        this.dialogRef.close(false);
    }

    confirmar(): void {
        this.dialogRef.close(this.contrasena);
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
        @Inject(MAT_DIALOG_DATA) public data: any
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
    }

    cambiarVistaPrevia(vista: 'inicial' | 'expandida') {
        this.vistaPrevia = vista;
    }

    enviarMensajePrueba() {
        // Implementar lógica de envío de mensaje de prueba
        console.log('Enviando mensaje de prueba');
    }

    previsualizarDestinatarios() {
        const filtros: FiltroNotificacion = {
            roles: this.notificacionForm.get('roles').value,
            unidades: this.notificacionForm.get('unidades').value
        };

        this._tasksService.obtenerDestinatarios(filtros)
            .subscribe(destinatarios => {
                this.destinatariosPreview = destinatarios;
            });
    }

    enviar() {
        if (this.notificacionForm.valid) {
            const formData = this.notificacionForm.value;
            const notificacion: NotificacionPush = {
                titulo: formData.titulo,
                mensaje: formData.mensaje,
                imagen: formData.imagen,
                fechaCreacion: new Date(),
                tipoEnvio: 'grupo',
                destinatarios: this.destinatariosPreview.map(d => ({
                    usuarioId: d.id,
                    estado: 'enviada'
                })),
                servicioId: this.data?.servicioId
            };

            this._tasksService.enviarNotificacionPush(notificacion)
                .subscribe({
                    next: (respuesta) => {
                        this.dialogRef.close(respuesta);
                    },
                    error: (error) => {
                        console.error('Error al enviar notificación', error);
                    }
                });
        }
    }

    cancelar() {
        this.dialogRef.close();
    }
} 