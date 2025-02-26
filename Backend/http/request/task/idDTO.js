const Joi = require("joi"); // Importa la librería Joi para validación de datos.
const { Task } = require("../../../models"); // Importa el modelo 'Task' desde los modelos de base de datos, para verificar la existencia de tipos por ID.

const idSchema = Joi.object({ // Define un esquema de validación de objeto utilizando Joi.
    tareas_id: Joi.number() // Define que el campo 'tareas_id' debe ser un número.
        .required() // Indica que el campo 'tareas_id' es obligatorio.
        .external(async (tareas_id) => { // Función asíncrona externa para validación personalizada.
            const exists = await Task.findByPk(tareas_id); // Busca el tipo por su ID (tareas_id) en la base de datos utilizando el método `findByPk`.
            if (!exists) { // Si el tipo no existe, lanza un error de validación.
                throw new Joi.ValidationError('tareas_id does not exist', [{ // Crea un nuevo error de validación con el mensaje de que el ID no existe.
                    message: 'tareas_id does not exist', // Mensaje del error.
                    path: ['tareas_id'], // Ruta del campo que generó el error (en este caso, 'tareas_id').
                    type: 'id.not_found', // Tipo de error personalizado indicando que el ID no fue encontrado.
                    context: { key: 'tareas_id' } // Proporciona el contexto del error con la clave que falló (en este caso, 'tareas_id').
                }], tareas_id); // Asigna el valor del ID al error para referencia.
            }
        })
        .messages({ // Personaliza los mensajes de error para la validación del tareas_id.
            'number.base': 'tareas_id must be a number', // Mensaje de error si el tareas_id no es un número.
            'any.required': 'tareas_id is required' // Mensaje de error si el tareas_id no está presente.
        })
});

module.exports = idSchema; // Exporta el esquema de validación para que pueda ser usado en otras partes de la aplicación.
