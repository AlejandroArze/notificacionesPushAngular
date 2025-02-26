class ManagementDTO {
   // Propiedades que representan los campos de la tabla en la base de datos
   gestions_id; // Clave primaria con auto-incremento
   descripcion; // Campo de descripción, tipo texto
   numero; // Campo de número, tipo entero
   anio; // Campo de año, tipo texto
   estado; // Campo de estado, tipo entero

   // Constructor para inicializar el DTO con los valores
   constructor(gestions_id, descripcion, numero, anio, estado) {
       this.gestions_id = gestions_id; // Asigna el ID
       this.descripcion = descripcion; // Asigna la descripción
       this.numero = numero; // Asigna el número
       this.anio = anio; // Asigna el año
       this.estado = estado; // Asigna el estado
   }
}

// Exporta la clase ManagementDTO para su uso en otros archivos
module.exports = ManagementDTO;

