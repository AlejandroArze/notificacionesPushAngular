const Joi = require("joi"); // Importa la librería Joi para la validación de datos.
const { Type } = require("../../../models"); // Importa el modelo 'Type' desde los modelos, usado para consultar la base de datos.

// Define un esquema de validación para el DTO de 'Tipo'.
const typeDTO = Joi.object({
    // Validación del campo 'descripcion'.
    descripcion: Joi.string() // Define que el campo 'descripcion' debe ser una cadena de texto.
        .required() // El campo 'descripcion' es obligatorio.
        .min(1) // Asegura que no sea una cadena vacía.
        .max(255), // Limita la longitud máxima (ajusta según tus necesidades).

    // Validación del campo 'formulario'.
    formulario: Joi.string() // Define que el campo 'formulario' debe ser una cadena de texto.
        .required() // El campo 'formulario' es obligatorio.
        .min(1) // Asegura que no sea una cadena vacía.
        .max(255), // Limita la longitud máxima (ajusta según tus necesidades).

    // Validación del campo 'estado', que es un número entero.
    estado: Joi.number().integer() // Define que el campo 'estado' es un número entero.
        .required(), // El campo 'estado' es obligatorio.

    // 'tipos_id' es la clave primaria y se maneja automáticamente por la base de datos, no se incluye en el DTO.
});

// Exporta el esquema de validación para que pueda ser utilizado en otras partes de la aplicación.
module.exports = typeDTO;
