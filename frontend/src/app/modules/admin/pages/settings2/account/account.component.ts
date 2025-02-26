import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';
import { jwtDecode } from 'jwt-decode';

@Component({
    selector: 'settings-account',
    templateUrl: './account.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
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
export class SettingsAccountComponent implements OnInit {
    accountForm: UntypedFormGroup;
    passwordForm: UntypedFormGroup;
    showPasswordSection: boolean = false;
    imagePreview: string | null = null;
    imageName: string | null = null;
    userId: string;

    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _httpClient: HttpClient,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.initializeForms();
        this.loadUserData();
    }

    initializeForms(): void {
        // Formulario principal
        this.accountForm = this._formBuilder.group({
            name: ['', Validators.required],
            lastname: ['', Validators.required],
            username: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            photo: [null],
            password: [''],
            role: [''],
            estado: ['']
        });

        // Formulario de contraseña
        this.passwordForm = this._formBuilder.group({
            currentPassword: ['', Validators.required],
            newPassword: ['', [Validators.required, Validators.minLength(8)]],
            confirmPassword: ['', Validators.required]
        }, { validator: this.passwordMatchValidator });
    }

    loadUserData(): void {
        try {
            const token = localStorage.getItem('token');
            const userString = localStorage.getItem('user');

            if (token) {
                const decoded: any = jwtDecode(token);
                this.userId = decoded.sub;
            }

            if (userString) {
                const userResponse = JSON.parse(userString);
                const userData = userResponse.data;
                
                if (userData) {
                    if (!this.userId && userData.usuarios_id) {
                        this.userId = userData.usuarios_id.toString();
                    }

                    this.accountForm.patchValue({
                        name: userData.nombres,
                        lastname: userData.apellidos,
                        username: userData.usuario,
                        email: userData.email,
                        role: userData.role,
                        estado: userData.estado,
                        password: userData.password
                    });

                    if (userData.image) {
                        this.imagePreview = userData.image.startsWith('http') 
                            ? userData.image 
                            : `${environment.baseUrl}${userData.image}`;
                        this.imageName = userData.image.split('/').pop();
                    }

                    this.cdr.detectChanges();
                }
            } else {
                this.loadUserDataFromBackend();
            }
        } catch (error) {
            console.error('Error al cargar datos del usuario:', error);
            this.loadUserDataFromBackend();
        }
    }

    private loadUserDataFromBackend(): void {
        // Intentar obtener el ID del usuario de diferentes fuentes
        if (!this.userId) {
            const token = localStorage.getItem('token');
            const userString = localStorage.getItem('user');

            if (token) {
                try {
                    const decoded: any = jwtDecode(token);
                    this.userId = decoded.sub;
                } catch (error) {
                    console.error('Error al decodificar el token:', error);
                }
            }

            if (!this.userId && userString) {
                try {
                    const userData = JSON.parse(userString).data;
                    this.userId = userData.usuarios_id?.toString();
                } catch (error) {
                    console.error('Error al obtener ID del localStorage:', error);
                }
            }
        }

        // Verificar si tenemos un ID válido antes de hacer la petición
        if (!this.userId) {
            console.error('No se pudo obtener el ID del usuario');
            return;
        }

        // Hacer la petición al backend
        this._httpClient.get(`${environment.baseUrl}/user/${this.userId}`).subscribe(
            (response: any) => {
                if (response.data) {
                    const userData = response.data;
                    localStorage.setItem('user', JSON.stringify(response));
                    this.updateFormWithUserData(userData);
                }
            },
            error => console.error('Error al obtener datos del usuario desde el backend:', error)
        );
    }

    // Método auxiliar para actualizar el formulario
    private updateFormWithUserData(userData: any): void {
        this.accountForm.patchValue({
            name: userData.nombres,
            lastname: userData.apellidos,
            username: userData.usuario,
            email: userData.email,
            role: userData.role,
            estado: userData.estado
        });

        if (userData.image) {
            this.imagePreview = `${environment.baseUrl}${userData.image}`;
            this.imageName = userData.image.split('/').pop();
        }

        this.cdr.detectChanges();
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

    togglePasswordSection(): void {
        this.showPasswordSection = !this.showPasswordSection;
        if (!this.showPasswordSection) {
            this.passwordForm.reset();
        }
    }

    changePassword(): void {
        if (this.passwordForm.valid) {
            const passwordData = {
                currentPassword: this.passwordForm.get('currentPassword').value,
                newPassword: this.passwordForm.get('newPassword').value
            };

            this._httpClient.post(`${environment.baseUrl}/user/${this.userId}/change-password`, passwordData)
                .subscribe(
                    response => {
                        console.log('Contraseña actualizada exitosamente');
                        this.passwordForm.reset();
                        this.showPasswordSection = false;
                        this.cdr.detectChanges();
                    },
                    error => console.error('Error al actualizar la contraseña:', error)
                );
        }
    }

    onSubmit(): void {
        if (!this.userId) {
            console.error('No se encontró el ID del usuario');
            return;
        }

        if (this.accountForm.valid) {
            console.log('🔄 Iniciando actualización del usuario ID:', this.userId);
            
            const formData = new FormData();
            const userString = localStorage.getItem('user');
            
            if (userString) {
                const userData = JSON.parse(userString).data;
                
                // Crear objeto para mostrar cambios
                const updateData = {
                    nombres: this.accountForm.get('name').value || userData.nombres,
                    apellidos: this.accountForm.get('lastname').value || userData.apellidos,
                    usuario: this.accountForm.get('username').value || userData.usuario,
                    email: this.accountForm.get('email').value || userData.email,
                    role: userData.role,
                    estado: userData.estado
                };

                console.log('📝 Datos a actualizar:', updateData);

                // Agregar datos al FormData
                Object.keys(updateData).forEach(key => {
                    formData.append(key, updateData[key]);
                });
                formData.append('password', userData.password);

                // Manejar la imagen
                const fileInput = document.querySelector('#photo') as HTMLInputElement;
                if (fileInput?.files?.length > 0) {
                    console.log('🖼️ Actualizando imagen:', fileInput.files[0].name);
                    formData.append('image', fileInput.files[0]);
                } else if (userData.image) {
                    formData.append('image', userData.image);
                }

                this._httpClient.put(`${environment.baseUrl}/user/${this.userId}`, formData)
                    .subscribe(
                        response => {
                            console.log('✅ Perfil actualizado exitosamente:', response);
                            this.loadUserDataFromBackend();
                        },
                        error => {
                            console.error('❌ Error al actualizar el perfil:', error);
                        }
                    );
            }
        }
    }

    resetForm(): void {
        this.loadUserData(); // Recargar los datos originales
        this.imagePreview = null;
        this.imageName = null;
    }

    passwordMatchValidator(g: UntypedFormGroup) {
        return g.get('newPassword').value === g.get('confirmPassword').value
            ? null : { 'passwordMismatch': true };
    }
}
