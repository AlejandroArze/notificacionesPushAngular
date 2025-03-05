const Joi = require("joi"); // Importa la librería Joi para validación de datos.
const db = require("../../../models"); // Importa el modelo de 'Usuarios' desde los modelos de base de datos, para verificar la existencia de usuarios por ID.

// Validación personalizada para verificar si el usuario existe
const userExists = async (usuarios_id) => {
    try {
        const user = await db.Usuarios.findByPk(usuarios_id);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        return usuarios_id;
    } catch (error) {
        throw new Error('Error al validar el usuario');
    }
};

// Esquema de validación para el ID de usuario
const idDTO = Joi.object({
    usuarios_id: Joi.number()
        .integer()
        .positive()
        .required()
        .external(userExists)
});

module.exports = idDTO; // Exporta el esquema de validación para que pueda ser usado en otras partes de la aplicación.
