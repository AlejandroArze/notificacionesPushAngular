import { Injectable } from '@angular/core';
import { FuseNavigationItem } from '@fuse/components/navigation';
import { FuseMockApiService } from '@fuse/lib/mock-api';
import { jwtDecode } from 'jwt-decode';
import { compactNavigation, defaultNavigation, futuristicNavigation, horizontalNavigation } from 'app/mock-api/common/navigation/data';
import { compactNavigation1, defaultNavigation1, futuristicNavigation1, horizontalNavigation1 } from 'app/mock-api/common/navigation/data1';
import { compactNavigation2, defaultNavigation2, futuristicNavigation2, horizontalNavigation2 } from 'app/mock-api/common/navigation/data2';
import { compactNavigation3, defaultNavigation3, futuristicNavigation3, horizontalNavigation3 } from 'app/mock-api/common/navigation/data3';
import { cloneDeep } from 'lodash-es';

@Injectable({ providedIn: 'root' })
export class NavigationMockApi {
    private _compactNavigation: FuseNavigationItem[];
    private _defaultNavigation: FuseNavigationItem[];
    private _futuristicNavigation: FuseNavigationItem[];
    private _horizontalNavigation: FuseNavigationItem[];

    constructor(private _fuseMockApiService: FuseMockApiService) {
        this.registerHandlers();
    }

    registerHandlers(): void {
        this._fuseMockApiService.onGet('api/common/navigation').reply(() => {
            console.log('Obteniendo la navegación desde el API Mock.');

            // Obtener los roles del usuario
            const userRoles = this._getUserRoles();
            console.log('Roles del usuario obtenidos:', userRoles);

            // Asignar datos según el rol del usuario
            this._setNavigationDataBasedOnRole(userRoles[0]);

            // Preparar la respuesta con la navegación asignada
            const response = {
                compact: cloneDeep(this._compactNavigation),
                default: cloneDeep(this._defaultNavigation),
                futuristic: cloneDeep(this._futuristicNavigation),
                horizontal: cloneDeep(this._horizontalNavigation),
            };

            console.log('Respuesta final de la API Mock:', response);

            return [200, response];
        });
    }

    private _getUserRoles(): number[] {
        const token = localStorage.getItem('token');
        console.log('Token en localStorage:', token);
        if (!token) {
            console.error('No se encontró el token en localStorage');
            return [];
        }

        try {
            const decoded: any = jwtDecode(token);
            console.log('Decoded token:', decoded);
            return decoded.role ? [parseInt(decoded.role, 10)] : [];
        } catch (error) {
            console.error('Error al decodificar el token', error);
            return [];
        }
    }

    private _setNavigationDataBasedOnRole(role: number): void {
        switch (role) {
            case 1:
                this._compactNavigation = compactNavigation1;
                this._defaultNavigation = defaultNavigation1;
                this._futuristicNavigation = futuristicNavigation1;
                this._horizontalNavigation = horizontalNavigation1;
                break;
            case 2:
                this._compactNavigation = compactNavigation2;
                this._defaultNavigation = defaultNavigation2;
                this._futuristicNavigation = futuristicNavigation2;
                this._horizontalNavigation = horizontalNavigation2;
                break;
            case 3:
                this._compactNavigation = compactNavigation3;
                this._defaultNavigation = defaultNavigation3;
                this._futuristicNavigation = futuristicNavigation3;
                this._horizontalNavigation = horizontalNavigation3;
                break;
            default:
                console.warn(`Rol desconocido (${role}), usando la navegación por defecto.`);
                this._compactNavigation = compactNavigation;
                this._defaultNavigation = defaultNavigation;
                this._futuristicNavigation = futuristicNavigation;
                this._horizontalNavigation = horizontalNavigation;
        }
    }
}
