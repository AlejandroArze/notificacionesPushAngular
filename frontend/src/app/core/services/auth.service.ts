import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private _user = new BehaviorSubject<any>(null);
    user$ = this._user.asObservable();

    constructor(
        private _httpClient: HttpClient, 
        private _router: Router,
        private _snackBar: MatSnackBar
    ) {
        // Cargar usuario desde localStorage al iniciar
        this.loadUserFromStorage();
    }

    private loadUserFromStorage() {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const userData = JSON.parse(userStr);
                this._user.next(userData);
            }
        } catch (error) {
            console.error('Error al cargar usuario desde localStorage', error);
            this.logout();
        }
    }

    login(credentials: { email: string; password: string }): Observable<any> {
        return this._httpClient.post(`${environment.baseUrl}/auth/login`, credentials).pipe(
            tap(response => {
                // Guardar usuario y token de manera segura
                localStorage.setItem('user', JSON.stringify(response.user));
                localStorage.setItem('token', response.token);
                this._user.next(response.user);
            }),
            catchError(error => {
                console.error('Error de inicio de sesión:', error);
                this._snackBar.open('Error de inicio de sesión', 'Cerrar', { duration: 3000 });
                return throwError(() => error);
            })
        );
    }

    logout(reason?: string) {
        console.warn('Cerrando sesión:', reason || 'Sin motivo especificado');
        
        // Limpiar datos de manera segura
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        
        // Resetear el usuario
        this._user.next(null);
        
        // Redirigir al login
        this._router.navigate(['/login'], {
            queryParams: { 
                reason: reason || 'session_expired' 
            }
        });
    }

    // Método para validar token
    validateToken(): Observable<boolean> {
        const token = localStorage.getItem('token');
        if (!token) {
            // No cerrar sesión automáticamente
            console.warn('No se encontró token');
            return of(false);
        }

        return this._httpClient.post<{valid: boolean}>(`${environment.baseUrl}/auth/validate-token`, { token }).pipe(
            map(response => {
                if (!response.valid) {
                    console.warn('Token inválido');
                    // No cerrar sesión automáticamente
                    this._snackBar.open('Su sesión ha expirado. Por favor, inicie sesión nuevamente.', 'Cerrar', {
                        duration: 5000
                    });
                }
                return response.valid;
            }),
            catchError(error => {
                console.error('Error al validar token:', error);
                // No cerrar sesión automáticamente
                this._snackBar.open('Error al validar la sesión', 'Cerrar', {
                    duration: 5000
                });
                return of(false);
            })
        );
    }
} 