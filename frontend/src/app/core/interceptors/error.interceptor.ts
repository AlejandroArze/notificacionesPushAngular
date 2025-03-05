import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(
        private router: Router,
        private _snackBar: MatSnackBar
    ) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
                console.group('Error Interceptor');
                console.log('URL:', request.url);
                console.log('Error completo:', error);
                console.log('Tipo de error:', error.constructor.name);
                console.log('Código de estado:', error.status);
                console.log('Mensaje de error:', error.message);
                console.log('Cuerpo del error:', error.error);
                console.groupEnd();

                // Manejo específico de errores 401
                if (error.status === 401) {
                    console.warn('Error de autenticación detectado');
                    
                    // Mostrar mensaje de error sin cerrar sesión
                    this._snackBar.open('No autorizado. Verifique sus credenciales.', 'Cerrar', { 
                        duration: 5000,
                        horizontalPosition: 'center',
                        verticalPosition: 'top'
                    });

                    // Opcional: Redirigir a página de login sin forzar cierre de sesión
                    // this.router.navigate(['/login'], {
                    //     queryParams: { 
                    //         reason: 'unauthorized' 
                    //     }
                    // });
                }

                // Propagar el error para que los componentes puedan manejarlo
                return throwError(() => error);
            })
        );
    }
} 