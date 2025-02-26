import { Component, Input } from '@angular/core';
import { NgClass, NgIf, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { Card, EstadoServicio } from '../scrumboard.models';
import { AddCardComponent } from '../board/add-card/add-card.component';
import { ScrumboardService } from '../scrumboard.service';
import { ScrumboardCardDetailsComponent } from './details/details.component';

@Component({
    selector: 'scrumboard-card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss'],
    standalone: true,
    imports: [
        NgIf,
        NgClass,
        DatePipe,
        MatIconModule,
        MatButtonModule
    ]
})
export class ScrumboardCardComponent {
    @Input() card: Card;
    protected EstadoServicio = EstadoServicio;

    constructor(
        private _dialog: MatDialog,
        private _scrumboardService: ScrumboardService
    ) {}

    openCardDetails(): void {
        const dialogRef = this._dialog.open(ScrumboardCardDetailsComponent, {
            data: {
                card: this.card,
                isNew: false
            },
            width: '700px',
            height: 'auto',
            maxHeight: '90vh',
            autoFocus: false,
            disableClose: false,
            backdropClass: 'cursor-pointer'
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result === true) {
                this._scrumboardService.getCardsByStatus(
                    this.card.tipo,
                    this.card.estado,
                    null,
                    1,
                    10
                ).subscribe();
            }
        });
    }
}
