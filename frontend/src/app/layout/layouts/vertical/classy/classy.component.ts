import { NgIf, NgClass } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { FuseFullscreenComponent } from '@fuse/components/fullscreen';
import { FuseLoadingBarComponent } from '@fuse/components/loading-bar';
import { FuseNavigationService, FuseVerticalNavigationComponent } from '@fuse/components/navigation';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { Navigation } from 'app/core/navigation/navigation.types';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { LanguagesComponent } from 'app/layout/common/languages/languages.component';
import { MessagesComponent } from 'app/layout/common/messages/messages.component';
import { NotificationsComponent } from 'app/layout/common/notifications/notifications.component';
import { QuickChatComponent } from 'app/layout/common/quick-chat/quick-chat.component';
import { SearchComponent } from 'app/layout/common/search/search.component';
import { ShortcutsComponent } from 'app/layout/common/shortcuts/shortcuts.component';
import { UserComponent } from 'app/layout/common/user/user.component';
import { Subject, takeUntil } from 'rxjs';
import { environment } from 'environments/environment';
import { SchemeComponent } from 'app/layout/common/scheme/scheme.component';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';

@Component({
    selector     : 'classy-layout',
    templateUrl  : './classy.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone   : true,
    imports      : [
        FuseLoadingBarComponent, 
        FuseVerticalNavigationComponent, 
        NotificationsComponent, 
        UserComponent, 
        NgIf,
        NgClass, 
        MatIconModule, 
        MatButtonModule, 
        LanguagesComponent, 
        FuseFullscreenComponent, 
        SearchComponent, 
        ShortcutsComponent, 
        MessagesComponent, 
        RouterOutlet, 
        QuickChatComponent, 
        SchemeComponent
    ],
})
export class ClassyLayoutComponent implements OnInit, OnDestroy
{
    isScreenSmall: boolean;
    navigation: Navigation;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    user: any;
    private tokenCheckInterval: Subscription;

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _navigationService: NavigationService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _fuseNavigationService: FuseNavigationService,
        private _httpClient: HttpClient,
    )
    {
        this.loadUserData();
        this.initializeTokenCheck();
    }

    /**
     * Cargar datos del usuario desde localStorage
     */
    private loadUserData(): void {
        const userString = localStorage.getItem('user');
        if (userString) {
            try {
                const userData = JSON.parse(userString);
                console.log('Datos completos del usuario:', userData);
                
                if (userData?.data) {
                    // Intentar obtener la imagen de diferentes propiedades posibles
                    let userImage = userData.data.imagen || userData.data.image || userData.data.photo;
                    console.log('Path original de la imagen:', userImage);
                    
                    // Construir URL de la imagen
                    let avatarUrl = null;
                    if (userImage) {
                        // Limpiar la ruta de la imagen
                        userImage = userImage.replace(/^\/+/, ''); // Eliminar slashes iniciales
                        userImage = userImage.replace(/\/+/g, '/'); // Eliminar dobles slashes
                        
                        // Construir URL completa
                        avatarUrl = userImage.startsWith('http') ? 
                            userImage : 
                            `${environment.baseUrl}/${userImage}`;
                            
                        console.log('URL final de la imagen:', avatarUrl);
                    }
                    
                    const nombres = userData.data.nombres || '';
                    const apellidos = userData.data.apellidos || '';
                    const primerNombre = nombres.split(' ')[0];
                    const primerApellido = apellidos.split(' ')[0];
                    const iniciales = this.getInitials(primerNombre, primerApellido);
                    
                    this.user = {
                        id: userData.data.usuarios_id,
                        name: `${primerNombre} ${primerApellido}`.trim(),
                        email: userData.data.email || '',
                        avatar: avatarUrl,
                        status: localStorage.getItem('userStatus') || 'online',
                        initials: iniciales
                    };
                    
                    console.log('Objeto usuario configurado:', this.user);
                }
            } catch (error) {
                console.error('Error al procesar datos del usuario:', error);
                // Configurar usuario por defecto en caso de error
                this.user = {
                    name: 'Usuario',
                    email: 'No disponible',
                    avatar: null,
                    status: 'online',
                    initials: 'U'
                };
            }
        }
    }

    /**
     * Actualiza el estado del usuario
     */
    updateUserStatus(status: 'online' | 'away' | 'busy' | 'not-visible'): void {
        if (this.user) {
            this.user.status = status;
            localStorage.setItem('userStatus', status);
        }
    }

    /**
     * Obtiene las iniciales del nombre y apellido
     */
    private getInitials(nombres: string, apellidos: string): string {
        const nombreInicial = nombres ? nombres.charAt(0) : '';
        const apellidoInicial = apellidos ? apellidos.charAt(0) : '';
        return (nombreInicial + apellidoInicial).toUpperCase() || 'U';
    }

    /**
     * Obtiene la URL completa de la imagen
     */
    getImageUrl(imagePath: string): string {
        if (!imagePath) {
            console.log('No hay path de imagen');
            return null;
        }

        console.log('Procesando path de imagen:', imagePath);
        
        // Si ya es una URL completa, retornarla
        if (imagePath.startsWith('http')) {
            console.log('URL completa detectada:', imagePath);
            return imagePath;
        }

        // Limpiar y construir la URL
        const cleanPath = imagePath.replace(/^\/+/, '');
        const fullUrl = `${environment.baseUrl}/${cleanPath}`;
        console.log('URL construida:', fullUrl);
        
        return fullUrl;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for current year
     */
    get currentYear(): number
    {
        return new Date().getFullYear();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Recargar datos del usuario al iniciar
        this.loadUserData();

        // Suscribirse a cambios en el localStorage
        window.addEventListener('storage', () => {
            console.log('Cambios detectados en localStorage');
            this.loadUserData();
        });

        // Suscribirse al evento específico de actualización de datos del usuario
        window.addEventListener('userDataUpdated', () => {
            console.log('Actualización de datos de usuario detectada');
            this.loadUserData();
        });

        // Subscribe to navigation data
        this._navigationService.navigation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((navigation: Navigation) => {
                this.navigation = navigation;
            });

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) => {
                this.isScreenSmall = !matchingAliases.includes('md');
            });

        // Iniciar verificación de token
        this.checkTokenAndUpdateUser();
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Remover los listeners
        window.removeEventListener('storage', () => this.loadUserData());
        window.removeEventListener('userDataUpdated', () => this.loadUserData());
        
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();

        // Cancelar la suscripción del intervalo
        if (this.tokenCheckInterval) {
            this.tokenCheckInterval.unsubscribe();
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle navigation
     *
     * @param name
     */
    toggleNavigation(name: string): void {
        const navigation = this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>(name);
        if (navigation) {
            navigation.toggle();
        }
    }

    /**
     * Inicializa la verificación periódica del token
     */
    private initializeTokenCheck(): void {
        // Verificar cada 5 minutos (300000 ms)
        this.tokenCheckInterval = interval(300000).subscribe(() => {
            this.checkTokenAndUpdateUser();
        });
    }

    /**
     * Verifica el token y actualiza los datos del usuario
     */
    private checkTokenAndUpdateUser(): void {
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
            this.handleInvalidToken();
            return;
        }

        this._httpClient.get(`${environment.baseUrl}/api/users/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).subscribe({
            next: (response: any) => {
                if (response?.data) {
                    // Obtener datos actuales del localStorage
                    const currentUserString = localStorage.getItem('user');
                    const currentUser = currentUserString ? JSON.parse(currentUserString) : null;

                    // Verificar si hay cambios comparando los campos relevantes
                    const hasChanges = this.checkForUserChanges(currentUser?.data, response.data);

                    if (hasChanges) {
                        console.log('Se detectaron cambios en los datos del usuario, actualizando...');
                        localStorage.setItem('user', JSON.stringify(response));
                        this.loadUserData();
                    } else {
                        console.log('No hay cambios en los datos del usuario');
                    }
                }
            },
            error: (error: HttpErrorResponse) => {
                if (error.status === 401 || error.status === 403) {
                    this.handleInvalidToken();
                }
            }
        });
    }

    /**
     * Compara los datos actuales del usuario con los nuevos para detectar cambios
     */
    private checkForUserChanges(currentData: any, newData: any): boolean {
        if (!currentData || !newData) {
            return true; // Si no hay datos actuales o nuevos, consideramos que hay cambios
        }

        // Lista de campos a comparar
        const fieldsToCompare = [
            'nombres',
            'apellidos',
            'email',
            'imagen',
            'image',
            'photo',
            'usuarios_id'
        ];

        // Comparar cada campo
        return fieldsToCompare.some(field => {
            const currentValue = currentData[field];
            const newValue = newData[field];
            
            // Si los valores son diferentes, hay cambios
            if (currentValue !== newValue) {
                console.log(`Cambio detectado en ${field}:`, {
                    anterior: currentValue,
                    nuevo: newValue
                });
                return true;
            }
            return false;
        });
    }

    /**
     * Maneja el caso de token inválido o expirado
     */
    private handleInvalidToken(): void {
        // Limpiar datos de sesión
        localStorage.clear();
        // Redirigir a sign-out
        this._router.navigate(['/sign-out']);
    }
}
