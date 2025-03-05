export interface Notificacion {
    // Identificadores
    id?: number;
    uuid?: string;

    // Datos básicos de la notificación
    titulo: string;
    mensaje: string;
    imagen?: string;
    nombreNotificacion?: string;

    // Tipo de envío
    tipoEnvio: 'individual' | 'grupo' | 'todos';

    // Filtros de destinatarios
    roles?: string[];
    unidades?: string[];
    estados?: string[];
    tipos?: string[];

    // Programación
    programarEnvio?: boolean;
    fechaProgramada?: Date;
    horaProgramada?: string;
    tipoProgramacion?: 'unica' | 'recurrente';
    frecuencia?: 'diaria' | 'semanal' | 'mensual';

    // Días para programación recurrente
    diasSeleccionados?: Record<string, boolean>;
    horaRecurrente?: string;
    fechaInicio?: Date;
    fechaFin?: Date;

    // Metadatos de la notificación
    fechaCreacion: Date;
    fechaEnvio?: Date;
    estado: 'pendiente' | 'enviada' | 'programada' | 'cancelada';

    // Información de servicio relacionado
    servicioId?: number;

    // Información del usuario que crea la notificación
    usuarioCreadorId?: number;
    responsableCreacion: string;

    // Destinatarios
    destinatarios?: {
        usuarioId: string;
        nombre?: string;
        estado: string;
    }[];

    // Campos de auditoría
    createdAt?: Date;
    updatedAt?: Date;
}

export interface NotificacionPaginacion {
    data: Notificacion[];
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
} 