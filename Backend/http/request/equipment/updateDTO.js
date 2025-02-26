const Joi = require("joi"); // Importa la librería Joi para la validación de datos.
const { Equipment } = require("../../../models"); // Importa el modelo 'Equipment' desde los modelos de base de datos.
const { Op } = require("sequelize"); // Importa 'Op' de Sequelize para utilizar operadores en las consultas.

// Define el esquema de validación para la actualización de un equipo.
const updateDTO = Joi.object({

    // Validación del campo 'equipos_id', que debe ser un número entero.
    equipos_id: Joi.number().integer()
        .required() // El campo 'equipos_id' es obligatorio.
        .external( // Validación externa del 'equipos_id' para verificar si existe en la base de datos.
            async (equipos_id) => {
                const exists = await Equipment.findByPk(equipos_id); // Busca el equipo por su ID (equipos_id) en la base de datos.
                if (!exists) { // Si no existe, lanza un error de validación.
                    throw new Joi.ValidationError('ID does not exist', [{ // Error de validación indicando que el ID no existe.
                        message: 'ID does not exist', // Mensaje de error.
                        path: ['equipos_id'], // Ruta del campo que generó el error (en este caso, 'equipos_id').
                        type: 'id.not_found', // Tipo de error indicando que el ID no fue encontrado.
                        context: { key: 'equipos_id' } // Contexto del error, con la clave 'equipos_id'.
                    }], equipos_id);
                }
            })
        .messages({
            'number.base': 'ID must be an integer', // Mensaje de error si el ID no es un número entero.
            'any.required': 'ID is required' // Mensaje de error si el ID es obligatorio y no está presente.
        }),

    // Validación del campo 'ip'.
    ip: Joi.string() // Define que el campo 'ip' debe ser una cadena de texto.
        .required() // El campo 'ip' es obligatorio.
        .min(1) // Asegura que no sea una cadena vacía.
        .max(255), // Limita la longitud máxima (ajusta según tus necesidades).

    // Validación del campo 'procesador'.
    procesador: Joi.string() // Define que el campo 'procesador' debe ser una cadena de texto.
        .required() // El campo 'procesador' es obligatorio.
        .min(1) // Asegura que no sea una cadena vacía.
        .max(255), // Limita la longitud máxima (ajusta según tus necesidades).

    // Validación del campo 'funcionariousuario'.
    funcionariousuario: Joi.string() // Define que el campo 'funcionariousuario' debe ser una cadena de texto.
        .required() // El campo 'funcionariousuario' es obligatorio.
        .min(1) // Asegura que no sea una cadena vacía.
        .max(255), // Limita la longitud máxima (ajusta según tus necesidades).

    // Validación del campo 'lector'.
    lector: Joi.string() // Define que el campo 'lector' debe ser una cadena de texto.
        .required() // El campo 'lector' es obligatorio.
        .min(1) // Asegura que no sea una cadena vacía.
        .max(255), // Limita la longitud máxima (ajusta según tus necesidades).

    // Validación del campo 'tarjetavideo'.
    tarjetavideo: Joi.string() // Define que el campo 'tarjetavideo' debe ser una cadena de texto.
        .required() // El campo 'tarjetavideo' es obligatorio.
        .min(1) // Asegura que no sea una cadena vacía.
        .max(255), // Limita la longitud máxima (ajusta según tus necesidades).

    // Validación del campo 'funcionarioasignado'.
    funcionarioasignado: Joi.string() // Define que el campo 'funcionarioasignado' debe ser una cadena de texto.
        .required() // El campo 'funcionarioasignado' es obligatorio.
        .min(1) // Asegura que no sea una cadena vacía.
        .max(255), // Limita la longitud máxima (ajusta según tus necesidades).

    // Validación del campo 'oficina'.
    oficina: Joi.string() // Define que el campo 'oficina' debe ser una cadena de texto.
        .required() // El campo 'oficina' es obligatorio.
        .min(1) // Asegura que no sea una cadena vacía.
        .max(255), // Limita la longitud máxima (ajusta según tus necesidades).

    // Validación del campo 'fecharegistro'.
    fecharegistro: Joi.string() // Define que el campo 'fecharegistro' debe ser una cadena de texto.
        .required() // El campo 'fecharegistro' es obligatorio.
        .min(1) // Asegura que no sea una cadena vacía.
        .max(255), // Limita la longitud máxima (ajusta según tus necesidades).

    // Validación del campo 'codigo'.
    codigo: Joi.string() // Define que el campo 'codigo' debe ser una cadena de texto.
        .required() // El campo 'codigo' es obligatorio.
        .min(1) // Asegura que no sea una cadena vacía.
        .max(255), // Limita la longitud máxima (ajusta según tus necesidades).

    // Validación del campo 'memoria'.
    memoria: Joi.string() // Define que el campo 'memoria' debe ser una cadena de texto.
        .required() // El campo 'memoria' es obligatorio.
        .min(1) // Asegura que no sea una cadena vacía.
        .max(255), // Limita la longitud máxima (ajusta según tus necesidades).

    // Validación del campo 'tarjetamadre'.
    tarjetamadre: Joi.string() // Define que el campo 'tarjetamadre' debe ser una cadena de texto.
        .required() // El campo 'tarjetamadre' es obligatorio.
        .min(1) // Asegura que no sea una cadena vacía.
        .max(255), // Limita la longitud máxima (ajusta según tus necesidades).

    // Validación del campo 'antivirus'.
    antivirus: Joi.string() // Define que el campo 'antivirus' debe ser una cadena de texto.
        .required() // El campo 'antivirus' es obligatorio.
        .min(1) // Asegura que no sea una cadena vacía.
        .max(255), // Limita la longitud máxima (ajusta según tus necesidades).

    // Validación del campo 'garantia'.
    garantia: Joi.string() // Define que el campo 'garantia' debe ser una cadena de texto.
        .required() // El campo 'garantia' es obligatorio.
        .min(1) // Asegura que no sea una cadena vacía.
        .max(255), // Limita la longitud máxima (ajusta según tus necesidades).

    // Validación del campo 'discoduro'.
    discoduro: Joi.string() // Define que el campo 'discoduro' debe ser una cadena de texto.
        .required() // El campo 'discoduro' es obligatorio.
        .min(1) // Asegura que no sea una cadena vacía.
        .max(255), // Limita la longitud máxima (ajusta según tus necesidades).

    // Validación del campo 'marca'.
    marca: Joi.string() // Define que el campo 'marca' debe ser una cadena de texto.
        .required() // El campo 'marca' es obligatorio.
        .min(1) // Asegura que no sea una cadena vacía.
        .max(255), // Limita la longitud máxima (ajusta según tus necesidades).

    // Validación del campo 'tipo', que es un número entero.
    tipo: Joi.number().integer() // Define que el campo 'tipo' es un número entero.
        .required(), // El campo 'tipo' es obligatorio.

    // Validación del campo 'modelo'.
    modelo: Joi.string() // Define que el campo 'modelo' debe ser una cadena de texto.
        .required() // El campo 'modelo' es obligatorio.
        .min(1) // Asegura que no sea una cadena vacía.
        .max(255), // Limita la longitud máxima (ajusta según tus necesidades).

    // Validación del campo 'serie'.
    serie: Joi.string() // Define que el campo 'serie' debe ser una cadena de texto.
        //.required() // El campo 'serie' es obligatorio.
        .min(1) // Asegura que no sea una cadena vacía.
        .max(255), // Limita la longitud máxima (ajusta según tus necesidades).

    // Validación del campo 'so'.
    so: Joi.string() // Define que el campo 'so' debe ser una cadena de texto.
        .required() // El campo 'so' es obligatorio.
        .min(1) // Asegura que no sea una cadena vacía.
        .max(255), // Limita la longitud máxima (ajusta según tus necesidades).

    // Validación del campo 'responsable', que es un número entero.
    responsable: Joi.number().integer() // Define que el campo 'responsable' es un número entero.
        .required(), // El campo 'responsable' es obligatorio.

    // Validación del campo 'mac'.
    mac: Joi.string() // Define que el campo 'mac' debe ser una cadena de texto.
        //S.required() // El campo 'mac' es obligatorio.
        .min(1) // Asegura que no sea una cadena vacía.
        .max(255), // Limita la longitud máxima (ajusta según tus necesidades).
});

// Exporta el esquema de validación para que pueda ser utilizado en otras partes de la aplicación.
module.exports = updateDTO;
