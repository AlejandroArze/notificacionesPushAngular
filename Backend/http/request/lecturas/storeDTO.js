const Joi = require("joi");

module.exports = Joi.object({
  codigo: Joi.string().max(50).required(),
  fecha_hora: Joi.date().iso().required(),
  oficina: Joi.string().max(100).required(),
});
