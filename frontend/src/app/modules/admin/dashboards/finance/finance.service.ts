import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from 'environments/environment';
import { Notificacion, NotificacionPaginacion } from './finance.types';
import { map } from 'rxjs/operators';

export interface ServiceResponse {
    message: string;
    data: {
        total: number;
        perPage: number;
        currentPage: number;
        totalPages: number;
        data: Array<{
            servicios_id: number;
            nombreSolicitante: string;
            tipo: string;
            tecnicoAsignado: number;
            fechaInicio: string;
            fechaTerminado: string;
            numero: number;
            // ... otros campos que necesites
        }>;
    };
}

export interface MetricsResponse {
    message: string;
    data: {
        resumen: {
            total_servicios: number;
            servicios_terminados: number;
            tiempo_promedio_general: number;
        };
        distribucionTipos: {
            labels: string[];
            data: Array<{
                tipo: string;
                cantidad: number;
                porcentaje: number;
            }>;
        };
        rendimientoTecnicos: Array<{
            tecnico_id: number;
            tecnico: string;
            total_servicios: number;
            completados: number;
            tiempo_promedio_horas: number;
            tiempo_promedio_minutos: number;
            tiempo_promedio_segundos: number;
        }>;
        tiemposResolucion: Array<{
            tipo: string;
            tiempo_promedio_horas: number;
            tiempo_promedio_minutos: number;
            tiempo_promedio_segundos: number;
            total_servicios: number;
        }>;
    };
}

interface TipoServicioMapping {
    [key: string]: string;
    'ASISTENCIA EN SITIO': 'ASISTENCIA';
    'ASISTENCIA REMOTA': 'REMOTA';
}

@Injectable({providedIn: 'root'})
export class FinanceService {
    private readonly _apiUrl = environment.baseUrl;
    private readonly tipoServicioMapping: TipoServicioMapping = {
        'ASISTENCIA EN SITIO': 'ASISTENCIA',
        'ASISTENCIA REMOTA': 'REMOTA'
    };

    constructor(private _httpClient: HttpClient) {}

    getData(): Observable<any> {
        // Obtener datos iniciales con valores por defecto
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        return this.consultarServicios({
            fechaInicio: this.formatDate(firstDay),
            fechaFin: this.formatDate(lastDay),
            tipoServicio: 'TODOS',
            tecnico: 'TODOS',
            page: 1,
            limit: 10
        });
    }

    private formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    private mapTipoServicio(tipo: string): string {
        return this.tipoServicioMapping[tipo] || tipo;
    }

    consultarServicios(params: {
        fechaInicio: string;
        fechaFin: string;
        tipoServicio: string;
        tecnico: string;
        page: number;
        limit: number;
    }): Observable<ServiceResponse> {
        let httpParams = new HttpParams()
            .set('fechaInicio', params.fechaInicio)
            .set('fechaFin', params.fechaFin)
            .set('page', params.page.toString())
            .set('limit', params.limit.toString())
            .set('estado', 'TERMINADO');

        if (params.tipoServicio !== 'TODOS') {
            httpParams = httpParams.set('tipo', this.mapTipoServicio(params.tipoServicio));
        }

        if (params.tecnico !== 'TODOS') {
            httpParams = httpParams.set('tecnicoAsignado', params.tecnico);
        }

        return this._httpClient.get<ServiceResponse>(`${this._apiUrl}/service/date-range`, { params: httpParams });
    }

    consultarTodosServicios(params: {
        fechaInicio: string;
        fechaFin: string;
        tipoServicio: string;
        tecnico: string;
    }): Observable<ServiceResponse> {
        let httpParams = new HttpParams()
            .set('fechaInicio', params.fechaInicio)
            .set('fechaFin', params.fechaFin)
            .set('page', '1')
            .set('limit', '1000')
            .set('estado', 'TERMINADO');

        if (params.tipoServicio !== 'TODOS') {
            httpParams = httpParams.set('tipo', this.mapTipoServicio(params.tipoServicio));
        }

        if (params.tecnico !== 'TODOS') {
            httpParams = httpParams.set('tecnicoAsignado', params.tecnico);
        }

        return this._httpClient.get<ServiceResponse>(`${this._apiUrl}/service/date-range`, { params: httpParams });
    }

    obtenerMetricas(params: {
        fechaInicio: string;
        fechaFin: string;
        tipoServicio: string;
        tecnico: string;
    }): Observable<MetricsResponse> {
        let httpParams = new HttpParams()
            .set('fechaInicio', params.fechaInicio)
            .set('fechaFin', params.fechaFin)
            .set('estado', 'TERMINADO');

        if (params.tipoServicio !== 'TODOS') {
            httpParams = httpParams.set('tipo', this.mapTipoServicio(params.tipoServicio));
        }

        if (params.tecnico !== 'TODOS') {
            httpParams = httpParams.set('tecnicoAsignado', params.tecnico);
        }

        return this._httpClient.get<MetricsResponse>(`${this._apiUrl}/service/metrics`, { params: httpParams });
    }

    // Método para obtener notificaciones de ejemplo
    obtenerNotificaciones(): Observable<Notificacion[]> {
        const notificacionesEjemplo: Notificacion[] = [
            {
                id: 1,
                uuid: 'uuid-1',
                titulo: 'Mantenimiento Programado',
                mensaje: 'Se realizará mantenimiento en el sistema el próximo lunes',
                tipoEnvio: 'grupo',
                estado: 'programada',
                fechaCreacion: new Date('2024-02-15T10:00:00'),
                responsableCreacion: 'Juan Pérez',
                roles: ['admin', 'tecnico'],
                unidades: ['Sistemas', 'Soporte'],
                programarEnvio: true,
                fechaProgramada: new Date('2024-02-15T10:00:00'),
                horaProgramada: '10:00',
                tipoProgramacion: 'unica',
                destinatarios: [
                    { usuarioId: '1', nombre: 'María González', estado: 'pendiente' },
                    { usuarioId: '2', nombre: 'Carlos Rodríguez', estado: 'pendiente' }
                ]
            },
            {
                id: 2,
                uuid: 'uuid-2',
                titulo: 'Actualización de Sistemas',
                mensaje: 'Nueva versión del software disponible con mejoras de seguridad',
                tipoEnvio: 'todos',
                estado: 'enviada',
                fechaCreacion: new Date('2024-02-20T14:30:00'),
                responsableCreacion: 'Ana Martínez',
                tipos: ['software', 'seguridad'],
                fechaEnvio: new Date('2024-02-20T14:30:00'),
                destinatarios: [
                    { usuarioId: '3', nombre: 'Luis Fernández', estado: 'leída' },
                    { usuarioId: '4', nombre: 'Elena Sánchez', estado: 'enviada' }
                ]
            },
            {
                id: 3,
                uuid: 'uuid-3',
                titulo: 'Capacitación de Seguridad',
                mensaje: 'Próximo taller de seguridad informática para todo el personal de TI',
                tipoEnvio: 'grupo',
                estado: 'programada',
                fechaCreacion: new Date('2024-03-10T09:45:00'),
                responsableCreacion: 'Pedro Ramírez',
                roles: ['tecnico'],
                unidades: ['Sistemas'],
                programarEnvio: true,
                fechaProgramada: new Date('2024-03-10T14:00:00'),
                horaProgramada: '14:00',
                tipoProgramacion: 'recurrente',
                frecuencia: 'mensual',
                diasSeleccionados: { 
                    lunes: true, 
                    miercoles: true 
                }
            }
        ];

        return of(notificacionesEjemplo);
    }

    // Método para obtener una notificación por ID (ejemplo)
    obtenerNotificacionPorId(id: number): Observable<Notificacion> {
        return this.obtenerNotificaciones().pipe(
            map(notificaciones => notificaciones.find(n => n.id === id))
        );
    }

    // Método para obtener notificaciones paginadas con datos de ejemplo
    obtenerNotificacionesPaginadas(
        page: number = 1, 
        limit: number = 10
    ): Observable<{
        data: Notificacion[];
        total: number;
        page: number;
        perPage: number;
        totalPages: number;
    }> {
        return this.obtenerNotificaciones().pipe(
            map(notificaciones => {
                const startIndex = (page - 1) * limit;
                const endIndex = startIndex + limit;
                const paginatedData = notificaciones.slice(startIndex, endIndex);
                const datosFinales = paginatedData.length > 0 ? paginatedData : notificaciones.slice(0, limit);
                return {
                    data: datosFinales,
                    total: notificaciones.length,
                    page,
                    perPage: limit,
                    totalPages: Math.ceil(notificaciones.length / limit)
                };
            })
        );
    }

    // Método para obtener servicios
    obtenerServicios(
        fechaInicio: string, 
        fechaFin: string, 
        tipoServicio: string, 
        tecnico: string, 
        page: number = 1, 
        limit: number = 10
    ): Observable<{
        data: {
            data: Array<{
                servicios_id: number;
                nombreSolicitante: string;
                tipo: string;
                tecnicoAsignado: number;
                fechaInicio: string;
                fechaTerminado: string;
                numero: number;
            }>;
            total: number;
        }
    }> {
        const params = new HttpParams()
            .set('fechaInicio', fechaInicio)
            .set('fechaFin', fechaFin)
            .set('tipoServicio', tipoServicio)
            .set('tecnico', tecnico)
            .set('page', page.toString())
            .set('limit', limit.toString());

        return this._httpClient.get<{
            data: {
                data: Array<{
                    servicios_id: number;
                    nombreSolicitante: string;
                    tipo: string;
                    tecnicoAsignado: number;
                    fechaInicio: string;
                    fechaTerminado: string;
                    numero: number;
                }>;
                total: number;
            }
        }>(`${this._apiUrl}/servicios`, { params });
    }
}
