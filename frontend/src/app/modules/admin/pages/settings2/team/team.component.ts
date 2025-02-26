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

@Component({
    selector       : 'settings-team',
    templateUrl    : './team.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    imports        : [ScrollingModule, MatFormFieldModule, MatIconModule, MatInputModule, MatButtonModule, NgFor, NgIf, MatSelectModule, MatOptionModule, TitleCasePipe, FormsModule, CreateAccountComponent, EditAccountComponent],
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

    /**
     * Constructor
     */
    constructor(
        private http: HttpClient,
        private cdr: ChangeDetectorRef,
        private settingsService: SettingsService,
        private router: Router
    ) {}
    


    ngOnInit(): void {

      this.http.get<any>(`${environment.baseUrl}/users`).subscribe(
        (response) => {
          
          this.members = response.data.filter(user => user.estado === 1).map((user) => {
            return {
              id: user.usuarios_id.toString(), // Asegurarse de que el ID sea string
              avatar: user.image
              ? `${environment.baseUrl}${user.image}` // Construye la URL completa si hay una imagen
              : 'assets/images/avatars/default-profile.png', // Imagen por defecto
              name: `${user.nombres} ${user.apellidos}`,
              email: user.email,
              role: this.getRoleLabel(user.role),
            };
          });
          console.log('Miembros mapeados:', this.members); // Verifica que la lista se actualiza
          this.cdr.detectChanges(); // Forza la actualización de la vista
        },
        (error) => {
          console.error('Error al cargar los usuarios:', error);
        }
      );
    }

    reloadUsers(): void {
      this.http.get<any>(`${environment.baseUrl}/users`).subscribe(
        (response) => {
          this.members = response.data.filter(user => user.estado === 1).map((user) => {
            return {
              avatar: user.image
                ? `${environment.baseUrl}${user.image}` // Construye la URL completa si hay una imagen
                : 'assets/images/avatars/default-profile.png', // Imagen por defecto
              name: `${user.nombres} ${user.apellidos}`,
              email: user.email,
              role: this.getRoleLabel(user.role),
            };
          });
          console.log('Lista de usuarios actualizada:', this.members);
          this.cdr.detectChanges(); // Forza la actualización de la vista
        },
        (error) => {
          console.error('Error al recargar los usuarios:', error);
        }
      );
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

    toggleUserStatus(user: any): void { 
      const newStatus = 0; // Establece el nuevo estado a 0
    
      this.http.patch<any>(`${environment.baseUrl}/user/${user.id}/status`, 
          { estado: newStatus }).subscribe( 
          (response) => { 
              console.log('Estado del usuario actualizado:', response); 
              this.reloadUsers(); // Recargar la lista de usuarios para reflejar los cambios
          }, 
          (error) => { 
              console.error('Error al actualizar el estado del usuario:', error); 
          }
      );
    }
    
    
  
    

    
    
    

    
  // Método para convertir el role numérico en un texto legible
  getRoleLabel(role: string): string {
    switch (role) {
      case '1':
        return 'Super Admin';
      case '2':
        return 'Admin';
      case '3':
        return 'Tecnico';
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
        // Cancelar todas las suscripciones
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}

