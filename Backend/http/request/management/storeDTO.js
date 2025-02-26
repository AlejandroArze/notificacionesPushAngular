const Joi = require("joi"); // Importa la librería Joi para la validación de datos.
const { Management } = require("../../../models"); // Importa el modelo 'management' desde los modelos, usado para consultar la base de datos.

// Define un esquema de validación para el DTO de 'Tarea'.
const managementDTO = Joi.object({
     // Validación del campo 'descripcion'.
     descripcion: Joi.string() // Define que el campo 'descripcion' debe ser una cadena de texto.
        .required() // El campo 'descripcion' es obligatorio.
        .min(1) // Asegura que no sea una cadena vacía.
        .max(255), // Limita la longitud máxima (ajusta según tus necesidades).

    // Validación del campo 'numero', que es un número entero.
    numero: Joi.number().integer() // Define que el campo 'numero' es un número entero.
        .required(), // El campo 'numero' es obligatorio.

    // Validación del campo 'anio', que es de tipo texto.
    anio: Joi.string() // Define que el campo 'anio' debe ser una cadena de texto.
        .required() // El campo 'anio' es obligatorio.
        .min(4) // Asegura que sea una cadena de al menos 4 caracteres (por ejemplo, "2023").
        .max(4), // Limita la longitud a 4 caracteres (para el año).

    // Validación del campo 'estado', que es un número entero.
    estado: Joi.number().integer() // Define que el campo 'estado' es un número entero.
        .required(), // El campo 'estado' es obligatorio.

    // 'tareas_id' es la clave primaria y se maneja automáticamente por la base de datos, no se incluye en el DTO.
});

// Exporta el esquema de validación para que pueda ser utilizado en otras partes de la aplicación.
module.exports = managementDTO;

