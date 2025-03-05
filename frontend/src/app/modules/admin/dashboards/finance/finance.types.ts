export interface Notificacion {
    id?: number;
    uuid?: string;
    titulo: string;
    mensaje: string;
    imagen?: string;
    nombreNotificacion?: string;
    tipoEnvio: 'individual' | 'grupo' | 'todos';
    roles?: string[];
    unidades?: string[];
    estados?: string[];
    tipos?: string[];
    programarEnvio?: boolean;
    fechaProgramada?: Date;
    horaProgramada?: string;
    tipoProgramacion?: 'unica' | 'recurrente';
    frecuencia?: 'diaria' | 'semanal' | 'mensual';
    diasSeleccionados?: Record<string, boolean>;
    horaRecurrente?: string;
    fechaInicio?: Date;
    fechaFin?: Date;
    fechaCreacion: Date;
    fechaEnvio?: Date;
    estado: 'pendiente' | 'enviada' | 'programada' | 'cancelada';
    servicioId?: number;
    usuarioCreadorId?: number;
    responsableCreacion: string;
    destinatarios?: {
        usuarioId: string;
        nombre?: string;
        estado: string;
    }[];
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