class ServiceDTO {
    // Propiedades que representan los campos en la tabla de la base de datos
    servicios_id; // Clave primaria con auto-incremento
    nombreResponsableEgreso; // Nombre del responsable de egreso
    cargoSolicitante; // Cargo del solicitante
    informe; // Informe
    cargoResponsableEgreso; // Cargo del responsable de egreso
    oficinaSolicitante; // Oficina del solicitante
    fechaRegistro; // Fecha de registro
    equipo; // Referencia al equipo
    problema; // Problema reportado
    telefonoResponsableEgreso; // Teléfono del responsable de egreso
    gestion; // Gestión (referencia a 'gestions')
    telefonoSolicitante; // Teléfono del solicitante
    tecnicoAsignado; // Técnico asignado
    observaciones; // Observaciones
    tipoResponsableEgreso; // Tipo de responsable de egreso
    estado; // Estado del servicio
    tipoSolicitante; // Tipo de solicitante
    fechaTerminado; // Fecha de finalización
    oficinaResponsableEgreso; // Oficina del responsable de egreso
    numero; // Número del servicio
    fechaInicio; // Fecha de inicio del servicio
    fechaEgreso; // Fecha de egreso
    ciSolicitante; // CI del solicitante
    nombreSolicitante; // Nombre del solicitante
    tipo; // Tipo de servicio
    tecnicoRegistro; // Técnico que registró el servicio
    tecnicoEgreso; // Técnico encargado del egreso
    ciResponsableEgreso; // CI del responsable de egreso

    // Constructor para inicializar el DTO con los valores
    constructor(
        servicios_id,
        nombreResponsableEgreso,
        cargoSolicitante,
        informe,
        cargoResponsableEgreso,
        oficinaSolicitante,
        fechaRegistro,
        equipo,
        problema,
        telefonoResponsableEgreso,
        gestion,
        telefonoSolicitante,
        tecnicoAsignado,
        observaciones,
        tipoResponsableEgreso,
        estado,
        tipoSolicitante,
        fechaTerminado,
        oficinaResponsableEgreso,
        numero,
        fechaInicio,
        fechaEgreso,
        ciSolicitante,
        nombreSolicitante,
        tipo,
        tecnicoRegistro,
        tecnicoEgreso,
        ciResponsableEgreso
    ) {
        this.servicios_id = servicios_id;
        this.nombreResponsableEgreso = nombreResponsableEgreso;
        this.cargoSolicitante = cargoSolicitante;
        this.informe = informe;
        this.cargoResponsableEgreso = cargoResponsableEgreso;
        this.oficinaSolicitante = oficinaSolicitante;
        this.fechaRegistro = fechaRegistro;
        this.equipo = equipo;
        this.problema = problema;
        this.telefonoResponsableEgreso = telefonoResponsableEgreso;
        this.gestion = gestion;
        this.telefonoSolicitante = telefonoSolicitante;
        this.tecnicoAsignado = tecnicoAsignado;
        this.observaciones = observaciones;
        this.tipoResponsableEgreso = tipoResponsableEgreso;
        this.estado = estado;
        this.tipoSolicitante = tipoSolicitante;
        this.fechaTerminado = fechaTerminado;
        this.oficinaResponsableEgreso = oficinaResponsableEgreso;
        this.numero = numero;
        this.fechaInicio = fechaInicio;
        this.fechaEgreso = fechaEgreso;
        this.ciSolicitante = ciSolicitante;
        this.nombreSolicitante = nombreSolicitante;
        this.tipo = tipo;
        this.tecnicoRegistro = tecnicoRegistro;
        this.tecnicoEgreso = tecnicoEgreso;
        this.ciResponsableEgreso = ciResponsableEgreso;
    }
}

// Exporta la clase ServiceDTO para que pueda ser utilizada en otros archivos
module.exports = ServiceDTO;
