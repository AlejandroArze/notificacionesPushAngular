class TypeResponseDTO {
    // Properties representing the fields in the database table
    tipos_id; // Primary key with auto-increment
    descripcion; // Description field, text
    formulario; // Form, text
    estado; // Status field, integer

    // Constructor to initialize the DTO with values
    constructor(tipos_id, descripcion, formulario, estado) {
        this.tipos_id = tipos_id; // Assign the ID
        this.descripcion = descripcion; // Assign the description
        this.formulario = formulario; // Assign the form
        this.estado = estado; // Assign the state
    }
    static createFromEntity(entity) {
        return new TypeResponseDTO(entity);
    }
}

// Export the TypeDTO class for use in other files
module.exports = TypeResponseDTO;
