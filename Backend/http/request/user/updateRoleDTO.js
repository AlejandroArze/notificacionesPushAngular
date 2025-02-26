const Joi = require("joi");
const { User } = require("../../../models");

const updateRoleDTO = Joi.object({
    usuarios_id: Joi.number().integer()
        .required()
        .external(async (usuarios_id) => {
            const exists = await User.findByPk(usuarios_id);
            if (!exists) {
                throw new Joi.ValidationError('ID does not exist', [{
                    message: 'ID does not exist',
                    path: ['usuarios_id'],
                    type: 'id.not_found',
                    context: { key: 'usuarios_id' }
                }], usuarios_id);
            }
        })
        .messages({
            'number.base': 'ID debe ser un número entero',
            'any.required': 'ID es requerido'
        }),

    role: Joi.number().integer()
        .valid(1, 2, 3)
        .required()
        .messages({
            'number.base': 'El rol debe ser un número entero',
            'any.required': 'El rol es requerido',
            'any.only': 'El rol debe ser 1, 2 o 3'
        }),

    requesterRole: Joi.number().integer()
        .valid(1, 2)
        .required()
        .messages({
            'number.base': 'El rol del solicitante debe ser un número entero',
            'any.required': 'El rol del solicitante es requerido',
            'any.only': 'El rol del solicitante debe ser 1 o 2'
        })
});

module.exports = updateRoleDTO; 