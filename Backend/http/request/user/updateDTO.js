const Joi = require("joi"); // Importa la librería Joi para la validación de datos.
const { User } = require("../../../models"); // Importa el modelo de 'User' desde los modelos de base de datos.
const { Op } = require("sequelize"); // Importa 'Op' de Sequelize para utilizar operadores como 'not equal' (Op.ne) en las consultas.

// Define el esquema de validación para la actualización de un usuario.
const updateDTO = Joi.object({

    // Validación del campo 'usuarios_id', que debe ser un número entero.
    usuarios_id: Joi.number().integer()
        .required() // El campo 'usuarios_id' es obligatorio.
        .external( // Validación externa del 'usuarios_id' para verificar si existe en la base de datos.
            async (usuarios_id) => {
                const exists = await User.findByPk(usuarios_id); // Busca el usuario por su ID (usuarios_id) en la base de datos.
                if (!exists) { // Si no existe, lanza un error de validación.
                    throw new Joi.ValidationError('ID does not exist', [{ // Error de validación indicando que el ID no existe.
                        message: 'ID does not exist', // Mensaje de error.
                        path: ['usuarios_id'], // Ruta del campo que generó el error (en este caso, 'usuarios_id').
                        type: 'id.not_found', // Tipo de error indicando que el ID no fue encontrado.
                        context: { key: 'usuarios_id' } // Contexto del error, con la clave 'usuarios_id'.
                    }], usuarios_id);
                }
            })
        .messages({
            'number.base': 'ID must be an integer', // Mensaje de error si el ID no es un número entero.
            'any.required': 'ID is required' // Mensaje de error si el ID es obligatorio y no está presente.
        }),

    // Validación del campo 'usuario' (nombre de usuario).
    usuario: Joi.string() // Refleja el nombre de usuario como 'usuario' en la base de datos.
        .required() // El campo 'usuario' es obligatorio.
        .external( // Validación externa para verificar si el 'usuario' ya está en uso.
            async (usuario, helpers) => {
                const usuarios_id = helpers?.state?.ancestors?.[0]?.usuarios_id; // Obtiene el ID del usuario del contexto de validación.
                const existsUsername = await User.findOne({
                    where: {
                        usuario: usuario, // Verifica si el 'usuario' ya está en uso.
                        usuarios_id: usuarios_id ? { [Op.ne]: usuarios_id } : undefined // Excluye el ID actual de la búsqueda.
                    }
                });
                if (existsUsername) { // Si el nombre de usuario ya existe, lanza un error de validación.
                    throw new Joi.ValidationError("Username is already taken", [{ // Error de validación indicando que el 'usuario' ya está en uso.
                        message: "Username is already taken", // Mensaje de error.
                        path: ["usuario"], // Ruta del campo que generó el error (en este caso, 'usuario').
                        type: "unique.username", // Tipo de error indicando que el 'usuario' ya está en uso.
                        context: { key: "usuario" } // Contexto del error, con la clave 'usuario'.
                    }], usuario);
                }
            }
        ),

    // Validación del campo 'password'.
    password: Joi.string()
        .required(), // El campo 'password' es obligatorio.

    // Validación del campo 'email'.
    email: Joi.string()
        .email() // El campo debe tener formato de correo electrónico.
        .required() // El campo 'email' es obligatorio.
        .external( // Validación externa para verificar si el 'email' ya está en uso.
            async (email, helpers) => {
                const usuarios_id = helpers?.state?.ancestors?.[0]?.usuarios_id; // Obtiene el ID del usuario del contexto de validación.
                const existsEmail = await User.findOne({
                    where: {
                        email: email, // Verifica si el 'email' ya está en uso.
                        usuarios_id: usuarios_id ? { [Op.ne]: usuarios_id } : undefined // Excluye el ID actual de la búsqueda.
                    }
                });
                if (existsEmail) { // Si el correo electrónico ya existe, lanza un error de validación.
                    throw new Joi.ValidationError("Email is already taken", [{ // Error de validación indicando que el 'email' ya está en uso.
                        message: "Email is already taken", // Mensaje de error.
                        path: ["email"], // Ruta del campo que generó el error (en este caso, 'email').
                        type: "unique.email", // Tipo de error indicando que el 'email' ya está en uso.
                        context: { key: "email" } // Contexto del error, con la clave 'email'.
                    }], email);
                }
            }
        ),

    // Validación del campo 'nombres'.
    nombres: Joi.string() // Refleja el campo 'nombres' en la base de datos.
        .required(), // El campo 'nombres' es obligatorio.

    // Validación del campo 'apellidos'.
    apellidos: Joi.string() // Refleja el campo 'apellidos' en la base de datos.
        .required(), // El campo 'apellidos' es obligatorio.

    // Validación del campo 'role' (rol del usuario).
    role: Joi.string() // Refleja el campo 'role' en la base de datos.
        .required(), // El campo 'role' es obligatorio.

    // Validación del campo 'estado', que es un número entero.
    estado: Joi.number().integer() // Refleja el campo 'estado', que es un número (entero).
        .required(), // El campo 'estado' es obligatorio.

    // Validación del campo 'image' (imagen de perfil del usuario).
    image: Joi.string() // Refleja el campo 'image', que puede ser una URL o ruta a la imagen.
        .optional() // El campo 'image' es opcional.
});

module.exports = updateDTO; // Exporta el esquema de validación para que pueda ser usado en otras partes de la aplicación.
