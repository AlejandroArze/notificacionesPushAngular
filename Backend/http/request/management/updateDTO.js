const Joi = require("joi"); // Importa la librería Joi para la validación de datos.
const { Management } = require("../../../models"); // Importa el modelo 'Management' desde los modelos de base de datos.
const { Op } = require("sequelize"); // Importa 'Op' de Sequelize para utilizar operadores como 'not equal' (Op.ne) en las consultas.

// Define el esquema de validación para la actualización de una tarea.
const updateDTO = Joi.object({

    // Validación del campo 'gestions_id', que debe ser un número entero.
    gestions_id: Joi.number().integer()
        .required() // El campo 'gestions_id' es obligatorio.
        .external( // Validación externa del 'gestions_id' para verificar si existe en la base de datos.
            async (gestions_id) => {
                const exists = await Management.findByPk(gestions_id); // Busca la tarea por su ID (gestions_id) en la base de datos.
                if (!exists) { // Si no existe, lanza un error de validación.
                    throw new Joi.ValidationError('ID does not exist', [{ // Error de validación indicando que el ID no existe.
                        message: 'ID does not exist', // Mensaje de error.
                        path: ['gestions_id'], // Ruta del campo que generó el error (en este caso, 'gestions_id').
                        type: 'id.not_found', // Tipo de error indicando que el ID no fue encontrado.
                        context: { key: 'gestions_id' } // Contexto del error, con la clave 'gestions_id'.
                    }], gestions_id);
                }
            })
        .messages({
            'number.base': 'El ID debe ser un número entero', // Mensaje de error si el ID no es un número entero.
            'any.required': 'El ID es obligatorio' // Mensaje de error si el ID es obligatorio y no está presente.
        }),

    // Validación del campo 'descripcion'.
    descripcion: Joi.string() // Define que el campo 'descripcion' debe ser una cadena de texto.
        .required() // El campo 'descripcion' es obligatorio.
        .min(1) // Asegura que no sea una cadena vacía.
        .max(255), // Limita la longitud máxima.

    // Validación del campo 'numero', que es un número entero.
    numero: Joi.number().integer() // Define que el campo 'numero' debe ser un número entero.
        .required(), // El campo 'numero' es obligatorio.

    // Validación del campo 'anio', que es de tipo texto.
    anio: Joi.string() // Define que el campo 'anio' debe ser una cadena de texto.
        .required() // El campo 'anio' es obligatorio.
        .min(4) // Asegura que sea una cadena de al menos 4 caracteres (por ejemplo, "2023").
        .max(4), // Limita la longitud máxima a 4 caracteres.

    // Validación del campo 'estado', que es un número entero.
    estado: Joi.number().integer() // Define que el campo 'estado' debe ser un número entero.
        .required() // El campo 'estado' es obligatorio.
});

// Exporta el esquema de validación para que pueda ser utilizado en otras partes de la aplicación.
module.exports = updateDTO;

