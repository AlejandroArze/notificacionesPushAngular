import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ErrorLogService {
    constructor(private _httpClient: HttpClient) {}

    // Método para guardar logs en el backend
    guardarLogEnArchivo(mensaje: string, tipo: 'error' | 'info' | 'warn' = 'error'): Observable<any> {
        const logData = {
            mensaje,
            tipo,
            timestamp: new Date().toISOString(),
            // Información adicional del entorno
            navegador: this.obtenerInfoNavegador(),
            url: window.location.href
        };

        return this._httpClient.post('/api/logs/guardar', logData).pipe(
            catchError(error => {
                console.error('Error al guardar log en el servidor', error);
                // Guardar en localStorage como respaldo
                this.guardarLogEnLocalStorage(logData);
                return of(null);
            })
        );
    }

    // Método para guardar logs en localStorage si falla el guardado en backend
    private guardarLogEnLocalStorage(logData: any) {
        try {
            const logs = JSON.parse(localStorage.getItem('error_logs') || '[]');
            logs.push(logData);
            localStorage.setItem('error_logs', JSON.stringify(logs));
        } catch (error) {
            console.error('Error al guardar log en localStorage', error);
        }
    }

    // Método para descargar logs como archivo de texto
    descargarLogsComoArchivo(logs: any[] = []): void {
        // Si no se proporcionan logs, obtener de localStorage
        if (logs.length === 0) {
            logs = JSON.parse(localStorage.getItem('error_logs') || '[]');
        }

        // Formatear logs para legibilidad
        const logTexto = logs.map(log => 
            `[${log.timestamp}] ${log.tipo.toUpperCase()}: ${log.mensaje}\n` +
            `Navegador: ${log.navegador}\n` +
            `URL: ${log.url}\n` +
            `---\n`
        ).join('\n');

        // Crear blob para descarga
        const blob = new Blob([logTexto], { type: 'text/plain' });
        const nombreArchivo = `logs_${new Date().toISOString().replace(/:/g, '-')}.txt`;

        // Crear enlace de descarga
        const enlace = document.createElement('a');
        enlace.href = window.URL.createObjectURL(blob);
        enlace.download = nombreArchivo;
        
        // Simular clic para descargar
        document.body.appendChild(enlace);
        enlace.click();
        document.body.removeChild(enlace);
    }

    // Método para obtener información del navegador
    private obtenerInfoNavegador(): string {
        const navegador = window.navigator;
        return `${navegador.userAgent} | ${navegador.platform}`;
    }

    // Método para registrar logs de una solicitud HTTP
    registrarLogDeError(error: any, contexto?: string): void {
        const mensajeError = this.formatearMensajeError(error, contexto);
        
        // Guardar en backend
        this.guardarLogEnArchivo(mensajeError, 'error');
        
        // Opcional: Mostrar en consola
        console.error(mensajeError);
    }

    // Método para formatear mensaje de error
    private formatearMensajeError(error: any, contexto?: string): string {
        let mensaje = contexto ? `Contexto: ${contexto}\n` : '';
        
        // Información del error
        mensaje += `Mensaje: ${error.message || 'Error desconocido'}\n`;
        
        // Detalles adicionales
        if (error.status) {
            mensaje += `Código de estado: ${error.status}\n`;
        }
        
        if (error.error) {
            mensaje += `Detalles del error: ${JSON.stringify(error.error)}\n`;
        }
        
        // Traza de la pila si está disponible
        if (error.stack) {
            mensaje += `Traza de la pila:\n${error.stack}\n`;
        }
        
        return mensaje;
    }
} 