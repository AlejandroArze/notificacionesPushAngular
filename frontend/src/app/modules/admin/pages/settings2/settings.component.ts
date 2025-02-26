import { NgClass, NgFor, NgSwitch, NgSwitchCase } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { Subject, takeUntil } from 'rxjs';
import { SettingsAccountComponent } from './account/account.component';
import { CreateAccountComponent } from './create-account/create-account.component';
import { EditAccountComponent } from './edit-account/edit-account.component';
import { SettingsNotificationsComponent } from './notifications/notifications.component';
import { SettingsPlanBillingComponent } from './plan-billing/plan-billing.component';
import { SettingsSecurityComponent } from './security/security.component';
import { SettingsTeamComponent } from './team/team.component';
import { SettingsService } from './Settings.Service';
import { jwtDecode } from 'jwt-decode';

@Component({
    selector       : 'settings',
    templateUrl    : './settings.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    imports        : [MatSidenavModule, MatButtonModule, MatIconModule, NgFor, NgClass, NgSwitch, NgSwitchCase, SettingsAccountComponent, SettingsSecurityComponent, SettingsPlanBillingComponent, SettingsNotificationsComponent, SettingsTeamComponent,  CreateAccountComponent, EditAccountComponent],
})
export class SettingsComponent implements OnInit, OnDestroy
{
    @ViewChild('drawer') drawer: MatDrawer;
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    panels: any[] = [];
    panels1: any[] = [];
    panels2: any[] = [];
    panels3: any[] = [];
    selectedPanel: string = 'account';
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseMediaWatcherService: FuseMediaWatcherService, 
        private settingsService: SettingsService,
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Obtener el rol del usuario
        const userRoles = this._getUserRoles();
        const role = userRoles[0];

        // Configuración base de paneles
        const basePanels = [
            {
                id         : 'account',
                icon       : 'heroicons_outline:user-circle',
                title      : 'Cuenta',
                description: 'Gestiona tu perfil público e información privada',
            },
            {
                id         : 'security',
                icon       : 'heroicons_outline:lock-closed',
                title      : 'Seguridad',
                description: 'Gestiona tu contraseña y las preferencias de verificación en dos pasos',
            },
        ];

        // Agregar panel de equipo para roles administrativos
        if (role === 1 || role === 2) {
            basePanels.push({
                id         : 'team',
                icon       : 'heroicons_outline:user-group',
                title      : 'Equipo',
                description: 'Gestiona tu equipo y los miembros',
            });
        }

        this.panels = basePanels;

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) =>
            {
                // Set the drawerMode and drawerOpened
                if ( matchingAliases.includes('lg') )
                {
                    this.drawerMode = 'side';
                    this.drawerOpened = true;
                }
                else
                {
                    this.drawerMode = 'over';
                    this.drawerOpened = false;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    private _getUserRoles(): number[] {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No se encontró el token en localStorage');
            return [];
        }

        try {
            const decoded: any = jwtDecode(token);
            return decoded.role ? [parseInt(decoded.role, 10)] : [];
        } catch (error) {
            console.error('Error al decodificar el token', error);
            return [];
        }
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Navigate to the panel
     *
     * @param panel
     */
    goToPanel(panel: string): void
    {
        this.selectedPanel = panel;

        // Close the drawer on 'over' mode
        if ( this.drawerMode === 'over' )
        {
            this.drawer.close();
        }
    }

    // Método para manejar el evento emitido desde el componente hijo (SettingsTeamComponent)
    onPanelChanged(panelId: string): void {
        this.selectedPanel = panelId;  // Cambiar el panel cuando se emite el evento
    }

    /**
     * Get the details of the panel
     *
     * @param id
     */
    getPanelInfo(id: string): any
    {
        return this.panels.find(panel => panel.id === id)|| { title: 'Panel no encontrado' };
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }
}
