import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, ChangeDetectorRef, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../Settings.Service';
import { environment } from '../../../../../../environments/environment';
import { NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  selector: 'edit-account',
  templateUrl: './edit-account.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  //changeDetection: ChangeDetectionStrategy.Default,
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    CommonModule,
  ],
})
export class EditAccountComponent implements OnInit {
  @Output() panelChanged = new EventEmitter<string>();
  @Output() accountUpdated = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
  @Input() userId: string;
  editAccountForm: FormGroup;
  passwordForm: FormGroup;
  showPasswordSection: boolean = false;
  imagePreview: string | null = null;
  imageName: string | null = null;
  message: string | null = null;

  constructor(
    private _formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private _httpClient: HttpClient,
    private settingsService: SettingsService
  ) {}

  ngOnInit(): void {
    this.checkSessionStorage();
    this.userId = sessionStorage.getItem('selectedUserId');
    this.editAccountForm = this._formBuilder.group({
      name: ['', Validators.required],
      lastname: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      email: ['', [Validators.required, Validators.email]],
      photo: [null],
      roles: ['', Validators.required],
      status: ['', Validators.required]
    });

    if (this.userId) {
      this.loadUserData(this.userId);
    } else {
      console.error('ID de usuario no encontrado en sessionStorage');
    }
  }

  loadUserData(userId: string): void {
    this._httpClient.get<any>(`${environment.baseUrl}/user/${userId}`).subscribe(
      (response: any) => {
        console.log('Respuesta del servidor:', response);
        
        const { apellidos, email, estado, image, nombres, role, usuario } = response.data || {};
  
        if (response.data) {
          this.editAccountForm.patchValue({
            name: nombres || '',
            lastname: apellidos || '',
            username: usuario || '',
            email: email || '',
            roles: role || '',
            status: estado.toString() || '1'
          });
  
          if (image) {
            this.imagePreview = `${environment.baseUrl}${image}`;
            this.imageName = image.split('/').pop();
          }
  
          this.cdr.detectChanges();
        }
      },
      (error) => {
        console.error('Error al obtener los datos del usuario:', error);
      }
    );
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
        this.imageName = file.name;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.editAccountForm.valid && this.userId) {
      const formData = new FormData();
      formData.append('email', this.editAccountForm.get('email')?.value);
      formData.append('usuario', this.editAccountForm.get('username')?.value);
      formData.append('nombres', this.editAccountForm.get('name')?.value);
      formData.append('apellidos', this.editAccountForm.get('lastname')?.value);
      formData.append('password', this.editAccountForm.get('password')?.value);
      formData.append('role', this.editAccountForm.get('roles')?.value);
      formData.append('estado', this.editAccountForm.get('status')?.value);    

      const fileInput = <HTMLInputElement>document.getElementById('photo');
      const file = fileInput?.files?.[0];
      if (file) {
        formData.append('image', file);
      } else {
        formData.append('image', '/uploads/default-profile.png');
      }

      this._httpClient.put(`${environment.baseUrl}/user/${this.userId}`, formData).subscribe(
        (response) => {
          this.editAccountForm.reset();
          this.imagePreview = null;
          this.imageName = null;
          this.goToTeam();
          sessionStorage.clear();
          console.log('Usuario actualizado con éxito', response);
        },
        (error) => {
          console.error('Error al actualizar usuario', error);
        }
      );
    }
  }

  checkSessionStorage(): void {
    const userId = sessionStorage.getItem('selectedUserId');
    if (!userId) {
      console.log('No se encontró el dato en sessionStorage. Redirigiendo...');
      this.message = 'Debe seleccionar un usuario antes de editar.';
      this.panelChanged.emit('team');
    }
  }

  goToTeam(): void {
    this.panelChanged.emit('team');
  }

  // Validador personalizado para confirmar contraseña
  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword').value === g.get('confirmPassword').value
      ? null : {'mismatch': true};
  }

  togglePasswordSection(): void {
    this.showPasswordSection = !this.showPasswordSection;
  }

  // Actualizar el método changePassword para implementar la funcionalidad
  changePassword(): void {
    if (this.passwordForm.valid && this.userId) {
      const passwordData = {
        currentPassword: this.passwordForm.get('currentPassword').value,
        newPassword: this.passwordForm.get('newPassword').value
      };

      this._httpClient.post(`${environment.baseUrl}/user/${this.userId}/change-password`, passwordData)
        .subscribe(
          (response) => {
            console.log('Contraseña actualizada con éxito');
            this.passwordForm.reset();
            this.showPasswordSection = false;
          },
          (error) => {
            console.error('Error al actualizar la contraseña:', error);
          }
        );
    }
  }

  saveChanges(): void {
    if (this.editAccountForm.valid) {
      this.onSubmit();
    }
  }
}
