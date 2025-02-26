const Joi = require("joi");

module.exports = Joi.object({
  codigo: Joi.string().max(50),
  fecha_hora: Joi.date().iso(),
  oficina: Joi.string().max(100),
});
