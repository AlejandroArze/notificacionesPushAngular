import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'confirmation-dialog',
    template: `
        <h2 mat-dialog-title>{{data.title}}</h2>
        <mat-dialog-content>{{data.message}}</mat-dialog-content>
        <mat-dialog-actions align="end">
            <button mat-button [mat-dialog-close]="false">
                Cancelar
            </button>
            <button mat-flat-button 
                    [mat-dialog-close]="true" 
                    color="warn">
                Eliminar
            </button>
        </mat-dialog-actions>
    `,
    standalone: true,
    imports: [
        MatDialogModule,
        MatButtonModule
    ]
})
export class ConfirmationDialogComponent {
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: {
            title: string;
            message: string;
        }
    ) {}
} 