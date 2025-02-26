const Joi = require("joi"); // Importa la librería Joi para validación de datos.
const { User } = require("../../../models"); // Importa el modelo de 'User' desde los modelos de base de datos, para verificar la existencia de usuarios por ID.

const idSchema = Joi.object({ // Define un esquema de validación de objeto utilizando Joi.
    usuarios_id: Joi.number() // Define que el campo 'usuarios_id' debe ser un número.
        .required() // Indica que el campo 'usuarios_id' es obligatorio.
        .external(async (usuarios_id) => { // Función asíncrona externa para validación personalizada.
            const exists = await User.findByPk(usuarios_id); // Busca el usuario por su ID (usuarios_id) en la base de datos utilizando el método `findByPk`.
            if (!exists) { // Si el usuario no existe, lanza un error de validación.
                throw new Joi.ValidationError('usuarios_id does not exist', [{ // Crea un nuevo error de validación con el mensaje de que el ID no existe.
                    message: 'usuarios_id does not exist', // Mensaje del error.
                    path: ['usuarios_id'], // Ruta del campo que generó el error (en este caso, 'usuarios_id').
                    type: 'id.not_found', // Tipo de error personalizado indicando que el ID no fue encontrado.
                    context: { key: 'usuarios_id' } // Proporciona el contexto del error con la clave que falló (en este caso, 'usuarios_id').
                }], usuarios_id); // Asigna el valor del ID al error para referencia.
            }
        })
        .messages({ // Personaliza los mensajes de error para la validación del usuarios_id.
            'number.base': 'usuarios_id must be a number', // Mensaje de error si el usuarios_id no es un número.
            'any.required': 'usuarios_id is required' // Mensaje de error si el usuarios_id no está presente.
        })
});

module.exports = idSchema; // Exporta el esquema de validación para que pueda ser usado en otras partes de la aplicación.
