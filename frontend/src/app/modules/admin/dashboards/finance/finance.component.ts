import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FinanceService } from './finance.service';
import { ScrumboardService } from 'app/modules/admin/apps/scrumboard/scrumboard.service';
import { Subject, takeUntil } from 'rxjs';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import { MetricsResponse } from './finance.service';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { environment } from 'environments/environment';
import { HttpClient } from '@angular/common/http';
import { Notificacion } from './finance.types';
import { animate, state, style, transition, trigger } from '@angular/animations';

// Registrar el plugin
Chart.register(ChartDataLabels);

// Extender el tipo jsPDF para incluir autoTable
interface jsPDFWithPlugin extends jsPDF {
    autoTable: (options: any) => jsPDF;
    internal: any;
}

@Component({
    selector: 'finance',
    templateUrl: './finance.component.html',
    animations: [
        trigger('detailExpand', [
            state('collapsed', style({height: '0px', minHeight: '0'})),
            state('expanded', style({height: '*'})),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
        ])
    ],
    styles: [
        /* language=SCSS */
        `
            .detail-row {
                height: 0;
                line-height: 0;
                overflow: hidden;
                visibility: collapse;
                opacity: 0;
                transition: all 225ms cubic-bezier(0.4, 0.0, 0.2, 1);
            }

            .detail-row.expanded {
                height: auto;
                line-height: normal;
                visibility: visible;
                opacity: 1;
            }

            .detail-content {
                background: white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }

            @media (prefers-color-scheme: dark) {
                .detail-content {
                    background: #1e293b;
                }
            }

            .mat-mdc-button-touch-target {
                transition: transform 0.3s ease;
                
                &.rotate-180 {
                    transform: rotate(180deg);
                }
            }

            .mat-expansion-panel {
                box-shadow: none;
                background: transparent;

                &:not(.mat-expanded) {
                    .mat-expansion-panel-header {
                        &:not([aria-disabled='true']) {
                            &.cdk-keyboard-focused,
                            &.cdk-program-focused,
                            &:hover {
                                background: transparent;
                            }
                        }
                    }
                }
            }
        `
    ],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatSelectModule,
        MatButtonModule,
        MatTableModule,
        MatFormFieldModule,
        MatPaginatorModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatInputModule,
        MatIconModule,
        MatTooltipModule,
    ],
})
export class FinanceComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild('distribucionChart') distribucionChart: ElementRef;
    @ViewChild('rendimientoChart') rendimientoChart: ElementRef;
    @ViewChild('tiemposChart') tiemposChart: ElementRef;
    @ViewChild('notificacionesPaginator') notificacionesPaginator: MatPaginator;
    
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    // Variables para mostrar en el datepicker
    fechaInicioDisplay: Date;
    fechaFinDisplay: Date;
    
    // Variables para la API
    fechaInicio: string;
    fechaFin: string;
    tipoServicio: string = 'TODOS';
    tecnico: string = 'TODOS';
    
    tecnicos: any[] = [];
    totalItems: number = 0;
    pageSize: number = 10;
    currentPage: number = 0;

    displayedColumns: string[] = [
        'titulo', 
        'estado', 
        'tipoEnvio', 
        'fechaCreacion', 
        'responsable', 
        'detalles'
    ];
    
    dataSource = new MatTableDataSource<Notificacion>([]);

    private tecnicosMap: Map<number, string> = new Map();
    
    // Agregar variable para tracking del filtro activo
    selectedDateFilter: 'day' | 'week' | 'month' | 'year' = 'week'; // Por defecto semana

    // Agregar variable para las métricas
    metrics: MetricsResponse['data'] | null = null;
    rendimientoTecnicos: Array<{
        tecnico_id: number;
        tecnico: string;
        total_servicios: number;
        completados: number;
        tiempo_promedio_horas: number;
        tiempo_promedio_minutos: number;
        tiempo_promedio_segundos: number;
    }> = [];
    
    // Referencias a los gráficos
    private charts: { [key: string]: Chart } = {};

    // Agregar observer para cambios en el tema
    private observer: MutationObserver | null = null;

    // Variable para controlar qué tooltip se muestra
    selectedTecnicoIndex: number | null = null;

    // Variable para almacenar las URLs de las imágenes
    private imageUrls: Map<number, string> = new Map();

    notificaciones: Notificacion[] = [];
    notificationPageSize: number = 10;
    totalNotificaciones: number = 0;
    paginaActualNotificaciones: number = 1;
    selectedNotificacion: Notificacion | null = null;

    isExpansionDetailRow = (i: number, row: any) => row.hasOwnProperty('detailRow');

    constructor(
        private _financeService: FinanceService,
        private _scrumboardService: ScrumboardService,
        private http: HttpClient,
        private cdr: ChangeDetectorRef
    ) {
        // Inicializar con últimos 7 días por defecto
        const hoy = new Date();
        const hace7Dias = new Date();
        hace7Dias.setDate(hoy.getDate() - 7);
        
        // Inicializar las fechas para mostrar
        this.fechaInicioDisplay = hace7Dias;
        this.fechaFinDisplay = hoy;
        
        // Inicializar las fechas para la API
        this.fechaInicio = this.formatDateForApi(hace7Dias);
        // Ajustar la fecha fin si es el día actual
        const fechaFinAjustada = this.adjustEndDate(hoy);
        this.fechaFin = this.formatDateForApi(fechaFinAjustada);

        // Agregar observer para cambios en el tema
        this.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    this.updateCharts();
                }
            });
        });

        // Observar cambios en la clase del elemento html
        this.observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });
    }

    ngOnInit(): void {
        console.log('Inicializando componente Finance');
        
        // Configurar el tamaño de página inicial
        this.notificationPageSize = 10;
        
        this._scrumboardService.getTecnicos()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((tecnicos) => {
                this.tecnicos = tecnicos;
                tecnicos.forEach(tecnico => {
                    if (tecnico.id) {
                        this.tecnicosMap.set(tecnico.id, tecnico.nombre);
                    }
                });
            });

        // Cargar notificaciones al iniciar
        this.cargarNotificaciones();
    }

    ngAfterViewInit() {
        // Suscribirse a los cambios de página
        this.paginator.page
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                // Actualizar el tamaño de página
                this.pageSize = this.paginator.pageSize;
                this.loadPage();
            });

        // Cargar métricas iniciales
        this.loadMetrics();

        // Configurar paginación de notificaciones
        if (this.notificacionesPaginator) {
            this.notificacionesPaginator.page
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((event) => {
                    console.log('Evento de paginador:', event);
                    this.onPageChange(event);
                });
        }
    }

    ngOnDestroy(): void {
        // Destruir gráficos al salir
        Object.values(this.charts).forEach(chart => chart.destroy());
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();

        // Desconectar el observer
        if (this.observer) {
            this.observer.disconnect();
        }
    }

    consultar(): void {
        this.currentPage = 0;
        if (this.paginator) {
            this.paginator.pageIndex = 0;
            this.pageSize = this.paginator.pageSize;
        }
        this.loadPage();
        this.loadMetrics();

        this._financeService.obtenerServicios(
            this.fechaInicio, 
            this.fechaFin, 
            this.tipoServicio, 
            this.tecnico, 
            this.currentPage, 
            this.pageSize
        ).subscribe(response => {
            // Convertir los datos a Notificacion
            const notificaciones: Notificacion[] = response.data.data.map(item => ({
                titulo: item.nombreSolicitante,
                mensaje: `Servicio ${item.numero}`,
                estado: 'pendiente', // Valor por defecto
                tipoEnvio: 'grupo',
                fechaCreacion: new Date(item.fechaInicio),
                responsableCreacion: 'Sistema',
                nombreSolicitante: item.nombreSolicitante,
                numero: item.numero,
                tipo: item.tipo,
                servicioId: item.servicios_id
            }));

            this.dataSource.data = notificaciones;
            this.totalItems = response.data.total;
        });
    }

    loadPage(): void {
        this._financeService.consultarServicios({
            fechaInicio: this.fechaInicio,
            fechaFin: this.fechaFin,
            tipoServicio: this.tipoServicio,
            tecnico: this.tecnico,
            page: this.paginator ? this.paginator.pageIndex + 1 : 1,
            limit: this.pageSize
        }).subscribe(response => {
            // Convertir los datos a Notificacion
            const notificaciones: Notificacion[] = response.data.data.map(item => ({
                titulo: item.nombreSolicitante,
                mensaje: `Servicio ${item.numero}`,
                estado: 'pendiente',
                tipoEnvio: 'grupo',
                fechaCreacion: new Date(item.fechaInicio),
                responsableCreacion: 'Sistema',
                nombreSolicitante: item.nombreSolicitante,
                numero: item.numero,
                tipo: item.tipo,
                servicioId: item.servicios_id
            }));

            this.dataSource.data = notificaciones;
            this.totalItems = response.data.total;
        });
    }

    private formatDateForApi(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    getTecnicoNombre(tecnicoId: number): string {
        return this.tecnicosMap.get(tecnicoId) || 'No asignado';
    }

    onFechaInicioChange(event: MatDatepickerInputEvent<Date>): void {
        if (event.value) {
            this.fechaInicio = this.formatDateForApi(event.value);
        }
    }

    onFechaFinChange(event: MatDatepickerInputEvent<Date>): void {
        if (event.value) {
            const fechaFinAjustada = this.adjustEndDate(event.value);
            this.fechaFin = this.formatDateForApi(fechaFinAjustada);
        }
    }

    private loadImage(url: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });
    }

    private async generarPDFCompleto(): Promise<jsPDFWithPlugin> {
        const doc = new jsPDF() as jsPDFWithPlugin;
        const pageWidth = doc.internal.pageSize.width;
        const today = new Date();

        try {
            // Cargar logo SVG desde assets
            const logoImg = await this.loadImage('/assets/images/logo/logo.svg');
            
            // Convertir SVG a PNG usando canvas
            const canvas = document.createElement('canvas');
            // Ajustar tamaño del canvas para mejor calidad
            canvas.width = 100;  // Ancho deseado del logo
            canvas.height = 100; // Alto deseado del logo
            const ctx = canvas.getContext('2d');
            ctx.drawImage(logoImg, 0, 0, canvas.width, canvas.height);
            const logoBase64 = canvas.toDataURL('image/png');

            // Agregar logo al PDF
            doc.addImage(logoBase64, 'PNG', 15, 10, 25, 25); // Ajustar tamaño y posición según necesites

            // Ajustar posición del título para dejar espacio al logo
            doc.setFontSize(16);
            doc.text('Sistema de Soporte Técnico - Alcaldía de Cochabamba', pageWidth/2, 25, { align: 'center' });
            
            doc.setFontSize(12);
            doc.text(`Fecha de generación: ${today.toLocaleDateString()} ${today.toLocaleTimeString()}`, pageWidth/2, 35, { align: 'center' });

            // Título del reporte con parámetros
            doc.setFontSize(14);
            const titulo = 'Reporte de Servicios';
            doc.text(titulo, pageWidth/2, 45, { align: 'center' });

            // Parámetros de la consulta
            const parametros = [
                `Fecha Inicio: ${this.fechaInicio}`,
                `Fecha Fin: ${this.fechaFin}`,
                `Tipo de Servicio: ${this.tipoServicio}`,
                `Técnico: ${this.tecnico === 'TODOS' ? 'TODOS' : this.getTecnicoNombre(Number(this.tecnico))}`
            ];

            doc.setFontSize(10);
            parametros.forEach((param, index) => {
                doc.text(param, 14, 55 + (index * 5));
            });

            // Generar la tabla con todos los datos
            const response = await this._financeService.consultarTodosServicios({
                fechaInicio: this.fechaInicio,
                fechaFin: this.fechaFin,
                tipoServicio: this.tipoServicio,
                tecnico: this.tecnico
            }).toPromise();

            if (!response) {
                throw new Error('No se pudieron obtener los datos');
            }

            const tableData = response.data.data.map((row, index) => [
                index + 1,
                row.numero,
                row.tipo,
                this.getTecnicoNombre(row.tecnicoAsignado),
                new Date(row.fechaInicio).toLocaleDateString(),
                new Date(row.fechaTerminado).toLocaleDateString(),
                row.nombreSolicitante
            ]);

            doc.autoTable({
                head: [['#', 'Número', 'Tipo de Servicio', 'Técnico Asignado', 'Fecha Inicio', 'Fecha Terminado', 'Solicitante']],
                body: tableData,
                startY: 65,
                theme: 'grid',
                styles: {
                    fontSize: 8,
                    cellPadding: 2,
                },
                headStyles: {
                    fillColor: [63, 81, 181],
                    textColor: 255,
                    fontSize: 8,
                    fontStyle: 'bold',
                },
            });

            // Agregar numeración de páginas
            const pageCount = doc.internal.getNumberOfPages();
            for(let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.text(`Página ${i} de ${pageCount}`, pageWidth - 20, doc.internal.pageSize.height - 10);
            }

        } catch (error) {
            console.error('Error al cargar el logo:', error);
            // Si hay error al cargar el logo, continuar sin él
            doc.setFontSize(16);
            doc.text('Sistema de Soporte Técnico - Alcaldía de Cochabamba', pageWidth/2, 15, { align: 'center' });
            
            doc.setFontSize(12);
            doc.text(`Fecha de generación: ${today.toLocaleDateString()} ${today.toLocaleTimeString()}`, pageWidth/2, 25, { align: 'center' });

            // Título del reporte con parámetros
            doc.setFontSize(14);
            const titulo = 'Reporte de Servicios';
            doc.text(titulo, pageWidth/2, 35, { align: 'center' });

            // Parámetros de la consulta
            const parametros = [
                `Fecha Inicio: ${this.fechaInicio}`,
                `Fecha Fin: ${this.fechaFin}`,
                `Tipo de Servicio: ${this.tipoServicio}`,
                `Técnico: ${this.tecnico === 'TODOS' ? 'TODOS' : this.getTecnicoNombre(Number(this.tecnico))}`
            ];

            doc.setFontSize(10);
            parametros.forEach((param, index) => {
                doc.text(param, 14, 45 + (index * 5));
            });

            // Generar la tabla con todos los datos
            const response = await this._financeService.consultarTodosServicios({
                fechaInicio: this.fechaInicio,
                fechaFin: this.fechaFin,
                tipoServicio: this.tipoServicio,
                tecnico: this.tecnico
            }).toPromise();

            if (!response) {
                throw new Error('No se pudieron obtener los datos');
            }

            const tableData = response.data.data.map((row, index) => [
                index + 1,
                row.numero,
                row.tipo,
                this.getTecnicoNombre(row.tecnicoAsignado),
                new Date(row.fechaInicio).toLocaleDateString(),
                new Date(row.fechaTerminado).toLocaleDateString(),
                row.nombreSolicitante
            ]);

            doc.autoTable({
                head: [['#', 'Número', 'Tipo de Servicio', 'Técnico Asignado', 'Fecha Inicio', 'Fecha Terminado', 'Solicitante']],
                body: tableData,
                startY: 65,
                theme: 'grid',
                styles: {
                    fontSize: 8,
                    cellPadding: 2,
                },
                headStyles: {
                    fillColor: [63, 81, 181],
                    textColor: 255,
                    fontSize: 8,
                    fontStyle: 'bold',
                },
            });

            // Agregar numeración de páginas
            const pageCount = doc.internal.getNumberOfPages();
            for(let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.text(`Página ${i} de ${pageCount}`, pageWidth - 20, doc.internal.pageSize.height - 10);
            }
        }

        return doc;
    }

    async generarPDF(): Promise<void> {
        try {
            const doc = await this.generarPDFCompleto();
            
            // Generar el blob del PDF
            const blob = doc.output('blob');
            const blobUrl = URL.createObjectURL(blob);

            // Abrir el PDF en una nueva ventana
            window.open(blobUrl, '_blank');

            // También descargar el PDF
            doc.save(`reporte_servicios_${new Date().toISOString().split('T')[0]}.pdf`);

            // Limpiar el blob URL después de un tiempo
            setTimeout(() => {
                URL.revokeObjectURL(blobUrl);
            }, 2000);
        } catch (error) {
            console.error('Error al generar el PDF:', error);
        }
    }

    async imprimirPDF(): Promise<void> {
        try {
            const doc = await this.generarPDFCompleto();
            
            // Crear un iframe invisible
            const printFrame = document.createElement('iframe');
            printFrame.style.position = 'fixed';
            printFrame.style.right = '0';
            printFrame.style.bottom = '0';
            printFrame.style.width = '0';
            printFrame.style.height = '0';
            printFrame.style.border = 'none';
            document.body.appendChild(printFrame);

            // Obtener el PDF como blob y crear URL
            const blob = doc.output('blob');
            const blobUrl = URL.createObjectURL(blob);

            // Cuando el iframe se carga, imprimir
            printFrame.onload = () => {
                try {
                    printFrame.contentWindow?.focus();
                    printFrame.contentWindow?.print();
                } catch (e) {
                    console.error('Error al imprimir:', e);
                }
            };

            // Establecer la fuente del iframe
            printFrame.src = blobUrl;

            // Limpiar recursos después de imprimir
            const cleanup = () => {
                if (document.body.contains(printFrame)) {
                    document.body.removeChild(printFrame);
                    URL.revokeObjectURL(blobUrl);
                }
                window.removeEventListener('focus', cleanup);
            };

            window.addEventListener('focus', cleanup);
        } catch (error) {
            console.error('Error al imprimir el PDF:', error);
        }
    }

    private adjustEndDate(endDate: Date): Date {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const compareDate = new Date(endDate);
        compareDate.setHours(0, 0, 0, 0);
        
        // Si la fecha fin es el día actual, agregar un día más
        if (compareDate.getTime() === today.getTime()) {
            const adjustedDate = new Date(endDate);
            adjustedDate.setDate(adjustedDate.getDate() + 1);
            return adjustedDate;
        }
        
        return endDate;
    }

    // Modificar los métodos existentes de filtros de fecha
    setUltimoDia(): void {
        const hoy = new Date();
        const ayer = new Date();
        ayer.setDate(hoy.getDate() - 1);
        
        const fechaFinAjustada = this.adjustEndDate(hoy);
        
        this.fechaInicioDisplay = ayer;
        this.fechaFinDisplay = hoy;
        this.fechaInicio = this.formatDateForApi(ayer);
        this.fechaFin = this.formatDateForApi(fechaFinAjustada);
        this.selectedDateFilter = 'day';
        this.consultar();
    }

    setUltimos7Dias(): void {
        const hoy = new Date();
        const hace7Dias = new Date();
        hace7Dias.setDate(hoy.getDate() - 7);
        
        const fechaFinAjustada = this.adjustEndDate(hoy);
        
        this.fechaInicioDisplay = hace7Dias;
        this.fechaFinDisplay = hoy;
        this.fechaInicio = this.formatDateForApi(hace7Dias);
        this.fechaFin = this.formatDateForApi(fechaFinAjustada);
        this.selectedDateFilter = 'week';
        this.consultar();
    }

    setUltimoMes(): void {
        const hoy = new Date();
        const hace30Dias = new Date();
        hace30Dias.setDate(hoy.getDate() - 30);
        
        const fechaFinAjustada = this.adjustEndDate(hoy);
        
        this.fechaInicioDisplay = hace30Dias;
        this.fechaFinDisplay = hoy;
        this.fechaInicio = this.formatDateForApi(hace30Dias);
        this.fechaFin = this.formatDateForApi(fechaFinAjustada);
        this.selectedDateFilter = 'month';
        this.consultar();
    }

    setUltimoAnio(): void {
        const hoy = new Date();
        const hace1Anio = new Date();
        hace1Anio.setFullYear(hoy.getFullYear() - 1);
        
        const fechaFinAjustada = this.adjustEndDate(hoy);
        
        this.fechaInicioDisplay = hace1Anio;
        this.fechaFinDisplay = hoy;
        this.fechaInicio = this.formatDateForApi(hace1Anio);
        this.fechaFin = this.formatDateForApi(fechaFinAjustada);
        this.selectedDateFilter = 'year';
        this.consultar();
    }

    // Agregar método para formatear fecha con mes literal
    formatDisplayDate(date: Date): string {
        const meses = [
            'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
            'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
        ];
        return `${date.getDate()} de ${meses[date.getMonth()]} de ${date.getFullYear()}`;
    }

    private loadMetrics(): void {
        this._financeService.obtenerMetricas({
            fechaInicio: this.fechaInicio,
            fechaFin: this.fechaFin,
            tipoServicio: this.tipoServicio,
            tecnico: this.tecnico
        }).subscribe(response => {
            this.metrics = response.data;
            // Ordenar técnicos por cantidad de servicios completados
            this.rendimientoTecnicos = [...response.data.rendimientoTecnicos]
                .sort((a, b) => b.completados - a.completados);
            this.updateCharts();
        });
    }

    private isDarkMode(): boolean {
        return document.documentElement.classList.contains('dark');
    }

    private updateCharts(): void {
        if (!this.metrics) return;

        // Destruir gráficos existentes
        Object.values(this.charts).forEach(chart => chart.destroy());

        // Verificar que los elementos del DOM existan antes de crear los gráficos
        if (this.distribucionChart && this.distribucionChart.nativeElement) {
            this.charts['distribucion'] = new Chart(this.distribucionChart.nativeElement, {
                type: 'pie',
                plugins: [ChartDataLabels],
                data: {
                    labels: this.metrics.distribucionTipos.data.map(item => item.tipo),
                    datasets: [{
                        data: this.metrics.distribucionTipos.data.map(item => item.cantidad),
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.8)',    // Rojo para el primero
                            'rgba(75, 192, 192, 0.8)',    // Verde claro para REMOTA
                            'rgba(255, 206, 86, 0.8)',    // Amarillo
                            'rgba(25, 118, 210, 0.8)'     // Azul más fuerte
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#64748B',
                                font: {
                                    size: 12
                                }
                            }
                        },
                        datalabels: {
                            color: '#3B82F6',
                            formatter: (value, context) => {
                                const percentage = this.metrics?.distribucionTipos.data[context.dataIndex].porcentaje;
                                return percentage ? `${percentage}%` : '';
                            },
                            font: {
                                size: 12
                            }
                        }
                    }
                }
            });
        }

        // Similar verificación para otros gráficos
        if (this.rendimientoChart && this.rendimientoChart.nativeElement) {
            const tecnicos = [...this.metrics.rendimientoTecnicos]
                .sort((a, b) => b.total_servicios - a.total_servicios);

            this.charts['rendimiento'] = new Chart(this.rendimientoChart.nativeElement, {
                type: 'bar',
                plugins: [ChartDataLabels],
                data: {
                    labels: tecnicos.map(tec => 
                        tec.tecnico.length > 20 ? tec.tecnico.substring(0, 20) + '...' : tec.tecnico
                    ),
                    datasets: [{
                        label: 'Total Servicios',
                        data: tecnicos.map(tec => tec.total_servicios),
                        backgroundColor: 'rgba(54, 162, 235, 0.8)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            enabled: true,
                            callbacks: {
                                label: (context) => {
                                    const tecnico = tecnicos[context.dataIndex];
                                    return `${tecnico.tecnico}: ${tecnico.total_servicios} servicios`;
                                }
                            }
                        },
                        datalabels: {
                            color: '#3B82F6',
                            anchor: 'end',
                            align: 'right',
                            formatter: (value) => value.toString(),
                            font: {
                                weight: 'bold'
                            },
                            padding: 6
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Cantidad de Servicios'
                            }
                        },
                        y: {
                            ticks: {
                                callback: function(value: string | number) {
                                    // Asegurarnos de que value sea un número
                                    const index = typeof value === 'string' ? parseInt(value) : value;
                                    if (typeof index !== 'number') return '';
                                    
                                    const label = this.getLabelForValue(index);
                                    if (typeof label !== 'string') return '';
                                    
                                    return label.length > 20 ? label.substring(0, 20) + '...' : label;
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    getMetricByTipo(tipo: string): { tiempo_promedio_horas: number; tiempo_promedio_minutos: number; tiempo_promedio_segundos: number; total_servicios: number } | undefined {
        return this.metrics?.tiemposResolucion.find(item => item.tipo === tipo);
    }

    formatTiempoResolucion(metric: { tiempo_promedio_horas: number; tiempo_promedio_minutos: number; tiempo_promedio_segundos: number; } | undefined): { valor: string; unidad: string } {
        if (!metric) {
            return { valor: '0', unidad: 'seg' };
        }

        // Si hay horas
        if (metric.tiempo_promedio_horas >= 1) {
            // Obtener la parte entera de las horas
            const horas = Math.floor(metric.tiempo_promedio_horas);
            // Convertir la parte decimal a minutos
            const minutosDecimal = (metric.tiempo_promedio_horas - horas) * 60;
            
            if (minutosDecimal >= 1) {
                return { 
                    valor: `${horas} hrs ${Math.floor(minutosDecimal)}`, 
                    unidad: 'min' 
                };
            }
            
            return { 
                valor: `${horas}`, 
                unidad: 'hrs' 
            };
        }

        // Si hay minutos
        if (metric.tiempo_promedio_minutos >= 1) {
            // Obtener la parte entera de los minutos
            const minutos = Math.floor(metric.tiempo_promedio_minutos);
            // Convertir la parte decimal a segundos
            const segundosDecimal = (metric.tiempo_promedio_minutos - minutos) * 60;
            
            if (segundosDecimal >= 1) {
                return { 
                    valor: `${minutos} min ${Math.floor(segundosDecimal)}`, 
                    unidad: 'seg' 
                };
            }
            
            return { 
                valor: `${minutos}`, 
                unidad: 'min' 
            };
        }

        // Si hay segundos, mostrar solo la parte entera
        if (metric.tiempo_promedio_segundos > 0) {
            return { 
                valor: Math.floor(metric.tiempo_promedio_segundos).toString(), 
                unidad: 'seg' 
            };
        }

        // Si todo es 0, mostrar 0 segundos
        return { valor: '0', unidad: 'seg' };
    }

    formatTiempoResolucionSimple(tecnico: { tiempo_promedio_horas: number; tiempo_promedio_minutos: number; tiempo_promedio_segundos: number; }): string {
        if (!tecnico) {
            return '0 seg';
        }

        // Si hay horas
        if (tecnico.tiempo_promedio_horas >= 1) {
            const horas = Math.floor(tecnico.tiempo_promedio_horas);
            const minutosDecimal = (tecnico.tiempo_promedio_horas - horas) * 60;
            
            if (minutosDecimal >= 1) {
                return `${horas} hrs ${Math.floor(minutosDecimal)} min`;
            }
            
            return `${horas} hrs`;
        }

        // Si hay minutos
        if (tecnico.tiempo_promedio_minutos >= 1) {
            const minutos = Math.floor(tecnico.tiempo_promedio_minutos);
            const segundosDecimal = (tecnico.tiempo_promedio_minutos - minutos) * 60;
            
            if (segundosDecimal >= 1) {
                return `${minutos} min ${Math.floor(segundosDecimal)} seg`;
            }
            
            return `${minutos} min`;
        }

        // Si hay segundos
        if (tecnico.tiempo_promedio_segundos > 0) {
            return `${Math.floor(tecnico.tiempo_promedio_segundos)} seg`;
        }

        return '0 seg';
    }

    getTooltipPosition(index: number): string {
        // Cada fila tiene aproximadamente 64px de alto (incluyendo el padding)
        // Ajustamos la posición base considerando el header y otros elementos
        const baseOffset = 200; // Offset base para considerar elementos superiores
        const rowHeight = 64; // Altura aproximada de cada fila
        return `${baseOffset + (index * rowHeight)}`;
    }

    showTooltip(event: MouseEvent, index: number): void {
        this.selectedTecnicoIndex = index;
    }

    hideTooltip(): void {
        this.selectedTecnicoIndex = null;
    }

    // Agregar el método getImageUrl
    getImageUrl2(tecnicoId: number): string {
        const user = this.tecnicos.find(t => t.id === tecnicoId);
        if (user?.image) {
            return `${environment.baseUrl}${user.image}`;
        }
        return 'assets/images/avatars/default.jpg';
    }
    
    // Método getImageUrl modificado
    getImageUrl(tecnicoId: number): string {
        // Si ya tenemos la URL en caché, la retornamos
        if (this.imageUrls.has(tecnicoId)) {
            return this.imageUrls.get(tecnicoId);
        }

        // Si no está en caché, establecemos la imagen por defecto mientras se carga
        this.imageUrls.set(tecnicoId, 'assets/images/avatars/default-profile.png');

        // Hacemos la llamada a la API solo si no está en caché
        this.http.get<any>(`${environment.baseUrl}/user/${tecnicoId}`).subscribe(
            (response) => {
                if (response.data.image) {
                    const imageUrl = `${environment.baseUrl}${response.data.image}`;
                    this.imageUrls.set(tecnicoId, imageUrl);
                    this.cdr.detectChanges();
                }
            },
            (error) => {
                console.error('Error al obtener imagen del técnico:', error);
            }
        );

        return this.imageUrls.get(tecnicoId);
    }

    cargarNotificaciones(pagina: number = 1) {
        console.log('Método cargarNotificaciones llamado - Página:', pagina, 'Tamaño de página:', this.notificationPageSize);
        
        this._financeService.obtenerNotificacionesPaginadas(pagina, this.notificationPageSize)
            .subscribe({
                next: (resultado) => {
                    console.log('Resultado de obtenerNotificacionesPaginadas:', resultado);
                    
                    if (resultado && resultado.data && resultado.data.length > 0) {
                        this.dataSource.data = resultado.data;
                        this.totalNotificaciones = resultado.total;
                        this.paginaActualNotificaciones = resultado.page;
                        
                        console.log('Datos cargados:', {
                            cantidadDatos: this.dataSource.data.length,
                            totalNotificaciones: this.totalNotificaciones,
                            paginaActual: this.paginaActualNotificaciones
                        });
                    } else {
                        console.warn('No se encontraron notificaciones');
                        this.dataSource.data = [];
                    }
                    
                    // Forzar detección de cambios
                    this.cdr.detectChanges();
                },
                error: (error) => {
                    console.error('Error al cargar notificaciones:', error);
                    this.dataSource.data = [];
                    this.cdr.detectChanges();
                }
            });
    }

    toggleDetails(notificacion: Notificacion): void {
        // Si la notificación ya está seleccionada, deseleccionarla
        this.selectedNotificacion = this.selectedNotificacion === notificacion ? null : notificacion;
    }

    onPageChange(event: any): void {
        console.log('Evento de cambio de página:', event);
        
        // Verificar que el evento tenga las propiedades esperadas
        if (event && event.pageSize && event.pageIndex !== undefined) {
            this.pageSize = event.pageSize;
            const nuevaPagina = event.pageIndex + 1;
            
            console.log('Cargando página:', nuevaPagina, 'Tamaño de página:', this.pageSize);
            
            this.cargarNotificaciones(nuevaPagina);
        } else {
            console.error('Evento de paginación inválido:', event);
        }
    }
}

