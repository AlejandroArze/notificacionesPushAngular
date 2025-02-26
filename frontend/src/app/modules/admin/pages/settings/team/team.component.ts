import { NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';
import { ChangeDetectorRef,  Output, EventEmitter } from '@angular/core';
import { SettingsService } from '../Settings.Service';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { FormsModule } from '@angular/forms';
import { CreateAccountComponent } from '../create-account/create-account.component';
import { EditAccountComponent } from '../edit-account/edit-account.component';
import { Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector       : 'settings-team',
    templateUrl    : './team.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    imports        : [
        ScrollingModule, 
        MatFormFieldModule, 
        MatIconModule, 
        MatInputModule, 
        MatButtonModule, 
        NgFor, 
        NgIf, 
        MatSelectModule, 
        MatOptionModule, 
        TitleCasePipe, 
        FormsModule, 
        CreateAccountComponent, 
        EditAccountComponent,
        MatDialogModule
    ],
})
export class SettingsTeamComponent implements OnInit, OnDestroy
{
    @Output() panelChanged = new EventEmitter<string>();
    //@Output() panelChanged : EventEmitter<{ panel: string; userId: string }> = new EventEmitter();
    //@Output() panelChanged: EventEmitter<{ panel: string; userId: string }> = new EventEmitter();
    //@Output() panelChanged = new EventEmitter<{ panel: string; userId?: string }>();

    members: any[];
    roles: any[];
    searchTerm: string = '';

    // Cambiar el tipo de selectedUserId a string
    currentView: 'team' | 'create' | 'edit' = 'team';
    selectedUserId: string = null;

    // Agregar propiedad para manejar las suscripciones
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    private imageUrls: Map<number, string> = new Map();
    userRole: string = null;
    private userDataUpdateListener: () => void;

    /**
     * Constructor
     */
    constructor(
        private http: HttpClient,
        private cdr: ChangeDetectorRef,
        private settingsService: SettingsService,
        private router: Router,
        private _snackBar: MatSnackBar,
        private _dialog: MatDialog
    ) {
        // Obtener el rol del usuario del token
        const userString = localStorage.getItem('user');
        if (userString) {
            const userData = JSON.parse(userString);
            this.userRole = userData.data?.role;
        }
    }
    


    ngOnInit(): void {
        this.loadUsers();
        
        // Configurar el listener para actualizaciones de datos
        this.userDataUpdateListener = () => {
            console.log('🔄 Actualizando lista de usuarios después de cambios');
            this.loadUsers();
        };
        window.addEventListener('userDataUpdated', this.userDataUpdateListener);
    }

    loadUsers(): void {
        this.http.get<any>(`${environment.baseUrl}/users`).subscribe(
            (response) => {
                // Filtrar usuarios según el rol del usuario logueado
                this.members = response.data
                    .filter(user => {
                        // Si es rol 1, mostrar todos los usuarios
                        if (this.userRole === '1') {
                            return true;
                        }
                        // Si es rol 2, mostrar solo usuarios activos
                        return user.estado === 1;
                    })
                    .map((user) => {
                        const avatarUrl = user.image ? `${environment.baseUrl}${user.image}` : null;
                        return {
                            id: user.usuarios_id.toString(),
                            avatar: avatarUrl && !avatarUrl.includes('default-profile.png') ? avatarUrl : null,
                            avatarError: false,
                            name: `${user.nombres} ${user.apellidos}`,
                            email: user.email,
                            role: this.getRoleLabel(user.role),
                            estado: user.estado
                        };
                    });
                console.log('Miembros filtrados:', this.members);
                this.cdr.detectChanges();
            },
            (error) => {
                console.error('Error al cargar los usuarios:', error);
            }
        );
    }

    reloadUsers(): void {
        this.loadUsers();
    }

    goToCreateAccount(): void {
      // Emitir el evento para cambiar el panel
      this.panelChanged.emit('create-account');
    }
    goToEditAccount(userId: string): void {
      // Emitir el evento para cambiar el panel
      sessionStorage.setItem('selectedUserId', userId);
      this.panelChanged.emit('edit-account');
      console.log('ID del usuario seleccionado:', userId);
    }

    // Método para cambiar a la vista de crear cuenta
    showCreateAccount(): void {
        this.currentView = 'create';
    }

    // Método para mostrar notificación
    showNotification(message: string, type: 'success' | 'error'): void {
        this._snackBar.open(message, 'Cerrar', {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'bottom',
            panelClass: type === 'success' ? ['bg-green-500'] : ['bg-red-500'],
        });
    }

    // Método para manejar la creación exitosa de una cuenta
    handleAccountCreated(): void {
        this.reloadUsers();
        this.currentView = 'team';
        this.showNotification('Usuario creado exitosamente', 'success');
    }

    // Método para manejar error en la creación de cuenta
    handleAccountError(error: any): void {
        let errorMessage = 'Error al crear el usuario';
        if (error.error && error.error.message) {
            errorMessage += `: ${error.error.message}`;
        }
        this.showNotification(errorMessage, 'error');
    }

    // Método para cambiar a la vista de editar cuenta
    showEditAccount(userId: string): void {
        console.log('Seleccionado usuario para editar:', userId);
        sessionStorage.setItem('selectedUserId', userId);
        this.currentView = 'edit';
        this.selectedUserId = userId;
    }

    // Método para volver a la vista del equipo
    returnToTeam(): void {
        this.currentView = 'team';
    }

    // Método para mostrar el diálogo de confirmación
    confirmDelete(user: any): void {
        const dialogRef = this._dialog.open(DeleteConfirmationDialog, {
            width: '400px',
            data: { userName: user.name }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result === true) {
                this.toggleUserStatus(user);
            }
        });
    }

    toggleUserStatus(user: any): void { 
        const newStatus = 0; // Establece el nuevo estado a 0
    
        this.http.patch<any>(`${environment.baseUrl}/user/${user.id}/status`, 
            { estado: newStatus }).subscribe({ 
            next: (response) => { 
                console.log('Estado del usuario actualizado:', response); 
                this.showNotification('Usuario eliminado exitosamente', 'success');
                this.reloadUsers(); // Recargar la lista de usuarios para reflejar los cambios
            }, 
            error: (error) => { 
                console.error('Error al actualizar el estado del usuario:', error);
                this.showNotification('Error al eliminar el usuario', 'error');
            }
        });
    }
    
    
  
    

    
    
    

    
  // Método para convertir el role numérico en un texto legible
  getRoleLabel(role: string): string {
    switch (role) {
      case '1':
        return 'Super Admin';
      case '2':
        return 'Admin';
      case '3':
        return 'Técnico';
      default:
        return 'Rol desconocido';
    }
  }

  searchMembers(): void {
    if (this.searchTerm.trim() === '') {
      this.reloadUsers(); // Si no hay búsqueda, recarga todos los usuarios
    } else {
      this.members = this.members.filter((member) =>
        member.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }
  
  

  

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

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

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Remover el listener cuando el componente se destruye
        if (this.userDataUpdateListener) {
            window.removeEventListener('userDataUpdated', this.userDataUpdateListener);
        }
        
        // Cancelar todas las suscripciones
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    /**
     * Obtiene las iniciales del nombre completo
     */
    getInitials(name: string): string {
        if (!name) return '';
        
        // Dividir el nombre en palabras
        const words = name.split(' ');
        
        // Si solo hay una palabra, tomar las dos primeras letras
        if (words.length === 1) {
            return words[0].substring(0, 2).toUpperCase();
        }
        
        // Si hay más de una palabra, tomar la primera letra de las dos primeras palabras
        return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }
}

// Componente del diálogo de confirmación
@Component({
    selector: 'delete-confirmation-dialog',
    template: `
        <div class="p-6">
            <h2 class="text-xl font-semibold mb-4">Confirmar eliminación</h2>
            <p class="mb-6">¿Está seguro que desea eliminar al usuario <strong>{{data.userName}}</strong>?</p>
            <div class="flex justify-end space-x-3">
                <button mat-stroked-button (click)="dialogRef.close(false)">
                    Cancelar
                </button>
                <button mat-flat-button color="warn" (click)="dialogRef.close(true)">
                    Eliminar
                </button>
            </div>
        </div>
    `,
    standalone: true,
    imports: [MatButtonModule, MatDialogModule],
})
export class DeleteConfirmationDialog {
    constructor(
        public dialogRef: MatDialogRef<DeleteConfirmationDialog>,
        @Inject(MAT_DIALOG_DATA) public data: { userName: string }
    ) {}
}

