const Joi = require("joi"); // Importa la librería Joi para validación de datos.
const { User } = require("../../../models"); // Importa el modelo 'User' desde los modelos de base de datos.

const loginSchema = Joi.object({
    email: Joi.string() // Define que el campo 'email' debe ser una cadena de texto.
        .email() // Valida que el campo sea un correo electrónico válido.
        .required() // Indica que el campo 'email' es obligatorio.
        .messages({
            'string.email': 'El correo electrónico debe ser válido',
            'any.required': 'El correo electrónico es requerido'
        }),

    password: Joi.string() // Define que el campo 'password' debe ser una cadena de texto.
        .min(6) // Valida que la contraseña tenga al menos 6 caracteres.
        .required() // Indica que el campo 'password' es obligatorio.
        .messages({
            'string.min': 'Password must be at least 6 characters long', // Mensaje de error para contraseñas cortas
            'any.required': 'La contraseña es requerida' // Mensaje cuando el campo es obligatorio
        })
});

module.exports = loginSchema;



