const Joi = require("joi");
const db = require('../../../models'); // Importa todos los modelos

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

// Define el esquema de validación para la actualización de rol
const updateRoleDTO = Joi.object({
    usuarios_id: Joi.number()
        .integer()
        .positive()
        .required()
        .external(userExists),
    
    role: Joi.string()
        .valid('1', '2', '3')
        .required()
        .messages({
            'any.only': 'El rol no es válido',
            'any.required': 'El rol es obligatorio'
        })
});

module.exports = updateRoleDTO; 