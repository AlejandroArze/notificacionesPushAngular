import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

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
        MatSnackBarModule,
    ],
})
export class SettingsAccountComponent implements OnInit {
    accountForm: UntypedFormGroup;
    passwordForm: UntypedFormGroup;
    showPasswordSection: boolean = false;
    showPasswordConfirmation: boolean = false;
    imagePreview: string | null = null;
    imageName: string | null = null;
    userId: string;
    pendingFormData: FormData | null = null;
    selectedFile: File | null = null;

    // Propiedades para validación dinámica
    passwordLength: boolean = false;
    hasNumber: boolean = false;
    hasLetter: boolean = false;
    hasSpecialChar: boolean = false;

    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _httpClient: HttpClient,
        private cdr: ChangeDetectorRef,
        private _snackBar: MatSnackBar
    ) {}

    ngOnInit(): void {
        this.initializeForms();
        this.loadUserData();
    }

    initializeForms(): void {
        // Formulario principal de la cuenta
        this.accountForm = this._formBuilder.group({
            name: ['', Validators.required],
            lastname: ['', Validators.required],
            username: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            role: [''],
            estado: ['']
        });

        // Formulario independiente para cambio de contraseña
        this.passwordForm = this._formBuilder.group({
            currentPassword: ['', Validators.required],
            newPassword: ['', [
                Validators.required,
                Validators.minLength(8),
                this.createPasswordValidator()
            ]],
            confirmPassword: ['', Validators.required]
        }, { validator: this.passwordMatchValidator });

        // Suscribirse a los cambios de la nueva contraseña
        this.passwordForm.get('newPassword').valueChanges.subscribe(value => {
            this.updatePasswordValidation(value);
        });
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

    /**
     * Convierte una imagen a formato PNG
     */
    private convertToPNG(file: File): Promise<File> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                // Crear un canvas con las dimensiones de la imagen
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;

                // Dibujar la imagen en el canvas
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                // Convertir el canvas a Blob PNG
                canvas.toBlob((blob) => {
                    // Crear un nuevo archivo con el Blob PNG
                    const newFile = new File([blob], 'imagen.png', {
                        type: 'image/png',
                        lastModified: new Date().getTime()
                    });
                    resolve(newFile);
                }, 'image/png', 0.9); // 0.9 es la calidad de la imagen
            };
            img.onerror = (error) => reject(error);
            
            // Leer el archivo como URL de datos
            const reader = new FileReader();
            reader.onload = (e) => img.src = e.target.result as string;
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    }

    onFileSelected(event: any): void {
        const file: File = event.target.files[0];
        if (file) {
            console.log('📸 Archivo seleccionado:', {
                nombre: file.name,
                tipo: file.type,
                tamaño: file.size,
            });

            // Mostrar preview inmediato
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.imagePreview = e.target.result;
                this.imageName = 'imagen.png'; // Nuevo nombre estandarizado
                this.cdr.detectChanges();
            };
            reader.readAsDataURL(file);

            // Convertir a PNG si no es PNG
            if (file.type !== 'image/png') {
                console.log('🔄 Convirtiendo imagen a PNG...');
                this.convertToPNG(file)
                    .then(pngFile => {
                        console.log('✅ Imagen convertida exitosamente a PNG');
                        this.selectedFile = pngFile;
                    })
                    .catch(error => {
                        console.error('❌ Error al convertir la imagen:', error);
                        // Si falla la conversión, usar el archivo original
                        this.selectedFile = file;
                    });
            } else {
                // Si ya es PNG, usar el archivo directamente
                this.selectedFile = file;
            }
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

            this._httpClient.patch(`${environment.baseUrl}/user/${this.userId}/password`, passwordData)
                .subscribe({
                    next: (response: any) => {
                        console.log('✅ Contraseña actualizada exitosamente');
                        this.showNotification('Contraseña actualizada exitosamente', 'success');
                        this.passwordForm.reset();
                        this.showPasswordSection = false;
                        this.cdr.detectChanges();
                    },
                    error: (error) => {
                        console.error('❌ Error al actualizar la contraseña:', error);
                        if (error.error?.message === 'La contraseña actual es incorrecta') {
                            this.passwordForm.get('currentPassword').setErrors({ 'incorrect': true });
                            this.showNotification('La contraseña actual es incorrecta', 'error');
                        } else {
                            this.showNotification('Error al actualizar la contraseña', 'error');
                        }
                        this.cdr.detectChanges();
                    }
                });
        }
    }

    // Método para mostrar notificaciones
    private showNotification(message: string, type: 'success' | 'error'): void {
        this._snackBar.open(
            message,
            'Cerrar',
            {
                duration: 3000,
                horizontalPosition: 'right',
                verticalPosition: 'bottom',
                panelClass: type === 'success' ? ['bg-green-500'] : ['bg-red-500']
            }
        );
    }

    onSubmit(): void {
        if (this.accountForm.valid) {
            console.log('Iniciando proceso de submit...');
            
            const formData = new FormData();
            
            // Agregar los campos del formulario al FormData
            formData.append('email', this.accountForm.get('email').value);
            formData.append('usuario', this.accountForm.get('username').value);
            formData.append('nombres', this.accountForm.get('name').value);
            formData.append('apellidos', this.accountForm.get('lastname').value);
            formData.append('role', this.accountForm.get('role').value);
            formData.append('estado', this.accountForm.get('estado').value);

            if (this.selectedFile) {
                formData.append('image', this.selectedFile);
            }

            // Guardar el FormData y mostrar el diálogo de confirmación
            this.pendingFormData = formData;
            this.showPasswordConfirmation = true;
            this.cdr.detectChanges();
        }
    }

    confirmUpdate(): void {
        if (!this.userId || !this.pendingFormData) {
            console.error('❌ No se encontró el ID del usuario o no hay datos pendientes');
            return;
        }

        const currentPassword = this.passwordForm.get('currentPassword').value;
        if (!currentPassword) {
            console.error('❌ No se proporcionó contraseña de confirmación');
            this.showNotification('Por favor ingrese su contraseña actual', 'error');
            return;
        }

        // Agregar la contraseña al FormData existente
        this.pendingFormData.append('password', currentPassword);

        console.log('🔄 Iniciando actualización del usuario ID:', this.userId);
        console.log('Datos a enviar:', {
            url: `${environment.baseUrl}/user/${this.userId}`,
            formData: Array.from((this.pendingFormData as any).entries())
        });

        this._httpClient.put(`${environment.baseUrl}/user/${this.userId}`, this.pendingFormData)
            .subscribe({
                next: (response: any) => {
                    console.log('✅ Perfil actualizado exitosamente:', response);
                    if (response.data?.image) {
                        this.imagePreview = `${environment.baseUrl}${response.data.image}`;
                        this.imageName = response.data.image.split('/').pop();
                    }
                    localStorage.setItem('user', JSON.stringify(response));
                    window.dispatchEvent(new Event('userDataUpdated'));
                    
                    this.showPasswordConfirmation = false;
                    this.pendingFormData = null;
                    this.passwordForm.reset();
                    this.showNotification('Perfil actualizado exitosamente', 'success');
                    this.cdr.detectChanges();
                },
                error: (error) => {
                    console.error('❌ Error al actualizar el perfil:', error);
                    if (error.status === 401) {
                        this.passwordForm.get('currentPassword').setErrors({ 'incorrect': true });
                        this.showNotification('La contraseña actual es incorrecta', 'error');
                    }
                    this.cdr.detectChanges();
                }
            });
    }

    cancelPasswordConfirmation(): void {
        this.showPasswordConfirmation = false;
        this.pendingFormData = null;
        this.passwordForm.get('currentPassword').reset();
        this.cdr.detectChanges();
    }

    resetForm(): void {
        this.loadUserData(); // Recargar los datos originales
        this.imagePreview = null;
        this.imageName = null;
        this.selectedFile = null;
    }

    passwordMatchValidator(g: UntypedFormGroup) {
        return g.get('newPassword').value === g.get('confirmPassword').value
            ? null : { 'passwordMismatch': true };
    }

    // Método para actualizar la validación de contraseña en tiempo real
    private updatePasswordValidation(value: string): void {
        if (!value) {
            this.passwordLength = false;
            this.hasNumber = false;
            this.hasLetter = false;
            this.hasSpecialChar = false;
            return;
        }

        this.passwordLength = value.length >= 8;
        this.hasNumber = /[0-9]/.test(value);
        this.hasLetter = /[a-zA-Z]/.test(value);
        this.hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
        
        this.cdr.detectChanges();
    }

    // Validador personalizado para la contraseña
    private createPasswordValidator() {
        return (control: AbstractControl): ValidationErrors | null => {
            const value = control.value;
            
            if (!value) {
                return null;
            }

            const hasNumber = /[0-9]/.test(value);
            const hasLetter = /[a-zA-Z]/.test(value);
            const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

            const errors: ValidationErrors = {};
            
            if (!hasNumber) {
                errors['noNumber'] = true;
            }
            if (!hasLetter) {
                errors['noLetter'] = true;
            }
            if (!hasSpecialChar) {
                errors['noSpecialChar'] = true;
            }

            return Object.keys(errors).length ? errors : null;
        };
    }
}
