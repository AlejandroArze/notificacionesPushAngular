import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';

@Component({
    selector       : 'settings-security',
    templateUrl    : './security.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    imports        : [
        FormsModule, 
        ReactiveFormsModule, 
        MatFormFieldModule, 
        MatIconModule, 
        MatInputModule, 
        MatSlideToggleModule, 
        MatButtonModule,
        MatSnackBarModule
    ],
})
export class SettingsSecurityComponent implements OnInit {
    securityForm: UntypedFormGroup;
    userId: string;
    
    // Propiedades para validación dinámica
    passwordLength: boolean = false;
    hasNumber: boolean = false;
    hasLetter: boolean = false;
    hasSpecialChar: boolean = false;

    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _httpClient: HttpClient,
        private _snackBar: MatSnackBar,
        private _cdr: ChangeDetectorRef
    ) {
        // Obtener el ID del usuario del localStorage
        const userString = localStorage.getItem('user');
        if (userString) {
            const userData = JSON.parse(userString);
            this.userId = userData.data?.usuarios_id;
        }
    }

    ngOnInit(): void {
        // Crear el formulario con validaciones
        this.securityForm = this._formBuilder.group({
            currentPassword  : ['', [Validators.required]],
            newPassword     : ['', [
                Validators.required, 
                Validators.minLength(8),
                this.createPasswordValidator()
            ]],
            confirmPassword : ['', [Validators.required]]
        }, { validator: this.passwordMatchValidator });

        // Suscribirse a los cambios de la nueva contraseña
        this.securityForm.get('newPassword').valueChanges.subscribe(value => {
            this.updatePasswordValidation(value);
        });
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
        
        this._cdr.detectChanges();
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

    // Validador personalizado para confirmar contraseña
    passwordMatchValidator(g: UntypedFormGroup) {
        return g.get('newPassword').value === g.get('confirmPassword').value
            ? null : { 'mismatch': true };
    }

    // Método para cambiar la contraseña
    changePassword(): void {
        if (this.securityForm.valid) {
            const passwordData = {
                currentPassword: this.securityForm.get('currentPassword').value,
                newPassword: this.securityForm.get('newPassword').value
            };

            this._httpClient.patch(
                `${environment.baseUrl}/user/${this.userId}/password`,
                passwordData
            ).subscribe({
                next: (response: any) => {
                    console.log('✅ Contraseña actualizada:', response);
                    this.showNotification('Contraseña actualizada exitosamente', 'success');
                    this.securityForm.reset();
                    this._cdr.detectChanges();
                },
                error: (error) => {
                    console.error('❌ Error al actualizar contraseña:', error);
                    let errorMessage = 'Error al actualizar la contraseña';
                    if (error.error?.message === 'La contraseña actual es incorrecta') {
                        errorMessage = 'La contraseña actual es incorrecta';
                        this.securityForm.get('currentPassword').setErrors({ 'incorrect': true });
                    }
                    this.showNotification(errorMessage, 'error');
                    this._cdr.detectChanges();
                }
            });
        } else {
            // Mostrar todos los errores de validación
            Object.keys(this.securityForm.controls).forEach(key => {
                const control = this.securityForm.get(key);
                if (control.invalid) {
                    control.markAsTouched();
                }
            });
            this._cdr.detectChanges();
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
}
