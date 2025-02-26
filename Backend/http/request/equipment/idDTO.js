const Joi = require("joi"); // Importa la librería Joi para validación de datos.
const { Equipment } = require("../../../models"); // Importa el modelo 'Equipment' desde los modelos de base de datos, para verificar la existencia de tipos por ID.

const idSchema = Joi.object({ // Define un esquema de validación de objeto utilizando Joi.
    equipos_id: Joi.number() // Define que el campo 'equipos_id' debe ser un número.
        .required() // Indica que el campo 'equipos_id' es obligatorio.
        .external(async (equipos_id) => { // Función asíncrona externa para validación personalizada.
            const exists = await Equipment.findByPk(equipos_id); // Busca el tipo por su ID (equipos_id) en la base de datos utilizando el método `findByPk`.
            if (!exists) { // Si el tipo no existe, lanza un error de validación.
                throw new Joi.ValidationError('equipos_id does not exist', [{ // Crea un nuevo error de validación con el mensaje de que el ID no existe.
                    message: 'equipos_id does not exist', // Mensaje del error.
                    path: ['equipos_id'], // Ruta del campo que generó el error (en este caso, 'equipos_id').
                    type: 'id.not_found', // Tipo de error personalizado indicando que el ID no fue encontrado.
                    context: { key: 'equipos_id' } // Proporciona el contexto del error con la clave que falló (en este caso, 'equipos_id').
                }], equipos_id); // Asigna el valor del ID al error para referencia.
            }
        })
        .messages({ // Personaliza los mensajes de error para la validación del equipos_id.
            'number.base': 'equipos_id must be a number', // Mensaje de error si el equipos_id no es un número.
            'any.required': 'equipos_id is required' // Mensaje de error si el equipos_id no está presente.
        })
});

module.exports = idSchema; // Exporta el esquema de validación para que pueda ser usado en otras partes de la aplicación.
