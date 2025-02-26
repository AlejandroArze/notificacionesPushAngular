import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Navigation } from 'app/core/navigation/navigation.types';
import { Observable, ReplaySubject, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { FuseNavigationItem } from '@fuse/components/navigation/navigation.types';  // Importación correcta

@Injectable({ providedIn: 'root' })
export class NavigationService {
    private _httpClient = inject(HttpClient);
    private _navigation: ReplaySubject<Navigation> = new ReplaySubject<Navigation>(1);

    /**
     * Getter for navigation
     */
    get navigation$(): Observable<Navigation> {
        return this._navigation.asObservable();
    }

    /**
     * Get all navigation data filtered by user roles
     */
    get(): Observable<Navigation> {
        // Decode token and extract roles
        const token = localStorage.getItem('token');
        let roles: number[] = [];

        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                console.log('Decoded JWT token:', decoded);  // Log de token decodificado
                // Asegúrate de que el role sea un número y existe
                roles = decoded.role ? Array.isArray(decoded.role) ? decoded.role : [Number(decoded.role)] : [];
                console.log('Roles extracted from token:', roles);  // Log de los roles extraídos
            } catch (error) {
                console.error('Error decoding token:', error);
            }
        } else {
            console.log('No token found in localStorage');
        }

        // Fetch navigation from the API
        return this._httpClient.get<Navigation>('api/common/navigation').pipe(
            tap((navigation) => {
                console.log('Raw navigation received:', navigation);  // Log de la navegación cruda recibida

                // Filter the navigation based on roles (assuming roles are numeric and correspond to some logic)
                const filteredNavigation = this.filterNavigationByRole(navigation, roles);
                console.log('Filtered navigation:', filteredNavigation);  // Log de la navegación filtrada

                // Send filtered navigation to the ReplaySubject
                this._navigation.next(filteredNavigation);
            })
        );
    }

    // Method to filter navigation by roles
    private filterNavigationByRole(navigation: Navigation, roles: number[]): Navigation {
        console.log('Filtering navigation with roles:', roles);  // Log de los roles para el filtrado
        return {
            compact: navigation.compact.filter(item => this.isAuthorizedForRole(item, roles)),
            default: navigation.default.filter(item => this.isAuthorizedForRole(item, roles)),
            futuristic: navigation.futuristic.filter(item => this.isAuthorizedForRole(item, roles)),
            horizontal: navigation.horizontal.filter(item => this.isAuthorizedForRole(item, roles)),
        };
    }

    // Method to check if an item is authorized for the given roles
    private isAuthorizedForRole(item: FuseNavigationItem, roles: number[]): boolean {
        console.log('Checking if item is authorized:', item);  // Log de cada ítem de navegación
        // Assume each item has a 'roles' field indicating the roles that can access it
        if (!item.roles || item.roles.length === 0) {
            console.log('Item has no roles specified, accessible by everyone');
            return true; // If no roles are specified, it's available to everyone
        }

        // Ensure roles are compared correctly
        const isAuthorized = item.roles.some(role => roles.includes(role));
        console.log('Item authorization status:', isAuthorized);  // Log del resultado de la autorización
        return isAuthorized;
    }
}
