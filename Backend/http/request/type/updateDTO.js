const Joi = require("joi"); // Importa la librería Joi para la validación de datos.
const { Type } = require("../../../models"); // Importa el modelo 'Type' desde los modelos de base de datos.
const { Op } = require("sequelize"); // Importa 'Op' de Sequelize para utilizar operadores como 'not equal' (Op.ne) en las consultas.

// Define el esquema de validación para la actualización de un tipo.
const updateDTO = Joi.object({

    // Validación del campo 'tipos_id', que debe ser un número entero.
    tipos_id: Joi.number().integer()
        .required() // El campo 'tipos_id' es obligatorio.
        .external( // Validación externa del 'tipos_id' para verificar si existe en la base de datos.
            async (tipos_id) => {
                const exists = await Type.findByPk(tipos_id); // Busca el tipo por su ID (tipos_id) en la base de datos.
                if (!exists) { // Si no existe, lanza un error de validación.
                    throw new Joi.ValidationError('ID does not exist', [{ // Error de validación indicando que el ID no existe.
                        message: 'ID does not exist', // Mensaje de error.
                        path: ['tipos_id'], // Ruta del campo que generó el error (en este caso, 'tipos_id').
                        type: 'id.not_found', // Tipo de error indicando que el ID no fue encontrado.
                        context: { key: 'tipos_id' } // Contexto del error, con la clave 'tipos_id'.
                    }], tipos_id);
                }
            })
        .messages({
            'number.base': 'ID must be an integer', // Mensaje de error si el ID no es un número entero.
            'any.required': 'ID is required' // Mensaje de error si el ID es obligatorio y no está presente.
        }),

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
});

// Exporta el esquema de validación para que pueda ser utilizado en otras partes de la aplicación.
module.exports = updateDTO;
