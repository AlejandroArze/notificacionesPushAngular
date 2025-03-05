const Joi = require("joi"); // Importa la librería Joi para la validación de datos.
const db = require('../../../models'); // Importa todos los modelos
const { Op } = require("sequelize");

// Validación personalizada para verificar si el usuario o email ya existen
const validateUniqueUser = async (data) => {
    try {
        // Busca si ya existe un usuario con el mismo email o nombre de usuario
        const existingUser = await db.Usuarios.findOne({
            where: {
                [Op.or]: [
                    { email: data.email },
                    { usuario: data.usuario }
                ]
            }
        });

        if (existingUser) {
            if (existingUser.email === data.email) {
                throw new Error('El correo electrónico ya está registrado');
            }
            if (existingUser.usuario === data.usuario) {
                throw new Error('El nombre de usuario ya está en uso');
            }
        }

        return data;
    } catch (error) {
        console.error('Error en validación de usuario único:', error);
        throw error;
    }
};

// Define un esquema de validación para el DTO del usuario.
const userDTO = Joi.object({
    
    // Validación del campo 'usuario' (nombre de usuario).
    usuario: Joi.string() // Define que el campo 'usuario' debe ser una cadena de texto.
        .trim()
        .min(3)
        .max(50)
        .required()
        .messages({
            'string.min': 'El nombre de usuario debe tener al menos 3 caracteres',
            'string.max': 'El nombre de usuario no puede tener más de 50 caracteres',
            'any.required': 'El nombre de usuario es obligatorio'
        })
        .external( // Valida el campo 'usuario' de manera externa.
            async (usuario) => { // Función asíncrona para verificar si el 'usuario' ya existe en la base de datos.
                const existsUsuario = await db.Usuarios.findOne({ where: { usuario: usuario } }); // Busca si el 'usuario' ya existe en la tabla 'usuarios'.
                if (existsUsuario) { // Si existe, lanza un error de validación personalizado.
                    throw new Joi.ValidationError("Username is already taken", [{ // Lanza un error de validación con el mensaje correspondiente.
                        message: "Username is already taken", // Mensaje de error si el nombre de usuario ya está en uso.
                        path: ["usuario"], // Especifica la ruta del campo 'usuario' que generó el error.
                        type: "unique.usuario", // Tipo de error indicando que el 'usuario' ya está en uso.
                        context: { key: "usuario" } // Contexto adicional, que en este caso es la clave 'usuario'.
                    }], usuario); // Pasa el valor del 'usuario' como referencia.
                }
            }
        ),
    
    // Validación del campo 'password'.
    password: Joi.string() // Define que el campo 'password' debe ser una cadena de texto.
        .min(6)
        .required()
        .messages({
            'string.min': 'La contraseña debe tener al menos 6 caracteres',
            'any.required': 'La contraseña es obligatoria'
        }),
    
    // Validación del campo 'email'.
    email: Joi.string() // Define que el campo 'email' debe ser una cadena de texto.
        .email() // Valida que el formato del campo 'email' sea un correo electrónico válido.
        .trim()
        .required()
        .messages({
            'string.email': 'El correo electrónico no es válido',
            'any.required': 'El correo electrónico es obligatorio'
        })
        .external( // Valida el campo 'email' de manera externa.
            async (email) => { // Función asíncrona para verificar si el 'email' ya existe en la base de datos.
                const existsEmail = await db.Usuarios.findOne({ where: { email: email } }); // Busca si el 'email' ya existe en la tabla 'usuarios'.
                if (existsEmail) { // Si el correo electrónico ya existe, lanza un error de validación personalizado.
                    throw new Joi.ValidationError("Email is already taken", [{ // Lanza un error de validación si el correo electrónico ya está registrado.
                        message: "Email is already taken", // Mensaje de error si el correo electrónico ya está en uso.
                        path: ["email"], // Especifica la ruta del campo 'email' que generó el error.
                        type: "unique.email", // Tipo de error indicando que el 'email' ya está en uso.
                        context: { key: "email" } // Contexto adicional, que en este caso es la clave 'email'.
                    }], email); // Pasa el valor del 'email' como referencia.
                }
            }
        ),
    
    // Validación del campo 'nombres'.
    nombres: Joi.string() // Define que el campo 'nombres' debe ser una cadena de texto.
        .trim()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.min': 'Los nombres deben tener al menos 2 caracteres',
            'string.max': 'Los nombres no pueden tener más de 100 caracteres',
            'any.required': 'Los nombres son obligatorios'
        }),

    // Validación del campo 'apellidos'.
    apellidos: Joi.string() // Define que el campo 'apellidos' debe ser una cadena de texto.
        .trim()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.min': 'Los apellidos deben tener al menos 2 caracteres',
            'string.max': 'Los apellidos no pueden tener más de 100 caracteres',
            'any.required': 'Los apellidos son obligatorios'
        }),

    // Validación del campo 'role' (rol del usuario).
    role: Joi.string() // Define que el campo 'role' debe ser una cadena de texto.
        .valid('1', '2', '3')
        .required()
        .messages({
            'any.only': 'El rol no es válido',
            'any.required': 'El rol es obligatorio'
        }),

    // Validación del campo 'estado', que es un número entero.
    estado: Joi.number()
        .integer()
        .valid(0, 1)
        .optional()
        .default(1)
        .messages({
            'number.integer': 'El estado debe ser un número entero',
            'any.only': 'El estado solo puede ser 0 o 1'
        }),

    // Validación del campo 'image' (imagen de perfil del usuario).
    image: Joi.string() // Define que el campo 'image' puede ser una URL o ruta a la imagen.
        .pattern(/^(https?:\/\/|\/uploads\/).*$/)
        .optional()
        .allow(null, '')
        .messages({
            'string.pattern.base': 'La imagen debe ser una URL válida o una ruta local de uploads'
        })
})
.external(validateUniqueUser);

module.exports = userDTO; // Exporta el esquema de validación para que pueda ser utilizado en otras partes de la aplicación.
