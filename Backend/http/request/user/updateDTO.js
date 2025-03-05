const Joi = require("joi"); // Importa la librería Joi para la validación de datos.
const db = require('../../../models'); // Importa todos los modelos
const { Op } = require("sequelize"); // Importa 'Op' de Sequelize para utilizar operadores como 'not equal' (Op.ne) en las consultas.

// Validación personalizada para verificar si el usuario existe
const userExists = async (usuarios_id) => {
    try {
        // Convierte a número entero
        const id = parseInt(usuarios_id, 10);
        
        // Usa el modelo de Usuarios desde db
        const user = await db.Usuarios.findByPk(id);
        
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        
        return id;
    } catch (error) {
        console.error('Error en validación de usuario:', error);
        throw new Error('Error al validar el usuario');
    }
};

// Define el esquema de validación para la actualización de un usuario.
const updateDTO = Joi.object({
    usuarios_id: Joi.number()
        .integer()
        .positive()
        .required()
        .external(userExists),
    
    usuario: Joi.string()
        .trim()
        .min(3)
        .max(50)
        .required(),
    
    nombres: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required(),
    
    apellidos: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required(),
    
    email: Joi.string()
        .email()
        .trim()
        .required(),
    
    password: Joi.string()
        .min(6)
        .required(),
    
    role: Joi.string()
        .valid('1', '2', '3')
        .required(),
    
    estado: Joi.number()
        .integer()
        .valid(0, 1)
        .optional(),
    
    image: Joi.string()
        // Permite rutas locales, URIs y cadenas vacías o nulas
        .pattern(/^(https?:\/\/|\/uploads\/).*$/)
        .optional()
        .allow(null, '')
        .messages({
            'string.pattern.base': 'La imagen debe ser una URL válida o una ruta local de uploads'
        }),
    
    _v: Joi.number()
        .integer()
        .optional()
});

module.exports = updateDTO; // Exporta el esquema de validación para que pueda ser usado en otras partes de la aplicación.
