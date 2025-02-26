const Joi = require("joi"); // Importa la librería Joi para la validación de datos.
const { Service } = require("../../../models"); // Importa el modelo 'Service' desde los modelos, usado para consultar la base de datos.

// Define un esquema de validación para el DTO de 'Service'.
const serviceDTO = Joi.object({
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
module.exports = serviceDTO;
