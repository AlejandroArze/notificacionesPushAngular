import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { NgIf, NgFor } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Card, EstadoServicio } from '../../scrumboard.models';
import { ScrumboardService } from '../../scrumboard.service';
import { HttpClient } from '@angular/common/http';


@Component({
    selector: 'scrumboard-card-details',
    templateUrl: './card-details.component.html',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatIconModule,
        MatDatepickerModule,
        MatNativeDateModule,
        ReactiveFormsModule
    ]
})
export class CardDetailsComponent implements OnInit, OnDestroy {
    card: Card;
    cardForm: FormGroup;
    estados = Object.values(EstadoServicio);
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    tecnicoRegistroNombre: string = '';

    constructor(
        private _formBuilder: FormBuilder,
        private _route: ActivatedRoute,
        private _router: Router,
        private _scrumboardService: ScrumboardService,
        private _httpClient: HttpClient
    ) {}

    ngOnInit(): void {
        // Inicializar el formulario
        this.cardForm = this._formBuilder.group({
            solicitante: ['', Validators.required],
            carnet: ['', Validators.required],
            cargo: [''],
            oficina: [''],
            telefono: [''],
            tipoServicio: ['', Validators.required],
            estado: ['', Validators.required],
            tecnicoAsignado: [''],
            observacionesProblema: ['', Validators.required],
            informe: ['']
        });

        // Obtener los detalles de la tarjeta
        const cardId = this._route.snapshot.paramMap.get('cardId');
        if (cardId) {
            this._scrumboardService.getServiceDetails(cardId)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe(card => {
                    this.card = card;
                    this.cardForm.patchValue(card);
                    
                    // Cargar el nombre del técnico registro
                    if (card.tecnicoRegistro) {
                        this._scrumboardService.getTecnicoById(card.tecnicoRegistro)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((response: any) => {
                                if (response?.data) {
                                    this.tecnicoRegistroNombre = 
                                        `${response.data.nombres} ${response.data.apellidos}`.trim();
                                }
                            });
                    }
                });
        }
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    onSubmit(): void {
        if (this.cardForm.valid) {
            const updatedCard = {
                ...this.card,
                ...this.cardForm.value
            };

            this._scrumboardService.updateService(updatedCard)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe(() => {
                    this._router.navigate(['../../'], { relativeTo: this._route });
                });
        }
    }

    closeDetails(): void {
        this._router.navigate(['../../'], { relativeTo: this._route });
    }
} 