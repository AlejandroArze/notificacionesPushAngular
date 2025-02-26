const Joi = require("joi"); // Importa la librería Joi para validación de datos.
const { Service } = require("../../../models"); // Importa el modelo 'Service' desde los modelos de base de datos, para verificar la existencia de tipos por ID.

const idSchema = Joi.object({ // Define un esquema de validación de objeto utilizando Joi.
    servicios_id: Joi.number() // Define que el campo 'servicios_id' debe ser un número.
        .required() // Indica que el campo 'servicios_id' es obligatorio.
        .external(async (servicios_id) => { // Función asíncrona externa para validación personalizada.
            const exists = await Service.findByPk(servicios_id); // Busca el tipo por su ID (servicios_id) en la base de datos utilizando el método `findByPk`.
            if (!exists) { // Si el tipo no existe, lanza un error de validación.
                throw new Joi.ValidationError('servicios_id does not exist', [{ // Crea un nuevo error de validación con el mensaje de que el ID no existe.
                    message: 'servicios_id does not exist', // Mensaje del error.
                    path: ['servicios_id'], // Ruta del campo que generó el error (en este caso, 'servicios_id').
                    type: 'id.not_found', // Tipo de error personalizado indicando que el ID no fue encontrado.
                    context: { key: 'servicios_id' } // Proporciona el contexto del error con la clave que falló (en este caso, 'servicios_id').
                }], servicios_id); // Asigna el valor del ID al error para referencia.
            }
        })
        .messages({ // Personaliza los mensajes de error para la validación del servicios_id.
            'number.base': 'servicios_id must be a number', // Mensaje de error si el servicios_id no es un número.
            'any.required': 'servicios_id is required' // Mensaje de error si el servicios_id no está presente.
        })
});

module.exports = idSchema; // Exporta el esquema de validación para que pueda ser usado en otras partes de la aplicación.
