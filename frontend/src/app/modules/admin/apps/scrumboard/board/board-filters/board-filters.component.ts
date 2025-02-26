import { Component, EventEmitter, Input, OnInit, OnDestroy, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { AsyncPipe, NgFor } from '@angular/common';
import { Observable, Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil, startWith, take } from 'rxjs';
import { ScrumboardService } from '../../scrumboard.service';

interface Tecnico {
    id: number;
    nombre: string;
}

@Component({
    selector: 'board-filters',
    standalone: true,
    imports: [
        MatFormFieldModule,
        MatAutocompleteModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        AsyncPipe,
        NgFor
    ],
    template: `
        <div class="flex items-center space-x-4">
            <mat-form-field class="w-56 sm:w-72">
                <mat-label>Técnico Asignado</mat-label>
                <input type="text"
                       matInput
                       [formControl]="searchControl"
                       [matAutocomplete]="auto"
                       placeholder="Buscar técnico...">
                <mat-autocomplete #auto="matAutocomplete" 
                                [displayWith]="displayFn"
                                (optionSelected)="onTecnicoSelected($event)"
                                class="custom-autocomplete"
                                [autoActiveFirstOption]="true">
                    <mat-option *ngFor="let tecnico of filteredTecnicos$ | async" 
                              [value]="tecnico"
                              class="option-with-border">
                        <div class="py-2 min-h-[3rem] flex items-center">
                            <span class="line-clamp-2">{{tecnico.nombre}}</span>
                        </div>
                    </mat-option>
                </mat-autocomplete>
            </mat-form-field>
        </div>
    `,
    styles: [`
        :host {
            display: block;
        }
        
        .mat-mdc-form-field {
            --mat-mdc-form-field-floating-label-scale: 0.75;
        }

        ::ng-deep .mat-mdc-option {
            min-height: unset !important;
            height: auto !important;
        }

        ::ng-deep .option-with-border {
            border-bottom: 1px solid rgba(0, 0, 0, 0.12);
        }

        ::ng-deep .dark .option-with-border {
            border-bottom: 1px solid rgba(255, 255, 255, 0.12);
        }

        ::ng-deep .mat-mdc-option:last-child {
            border-bottom: none;
        }

        ::ng-deep .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        ::ng-deep .mat-autocomplete-panel {
            max-height: 400px !important; /* Aumentar altura máxima del panel */
        }
    `]
})
export class BoardFiltersComponent implements OnInit, OnDestroy {
    @Input() initialValue: any;
    @Output() filterChange = new EventEmitter<number>();
    
    searchControl = new FormControl('');
    filteredTecnicos$: Observable<Tecnico[]>;
    private _unsubscribeAll: Subject<void> = new Subject<void>();

    constructor(private _scrumboardService: ScrumboardService) {
        // Configurar el observable para la búsqueda de técnicos
        this.filteredTecnicos$ = this.searchControl.valueChanges.pipe(
            startWith(''),
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(value => {
                const searchTerm = typeof value === 'string' ? value : '';
                return this._scrumboardService.getTecnicos(searchTerm);
            }),
            takeUntil(this._unsubscribeAll)
        );
    }

    ngOnInit(): void {
        // Seleccionar "Todos" por defecto
        // NO hacer esto, ya que el valor inicial viene del componente principal
    /* this._scrumboardService.getTecnicos('')
        .pipe(take(1))
        .subscribe(tecnicos => {
            if (tecnicos.length > 0) {
                const todos = tecnicos[0];
                this.searchControl.setValue(todos);
                this.filterChange.emit(todos.id);
            }
        }); */

    // En su lugar, esperar a que el componente padre establezca el valor inicial
    if (this.initialValue) {
        requestAnimationFrame(() => {
            this.searchControl.setValue(this.initialValue, { emitEvent: false });
        });
    
    }
    }

    displayFn(tecnico: Tecnico): string {
        return tecnico ? tecnico.nombre : '';
    }

    onTecnicoSelected(event: any): void {
        const tecnico = event.option.value as Tecnico;
        this.filterChange.emit(tecnico.id);
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
} 