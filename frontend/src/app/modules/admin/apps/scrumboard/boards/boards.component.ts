import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Board, TipoServicio } from '../scrumboard.models';

@Component({
    selector: 'scrumboard-boards',
    templateUrl: './boards.component.html',
    standalone: true,
    imports: [RouterLink, NgFor, MatIconModule]
})
export class ScrumboardBoardsComponent {
    // Tableros estáticos
    boards: Board[] = [
        {
            id: 'asistencia-sitio',
            title: TipoServicio.ASISTENCIA_SITIO,
            description: 'Servicios de asistencia técnica en sitio',
            icon: 'heroicons_outline:computer-desktop',
            lists: [] // Se llenarán dinámicamente
        },
        {
            id: 'servicio-laboratorio',
            title: TipoServicio.SERVICIO_LABORATORIO,
            description: 'Servicios de mantenimiento en laboratorio',
            icon: 'heroicons_outline:beaker',
            lists: []
        },
        {
            id: 'asistencia-remota',
            title: TipoServicio.ASISTENCIA_REMOTA,
            description: 'Servicios de asistencia técnica remota',
            icon: 'heroicons_outline:globe-alt',
            lists: []
        }
    ];

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
