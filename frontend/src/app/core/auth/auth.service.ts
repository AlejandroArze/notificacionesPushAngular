import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { environment } from '../../../environments/environment'; 
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Injectable({providedIn: 'root'})
export class AuthService {
    private _authenticated: boolean = false;
    private _httpClient = inject(HttpClient);
    private _userService = inject(UserService);
    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? '';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any> {
        return this._httpClient.post(`${environment.baseUrl}/auth/forgot-password`, email); // Usamos el baseUrl correctamente
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(password: string): Observable<any> {
        return this._httpClient.post(`${environment.baseUrl}/auth/reset-password`, password); // Usamos el baseUrl correctamente
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: { email: string; password: string }): Observable<any> {
        console.log('Datos de inicio de sesión:', credentials);
    
        return this._httpClient.post(`${environment.baseUrl}/user/login`, credentials).pipe(
            catchError((error) => {
                console.error('Error de inicio de sesión:', error);
                return throwError(error);
            }),
            switchMap((response: any) => {
                console.log('Respuesta del backend:', response);
    
                // Almacena el token si existe
                if (response.token) { // Aquí cambiamos accessToken por token
                    this.accessToken = response.token; // Almacenar el token correctamente
                    console.log('Token recibido y almacenado:', this.accessToken);
                } else {
                    console.warn('El backend no devolvió un token válido.');
                }

                // Corregir la URL eliminando la duplicación de api/v1
                return this._httpClient.get(`${environment.baseUrl}/user/${response.user.id}`).pipe(
                    switchMap((userData: any) => {
                        this._authenticated = true;
                        this._userService.user = userData;

                        // Siempre actualizar el localStorage con los datos más recientes
                        localStorage.removeItem('user'); // Eliminar datos antiguos
                        localStorage.setItem('user', JSON.stringify(userData)); // Guardar datos nuevos

                        console.log('Datos de usuario actualizados en localStorage:', userData);

                        return of({
                            ...response,
                            user: userData
                        });
                    })
                );
            })
        );
    }
    
    
        

    /**
     * Sign in using the access token
     */
    signInUsingToken(): Observable<any> {
        // Sign in using the token
        return this._httpClient.post(`${environment.baseUrl}/user/loginToken`, {
            accessToken: this.accessToken,
        }).pipe(
            catchError(() =>
                // Return false
                of(false),
            ),
            switchMap((response: any) => {
                // Replace the access token with the new one if it's available on
                // the response object.
                if (response.accessToken) {
                    this.accessToken = response.accessToken;
                }

                // Set the authenticated flag to true
                this._authenticated = true;

                // Store the user on the user service
                this._userService.user = response.user;

                // Return true
                return of(true);
            }),
        );
    }



    /**
     * Sign out
     */
    signOut(): Observable<any> {


         // Limpiar el usuario del servicio UserService
         this._userService.user = null;
        // Remove the access token from the local storage
        localStorage.removeItem('accessToken');

        // Set the authenticated flag to false
        this._authenticated = false;

        // Return the observable
        return of(true);
    }

    /**
     * Sign up
     *
     * @param user
     */
    signUp(user: { 
        firstName: string; 
        lastName: string; 
        username: string; 
        email: string; 
        password: string; 
        role: string; 
    }): Observable<any> {
        return this._httpClient.post(`${environment.baseUrl}/user`, user);
    }
    

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: { email: string; password: string }): Observable<any> {
        return this._httpClient.post(`${environment.baseUrl}/auth/unlock-session`, credentials); // Usamos el baseUrl correctamente
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean> {
        // Check if the user is logged in
        if (this._authenticated) {
            return of(true);
        }

        // Check the access token availability
        if (!this.accessToken) {
            return of(false);
        }

        // Check the access token expire date
        if (AuthUtils.isTokenExpired(this.accessToken)) {
            return of(false);
        }

        // If the access token exists, and it didn't expire, sign in using it
        return this.signInUsingToken();
    }

    /**
     * Get User Roles
     */
    getUserRoles(): string[] {
        const token = this.accessToken;
        if (!token) {
            return [];
        }

        try {
            // Decodifica el token
            const decoded: any = jwtDecode(token);

            // Devuelve los roles
            return decoded.role || [];
        } catch (error) {
            console.error('Error al decodificar el token:', error);
            return [];
        }
    }
    
}
