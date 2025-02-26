const Joi = require("joi"); // Importa la librería Joi para validación de datos.
const { Type } = require("../../../models"); // Importa el modelo 'Task' desde los modelos de base de datos, para verificar la existencia de tipos por ID.

const idSchema = Joi.object({ // Define un esquema de validación de objeto utilizando Joi.
    tipos_id: Joi.number() // Define que el campo 'tipos_id' debe ser un número.
        .required() // Indica que el campo 'tipos_id' es obligatorio.
        .external(async (tipos_id) => { // Función asíncrona externa para validación personalizada.
            const exists = await Type.findByPk(tipos_id); // Busca el tipo por su ID (tipos_id) en la base de datos utilizando el método `findByPk`.
            if (!exists) { // Si el tipo no existe, lanza un error de validación.
                throw new Joi.ValidationError('tipos_id does not exist', [{ // Crea un nuevo error de validación con el mensaje de que el ID no existe.
                    message: 'tipos_id does not exist', // Mensaje del error.
                    path: ['tipos_id'], // Ruta del campo que generó el error (en este caso, 'tipos_id').
                    type: 'id.not_found', // Tipo de error personalizado indicando que el ID no fue encontrado.
                    context: { key: 'tipos_id' } // Proporciona el contexto del error con la clave que falló (en este caso, 'tipos_id').
                }], tipos_id); // Asigna el valor del ID al error para referencia.
            }
        })
        .messages({ // Personaliza los mensajes de error para la validación del tipos_id.
            'number.base': 'tipos_id must be a number', // Mensaje de error si el tipos_id no es un número.
            'any.required': 'tipos_id is required' // Mensaje de error si el tipos_id no está presente.
        })
});

module.exports = idSchema; // Exporta el esquema de validación para que pueda ser usado en otras partes de la aplicación.
