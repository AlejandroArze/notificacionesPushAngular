import { HttpClient } from '@angular/common/http';
import { TextFieldModule } from '@angular/cdk/text-field';
import { ChangeDetectionStrategy, inject, Component, OnInit, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { environment } from '../../../../../../environments/environment';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
    selector       : 'create-account', // Cambiado de 'settings-account' a 'create-account'
    templateUrl    : './create-account.component.html', // Ruta correcta al archivo HTML
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    imports        : [
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        TextFieldModule,
        MatSelectModule,
        MatOptionModule,
        MatButtonModule,
        CommonModule,
        MatSnackBarModule,
    ],
})
export class CreateAccountComponent implements OnInit { // Nombre de la clase ajustado
    @Output() accountCreated = new EventEmitter<void>();
    @Output() cancelled = new EventEmitter<void>(); // Añadir este EventEmitter
    @Output() accountError = new EventEmitter<any>();
    
    createAccountForm: UntypedFormGroup;
    imagePreview: string | null = null;
    imageName: string | null = null;
    userRole: string = null;

    /**
     * Constructor
     */
    constructor(private _formBuilder: UntypedFormBuilder,
      private cdr: ChangeDetectorRef,
      private _httpClient: HttpClient,
      private _snackBar: MatSnackBar,
    ) {
        // Obtener el rol del usuario del token
        const userString = localStorage.getItem('user');
        if (userString) {
            const userData = JSON.parse(userString);
            this.userRole = userData.data?.role;
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Crear el formulario con username y password vacíos
        this.createAccountForm = this._formBuilder.group({
            name     : ['', Validators.required],
            lastname : ['', Validators.required],
            username : ['', Validators.required],
            password : ['', [Validators.required, Validators.minLength(8)]],
            confirmPassword: ['', Validators.required],
            email    : ['', [Validators.required, Validators.email]],
            photo    : [null],
            roles    : ['', Validators.required],
            status   : [this.userRole === '1' ? '' : '1', this.userRole === '1' ? [Validators.required] : []]
        });

        // Suscribirse a los cambios de las contraseñas
        this.createAccountForm.get('password').valueChanges.subscribe(() => {
            if (this.createAccountForm.get('confirmPassword').value) {
                this.createAccountForm.get('confirmPassword').updateValueAndValidity();
            }
        });

        this.createAccountForm.get('confirmPassword').valueChanges.subscribe(() => {
            if (this.createAccountForm.get('confirmPassword').value) {
                const password = this.createAccountForm.get('password').value;
                const confirmPassword = this.createAccountForm.get('confirmPassword').value;
                
                if (password !== confirmPassword) {
                    this.createAccountForm.get('confirmPassword').setErrors({ 'passwordMismatch': true });
                } else {
                    this.createAccountForm.get('confirmPassword').setErrors(null);
                }
                this.cdr.detectChanges();
            }
        });
    }

    /**
     * Maneja el evento focus en los inputs
     */
    onFocusInput(event: FocusEvent): void {
        const input = event.target as HTMLInputElement;
        // No necesitamos hacer nada especial en el focus
        // El navegador manejará las sugerencias de autocompletado
    }

    /**
     * Maneja el evento blur en los inputs
     */
    onBlurInput(event: FocusEvent): void {
        const input = event.target as HTMLInputElement;
        // No necesitamos hacer nada especial en el blur
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

    /**
     * Maneja la selección de archivos
     */
    onFileSelected(event: any): void {
        const file: File = event.target.files[0];
        if (file) {
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
                console.log('Convirtiendo imagen a PNG...');
                this.convertToPNG(file)
                    .then(pngFile => {
                        console.log('Imagen convertida exitosamente a PNG');
                        this.createAccountForm.patchValue({
                            photo: pngFile
                        });
                    })
                    .catch(error => {
                        console.error('Error al convertir la imagen:', error);
                        // Si falla la conversión, usar el archivo original
                        this.createAccountForm.patchValue({
                            photo: file
                        });
                    });
            } else {
                // Si ya es PNG, usar el archivo directamente
                this.createAccountForm.patchValue({
                    photo: file
                });
            }
        }
    }

    onSubmit(): void {
        if (this.createAccountForm.valid) {
            const formData = new FormData();
            
            // Mapear los campos del formulario a los nombres esperados por el backend
            formData.append('email', this.createAccountForm.get('email').value);
            formData.append('usuario', this.createAccountForm.get('username').value);
            formData.append('nombres', this.createAccountForm.get('name').value);
            formData.append('apellidos', this.createAccountForm.get('lastname').value);
            formData.append('password', this.createAccountForm.get('password').value);
            formData.append('role', this.createAccountForm.get('roles').value);
            
            // Si el usuario es rol 2, siempre enviar estado 1
            formData.append('estado', this.userRole === '1' ? 
                this.createAccountForm.get('status').value : '1');

            // Agregar la imagen si existe
            const photoFile = this.createAccountForm.get('photo').value;
            if (photoFile) {
                console.log('Enviando imagen PNG:', photoFile);
                formData.append('image', photoFile, 'imagen.png');
            }

            // Imprimir el contenido del FormData para debugging
            formData.forEach((value, key) => {
                console.log(`${key}:`, value);
            });

            // Enviar la solicitud al servidor
            this._httpClient.post(`${environment.baseUrl}/user`, formData)
                .subscribe({
                    next: (response) => {
                        console.log('Usuario creado exitosamente', response);
                        this._snackBar.open(
                            'Usuario creado correctamente',
                            'Cerrar',
                            {
                                duration: 3000,
                                horizontalPosition: 'right',
                                verticalPosition: 'bottom',
                                panelClass: ['success-snackbar']
                            }
                        );
                        this.createAccountForm.reset();
                        this.imagePreview = null;
                        this.imageName = null;
                        this.accountCreated.emit();
                    },
                    error: (error) => {
                        console.error('Error al crear usuario', error);
                        
                        // Manejar el error específico de username o email duplicado
                        let errorMessage = 'Error al crear el usuario. Intente nuevamente.';
                        
                        if (error.status === 409 && error.error?.error?.length > 0) {
                            const errorText = error.error.error[0];
                            errorMessage = `Error al crear el usuario: ${errorText}`;
                            
                            if (errorText.includes('Username')) {
                                const username = this.createAccountForm.get('username').value;
                                errorMessage = `${username} ya está en uso`;
                                this.createAccountForm.get('username').setErrors({'duplicate': true});
                            } else if (errorText.includes('Email')) {
                                const email = this.createAccountForm.get('email').value;
                                errorMessage = `${email} ya está registrado`;
                                this.createAccountForm.get('email').setErrors({'duplicate': true});
                            }
                            
                            this.cdr.detectChanges();
                        } else if (error.error?.message) {
                            errorMessage = error.error.message;
                        }
                        
                        this._snackBar.open(
                            errorMessage,
                            'Cerrar',
                            {
                                duration: 3000,
                                horizontalPosition: 'right',
                                verticalPosition: 'bottom',
                                panelClass: ['error-snackbar']
                            }
                        );
                        this.accountError.emit(error);
                    }
                });
        }
    }
}
