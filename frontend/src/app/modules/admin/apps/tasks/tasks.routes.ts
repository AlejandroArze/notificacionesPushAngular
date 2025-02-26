import { inject } from '@angular/core'; // Importa la función 'inject' para la inyección de dependencias
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, Routes } from '@angular/router'; // Importa módulos necesarios para rutas
import { TasksDetailsComponent } from 'app/modules/admin/apps/tasks/details/details.component'; // Componente de detalles de tareas
import { TasksListComponent } from 'app/modules/admin/apps/tasks/list/list.component'; // Componente de lista de tareas
import { TasksComponent } from 'app/modules/admin/apps/tasks/tasks.component'; // Componente principal de tareas
import { TasksService } from 'app/modules/admin/apps/tasks/tasks.service'; // Servicio para gestionar las tareas
import { catchError, throwError, forkJoin, map } from 'rxjs'; // Operadores de RxJS para manejo de errores

/**
 * Resolución de tareas
 *
 * @param route Ruta activa con los parámetros actuales
 * @param state Estado del enrutador
 */
const taskResolver = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const tasksService = inject(TasksService); // Inyecta el servicio de tareas
    const router = inject(Router); // Inyecta el enrutador

    const id = Number(route.paramMap.get('id')); // Convierte el parámetro 'id' de la ruta a un número

    if (isNaN(id)) { // Verifica si el 'id' no es un número válido
        console.error('Invalid ID provided'); // Registra un error en la consola
        router.navigateByUrl('/tasks'); // Redirige al usuario a la lista de tareas
        return throwError(() => new Error('Invalid ID provided')); // Lanza un error
    }

    return tasksService.getTaskById(id).pipe(
        catchError((error) => { // Maneja errores al obtener la tarea
            console.error(error); // Registra el error en la consola

            const parentUrl = state.url.split('/').slice(0, -1).join('/'); // Obtiene la URL del nivel superior

            router.navigateByUrl(parentUrl); // Navega a la URL del nivel superior

            return throwError(() => new Error(error)); // Lanza un nuevo error
        })
    );
};

/**
 * Verificación de desactivación del componente de detalles de tareas
 *
 * @param component Componente actual de detalles de tareas
 * @param currentRoute Ruta activa actual
 * @param currentState Estado actual del enrutador
 * @param nextState Siguiente estado del enrutador
 */
const canDeactivateTasksDetails = (
    component: TasksDetailsComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot
) => {
    let nextRoute: ActivatedRouteSnapshot = nextState.root; // Obtiene la siguiente ruta
    while (nextRoute.firstChild) { // Recorre las rutas anidadas
        nextRoute = nextRoute.firstChild;
    }

    if (!nextState.url.includes('/tasks')) { // Si la siguiente URL no contiene '/tasks'
        return true; // Permite la navegación
    }

    if (nextRoute.paramMap.get('id')) { // Si la siguiente ruta contiene un 'id'
        return true; // Permite la navegación
    }

    return component.closeDrawer().then(() => true); // Cierra el panel lateral antes de navegar
};

export default [
    {
        path: '', // Ruta base
        component: TasksComponent, // Componente principal de tareas
        resolve: {
            tags: () => inject(TasksService).getTags(), // Obtiene las etiquetas antes de cargar el componente
        },
        children: [
            {
                path: '', // Ruta para la lista de tareas
                component: TasksListComponent, // Componente de lista de tareas
                resolve: {
                    tasks: () => {
                        const service = inject(TasksService);
                        const tipos = ['ASISTENCIA', 'EN LABORATORIO', 'REMOTA'];
                        return forkJoin(
                            tipos.map(tipo => service.getServicesByType(tipo))
                        ).pipe(
                            map(results => {
                                // Combinar todos los servicios
                                const allServices = results.reduce((acc, curr) => 
                                    [...acc, ...curr.services], []);
                                // Actualizar el estado del servicio
                                service.updateServices(allServices);
                                return allServices;
                            })
                        );
                    }
                },
                children: [
                    {
                        path: ':id', // Ruta para los detalles de una tarea específica
                        component: TasksDetailsComponent, // Componente de detalles de tareas
                        resolve: {
                            task: taskResolver, // Resuelve los datos de la tarea específica
                        },
                        canDeactivate: [canDeactivateTasksDetails], // Verifica si se puede desactivar el componente actual
                    },
                ],
            },
        ],
    },
] as Routes;
