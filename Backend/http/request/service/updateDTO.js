const Joi = require("joi"); // Importa la librería Joi para la validación de datos.
const { Service } = require("../../../models"); // Importa el modelo 'Service' desde los modelos de base de datos.
const { Op } = require("sequelize"); // Importa 'Op' de Sequelize para utilizar operadores como 'not equal' (Op.ne) en las consultas.

// Define el esquema de validación para la actualización de un servicio.
const updateDTO = Joi.object({

    // Validación del campo 'servicios_id', que debe ser un número entero.
    servicios_id: Joi.number().integer()
        .required() // El campo 'servicios_id' es obligatorio.
        .external( // Validación externa del 'servicios_id' para verificar si existe en la base de datos.
            async (servicios_id) => {
                const exists = await Service.findByPk(servicios_id); // Busca el servicio por su ID (servicios_id) en la base de datos.
                if (!exists) { // Si no existe, lanza un error de validación.
                    throw new Joi.ValidationError('ID no existe', [{ // Error de validación indicando que el ID no existe.
                        message: 'ID no existe', // Mensaje de error.
                        path: ['servicios_id'], // Ruta del campo que generó el error (en este caso, 'servicios_id').
                        type: 'id.not_found', // Tipo de error indicando que el ID no fue encontrado.
                        context: { key: 'servicios_id' } // Contexto del error, con la clave 'servicios_id'.
                    }], servicios_id);
                }
            })
        .messages({
            'number.base': 'El ID debe ser un número entero', // Mensaje de error si el ID no es un número entero.
            'any.required': 'El ID es obligatorio' // Mensaje de error si el ID es obligatorio y no está presente.
        }),

    // Validación del campo 'nombreResponsableEgreso'.
    nombreResponsableEgreso: Joi.string()
        .required()
        .min(1)
        .max(255),

    // Validación del campo 'cargoSolicitante'.
    cargoSolicitante: Joi.string()
        .required()
        .min(1)
        .max(255),

    // Validación del campo 'informe'.
    informe: Joi.string()
        .required()
        .min(1)
        .max(1000), // Ajusta la longitud máxima si es necesario.

    // Validación del campo 'cargoResponsableEgreso'.
    cargoResponsableEgreso: Joi.string()
        .required()
        .min(1)
        .max(255),

    // Validación del campo 'oficinaSolicitante'.
    oficinaSolicitante: Joi.string()
        .required()
        .min(1)
        .max(255),

    // Validación del campo 'fechaRegistro'.
    fechaRegistro: Joi.string()
        .required(),

    // Validación del campo 'equipo'.
    equipo: Joi.number().allow(null),

    // Validación del campo 'problema'.
    problema: Joi.string()
        .required()
        .min(1)
        .max(1000),

    // Validación del campo 'telefonoResponsableEgreso'.
    telefonoResponsableEgreso: Joi.string()
        .required()
        .min(1)
        .max(255),

    // Validación del campo 'gestion'.
    gestion: Joi.number().integer()
        .required(),

    // Validación del campo 'telefonoSolicitante'.
    telefonoSolicitante: Joi.string()
        .required()
        .min(1)
        .max(255),

    // Validación del campo 'tecnicoAsignado'.
    tecnicoAsignado: Joi.number().integer()
        .allow(null)
        .optional(),

    // Validación del campo 'observaciones'.
    observaciones: Joi.string()
        .optional()
        .min(1)
        .max(1000),

    // Validación del campo 'tipoResponsableEgreso'.
    tipoResponsableEgreso: Joi.string()
        .required()
        .min(1)
        .max(255),

    // Validación del campo 'estado'.
    estado: Joi.string()
        .required()
        .min(1)
        .max(255),

    // Validación del campo 'tipoSolicitante'.
    tipoSolicitante: Joi.string()
        .required()
        .min(1)
        .max(255),

    // Validación del campo 'fechaTerminado'.
    fechaTerminado: Joi.string()
        .optional(),

    // Validación del campo 'oficinaResponsableEgreso'.
    oficinaResponsableEgreso: Joi.string()
        .required()
        .min(1)
        .max(255),

    // Validación del campo 'numero'.
    numero: Joi.number().integer()
        .required(),

    // Validación del campo 'fechaInicio'.
    fechaInicio: Joi.string()
        .required(),

    // Validación del campo 'fechaEgreso'.
    fechaEgreso: Joi.string()
        .optional(),

    // Validación del campo 'ciSolicitante'.
    ciSolicitante: Joi.string()
        .required()
        .min(1)
        .max(255),

    // Validación del campo 'nombreSolicitante'.
    nombreSolicitante: Joi.string()
        .required()
        .min(1)
        .max(255),

    // Validación del campo 'tipo'.
    tipo: Joi.string()
        .required()
        .min(1)
        .max(255),

    // Validación del campo 'tecnicoRegistro'.
    tecnicoRegistro: Joi.number().integer()
        .required(),

    // Validación del campo 'tecnicoEgreso'.
    tecnicoEgreso: Joi.string()
        .required()
        .min(1)
        .max(255),

    // Validación del campo 'ciResponsableEgreso'.
    ciResponsableEgreso: Joi.string()
        .required()
        .min(1)
        .max(255),
});

// Exporta el esquema de validación para que pueda ser utilizado en otras partes de la aplicación.
module.exports = updateDTO;
