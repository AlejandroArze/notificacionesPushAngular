import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

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
}
