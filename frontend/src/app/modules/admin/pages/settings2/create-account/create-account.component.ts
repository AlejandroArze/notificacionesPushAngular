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
    ],
})
export class CreateAccountComponent implements OnInit { // Nombre de la clase ajustado
    @Output() accountCreated = new EventEmitter<void>();
    @Output() cancelled = new EventEmitter<void>(); // Añadir este EventEmitter
    
    createAccountForm: UntypedFormGroup;
    imagePreview: string | null = null;
    imageName: string | null = null;

    /**
     * Constructor
     */
    constructor(private _formBuilder: UntypedFormBuilder,
      private cdr: ChangeDetectorRef,
      private _httpClient: HttpClient,
    ) {}

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
            status   : ['1', Validators.required] // Valor por defecto '1' para ACTIVO
        }, { validator: this.passwordMatchValidator });
    }

    /**
     * Maneja la selección de archivos
     */
    onFileSelected(event: any): void {
      const file: File = event.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (e: any) => {
              this.imagePreview = e.target.result;
              this.imageName = file.name;
              console.log('Imagen cargada:', this.imagePreview);  // Verifica la URL generada
              console.log('Nombre de la imagen:', this.imageName);  // Verifica el nombre
              this.cdr.detectChanges(); // Forzar la actualización de la vista
          };
          reader.readAsDataURL(file);
      }
  }

  onSubmit(): void {
    if (this.createAccountForm.valid) {
        const formData = new FormData();
        
        // Agregar los campos del formulario al FormData
        Object.keys(this.createAccountForm.controls).forEach(key => {
            if (key !== 'confirmPassword' && key !== 'photo') {
                formData.append(key, this.createAccountForm.get(key).value);
            }
        });

        // Agregar la foto si existe
        const fileInput = document.querySelector('#photo') as HTMLInputElement;
        if (fileInput?.files?.length > 0) {
            formData.append('image', fileInput.files[0]);
        }

        // Enviar la solicitud al servidor
        this._httpClient.post(`${environment.baseUrl}/user`, formData)
            .subscribe(
                (response) => {
                    console.log('Usuario creado exitosamente', response);
                    this.createAccountForm.reset();
                    this.imagePreview = null;
                    this.imageName = null;
                    this.accountCreated.emit();
                },
                (error) => {
                    console.error('Error al crear usuario', error);
                }
            );
    }
  }

  // Validador personalizado para confirmar contraseña
  passwordMatchValidator(g: UntypedFormGroup) {
    return g.get('password').value === g.get('confirmPassword').value
        ? null : { 'passwordMismatch': true };
  }
}
