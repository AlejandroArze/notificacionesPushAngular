import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseConfig, FuseConfigService } from '@fuse/services/config';
import { Subject, takeUntil } from 'rxjs';
import { NgIf } from '@angular/common';

@Component({
    selector: 'scheme',
    templateUrl: './scheme.component.html',
    styles: [
        `
        scheme {
            display: block;
            flex: none;
            width: auto;
        }
        `
    ],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        NgIf
    ],
})
export class SchemeComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    scheme: 'dark' | 'light';

    /**
     * Constructor
     */
    constructor(private _fuseConfigService: FuseConfigService) {}

    /**
     * On init
     */
    ngOnInit(): void {
        // Recuperar el esquema guardado del localStorage
        const savedScheme = localStorage.getItem('scheme') as 'dark' | 'light';
        
        // Si existe un esquema guardado, aplicarlo
        if (savedScheme) {
            this._fuseConfigService.config = { scheme: savedScheme };
        }

        // Suscribirse a los cambios del esquema
        this._fuseConfigService.config$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config: any) => {
                this.scheme = config.scheme;
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    /**
     * Cambiar el esquema
     */
    toggleScheme(): void {
        const newScheme = this.scheme === 'dark' ? 'light' : 'dark';
        
        // Guardar en localStorage
        localStorage.setItem('scheme', newScheme);
        
        // Actualizar el esquema
        this._fuseConfigService.config = { scheme: newScheme };
    }
}
