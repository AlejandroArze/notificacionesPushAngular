const Joi = require("joi");
const { User } = require("../../../models");

const updateStatusDTO = Joi.object({
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

    estado: Joi.number().integer()
        .valid(0, 1)
        .required()
        .messages({
            'number.base': 'El estado debe ser un número entero',
            'any.required': 'El estado es requerido',
            'any.only': 'El estado debe ser 0 o 1'
        }),

    requesterRole: Joi.number().integer()
        .valid(1)
        .required()
        .messages({
            'number.base': 'El rol del solicitante debe ser un número entero',
            'any.required': 'El rol del solicitante es requerido',
            'any.only': 'Solo el administrador (rol 1) puede cambiar el estado'
        })
});

module.exports = updateStatusDTO; 