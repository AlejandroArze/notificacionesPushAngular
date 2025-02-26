class TaskDTO {
    // Propiedades que representan los campos de la tabla en la base de datos
    tareas_id; // Clave primaria con auto-incremento
    descripcion; // Campo de descripción, tipo texto
    servicio; // Campo de referencia a 'servicios', tipo entero
    fecha; // Campo de fecha, tipo texto

    // Constructor para inicializar el DTO con los valores
    constructor(tareas_id, descripcion, servicio, fecha) {
        this.tareas_id = tareas_id; // Asigna el ID
        this.descripcion = descripcion; // Asigna la descripción
        this.servicio = servicio; // Asigna el servicio (relación con 'servicios')
        this.fecha = fecha; // Asigna la fecha
    }
}

// Exporta la clase TaskDTO para su uso en otros archivos
module.exports = TaskDTO;
