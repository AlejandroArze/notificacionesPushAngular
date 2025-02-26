const Joi = require('joi');

// Define el esquema de validación para el rango de fechas
const dateRangeDTO = Joi.object({
    fechaInicio: Joi.string().allow(null, ''),
    fechaFin: Joi.string().allow(null, ''),
    tipo: Joi.string().allow(null, '', 'null', 'undefined'),
    tecnicoAsignado: Joi.alternatives().try(
        Joi.number(),
        Joi.string().valid('null', '')
    ).allow(null),
    estado: Joi.string().allow(null, '', 'null', 'undefined'),
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).default(10)
});

module.exports = dateRangeDTO; 