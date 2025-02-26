export interface Board {
    id: string;
    title: string;
    description: string;
    icon: string;
    lists: List[];
}

export interface List {
    id: string;
    title: EstadoServicio;
    position: number;
    cards: Card[];
}

export interface Card {
    id: string;
    nombreSolicitante: string;
    solicitante: string;
    carnet: string;
    cargo: string;
    tipoSolicitante: string;
    problema: string;
    tipo: TipoServicio;
    estado: EstadoServicio;
    tecnicoAsignado: number;
    fechaRegistro: string;
    fechaInicio: string;
    fechaTerminado: string;
    informe: string;
    observacionesProblema: string;
    codigoBienes: string;
    oficinaSolicitante: string;
    telefonoSolicitante: string;
    listId: string;
    position: number;
    tipoHardware?: string;
    descripcion?: string;
    tecnicoRegistro: number;
}

export enum EstadoServicio {
    SIN_ASIGNAR = 'SIN ASIGNAR',
    PENDIENTE = 'PENDIENTE',
    EN_PROGRESO = 'EN PROGRESO',
    TERMINADO = 'TERMINADO'
}

export enum TipoServicio {
    ASISTENCIA_SITIO = 'ASISTENCIA',
    SERVICIO_LABORATORIO = 'EN LABORATORIO',
    ASISTENCIA_REMOTA = 'REMOTA'
}

export interface Equipo {
    equipos_id: number;
    codigo: string;
}
