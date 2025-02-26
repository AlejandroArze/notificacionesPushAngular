import { Injectable } from '@angular/core';
import { FuseNavigationItem, FuseNavigationService } from '@fuse/components/navigation';
import { FuseMockApiService } from '@fuse/lib/mock-api';
import { contacts } from 'app/mock-api/apps/contacts/data';
import { tasks } from 'app/mock-api/apps/tasks/data';
import { defaultNavigation } from 'app/mock-api/common/navigation/data';
import { cloneDeep } from 'lodash-es';
import { jwtDecode } from 'jwt-decode'; // Importa jwt-decode

@Injectable({providedIn: 'root'})
export class SearchMockApi {
    private readonly _defaultNavigation: FuseNavigationItem[] = defaultNavigation;
    private readonly _contacts: any[] = contacts;
    private readonly _tasks: any[] = tasks;

    /**
     * Constructor
     */
    constructor(
        private _fuseMockApiService: FuseMockApiService,
        private _fuseNavigationService: FuseNavigationService,
    ) {
        // Register Mock API handlers
        this.registerHandlers();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Register Mock API handlers
     */
    registerHandlers(): void {
        // Get the flat navigation and store it
        const flatNavigation = this._fuseNavigationService.getFlatNavigation(this._defaultNavigation);

        // -----------------------------------------------------------------------------------------------------
        // @ Search results - GET
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onPost('api/common/search')
            .reply(({request}) => {
                // Get the search query
                const query = cloneDeep(request.body.query.toLowerCase());

                // If the search query is an empty string,
                // return an empty array
                if (query === '') {
                    return [200, {results: []}];
                }

                // Obtener roles del usuario
                const userRoles = this._getUserRoles();

                // Filtrar los resultados
                const contactsResults = cloneDeep(this._contacts)
                    .filter(contact => contact.name.toLowerCase().includes(query));

                const pagesResults = cloneDeep(flatNavigation)
                    .filter(page => 
                        (page.title?.toLowerCase().includes(query) || (page.subtitle && page.subtitle.includes(query)))
                        && this._hasAccessToPage(page, userRoles) // Filtrar por roles
                    );

                const tasksResults = cloneDeep(this._tasks)
                    .filter(task => task.title.toLowerCase().includes(query));

                // Prepare the results array
                const results = [];

                // If there are contacts results...
                if (contactsResults.length > 0) {
                    // Normalize the results
                    contactsResults.forEach((result) => {
                        // Add a link
                        result.link = '/apps/contacts/' + result.id;

                        // Add the name as the value
                        result.value = result.name;
                    });

                    // Add to the results
                    results.push({
                        id     : 'contacts',
                        label  : 'Contacts',
                        results: contactsResults,
                    });
                }

                // If there are page results...
                if (pagesResults.length > 0) {
                    // Normalize the results
                    pagesResults.forEach((result: any) => {
                        // Add the page title as the value
                        result.value = result.title;
                    });

                    // Add to the results
                    results.push({
                        id     : 'pages',
                        label  : 'Pages',
                        results: pagesResults,
                    });
                }

                // If there are tasks results...
                if (tasksResults.length > 0) {
                    // Normalize the results
                    tasksResults.forEach((result) => {
                        // Add a link
                        result.link = '/apps/tasks/' + result.id;

                        // Add the title as the value
                        result.value = result.title;
                    });

                    // Add to the results
                    results.push({
                        id     : 'tasks',
                        label  : 'Tasks',
                        results: tasksResults,
                    });
                }

                // Return the response
                return [200, results];
            });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Decodifica el token JWT y extrae los roles del usuario
     */
    private _getUserRoles(): number[] {
        const token = localStorage.getItem('token');
        if (!token) {
            return []; // Retorna un arreglo vacío si no hay token
        }

        try {
            const decoded: any = jwtDecode(token);
            console.log('Decoded token:', decoded); // Para verificar la decodificación
            return Array.isArray(decoded.role) ? decoded.role : [decoded.role];
        } catch (error) {
            console.error('Error al decodificar el token', error);
            return []; // Retorna un arreglo vacío si hay un error al decodificar
        }
    }

    /**
     * Filtra los elementos de la página según los roles del usuario
     */
    private _hasAccessToPage(page: any, roles: number[]): boolean {
        if (page.roles) {
            return page.roles.some(role => roles.includes(role));
        }
        return true; // Si no tiene restricciones de roles, se incluye
    }
}
