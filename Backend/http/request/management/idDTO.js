const Joi = require("joi"); // Importa la librería Joi para validación de datos.
const { Management } = require("../../../models"); // Importa el modelo 'Management' desde los modelos de base de datos, para verificar la existencia de tipos por ID.

const idSchema = Joi.object({ // Define un esquema de validación de objeto utilizando Joi.
    gestions_id: Joi.number() // Define que el campo 'gestions_id' debe ser un número.
        .required() // Indica que el campo 'gestions_id' es obligatorio.
        .external(async (gestions_id) => { // Función asíncrona externa para validación personalizada.
            const exists = await Management.findByPk(gestions_id); // Busca el tipo por su ID (gestions_id) en la base de datos utilizando el método `findByPk`.
            if (!exists) { // Si el tipo no existe, lanza un error de validación.
                throw new Joi.ValidationError('gestions_id does not exist', [{ // Crea un nuevo error de validación con el mensaje de que el ID no existe.
                    message: 'gestions_id does not exist', // Mensaje del error.
                    path: ['gestions_id'], // Ruta del campo que generó el error (en este caso, 'gestions_id').
                    type: 'id.not_found', // Tipo de error personalizado indicando que el ID no fue encontrado.
                    context: { key: 'gestions_id' } // Proporciona el contexto del error con la clave que falló (en este caso, 'gestions_id').
                }], gestions_id); // Asigna el valor del ID al error para referencia.
            }
        })
        .messages({ // Personaliza los mensajes de error para la validación del gestions_id.
            'number.base': 'gestions_id must be a number', // Mensaje de error si el gestions_id no es un número.
            'any.required': 'gestions_id is required' // Mensaje de error si el gestions_id no está presente.
        })
});

module.exports = idSchema; // Exporta el esquema de validación para que pueda ser usado en otras partes de la aplicación.
