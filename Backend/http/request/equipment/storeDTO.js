const Joi = require("joi"); // Importa la librería Joi para la validación de datos.

// Define un esquema de validación para el DTO de 'Equipment'.
const storeDTO = Joi.object({
    // Validación del campo 'ip'.
    ip: Joi.string() // Se espera que 'ip' sea una cadena de texto.
        //.required() // Este campo es obligatorio.
        //.min(1) // La longitud mínima es de 1 carácter.
        .max(255) // La longitud máxima es de 255 caracteres.
        .messages({ // Mensajes personalizados para los errores de validación.
            'string.base': 'IP must be a text', // Mensaje si no es una cadena.
            'any.required': 'IP is required', // Mensaje si no se proporciona.
            'string.empty': 'IP cannot be empty', // Mensaje si la cadena está vacía.
        }),

    // Validación del campo 'procesador'.
    procesador: Joi.string() // Se espera que 'procesador' sea una cadena de texto.
        //.required() // Este campo es obligatorio.
        //.min(1) // La longitud mínima es de 1 carácter.
        .max(255) // La longitud máxima es de 255 caracteres.
        .messages({ // Mensajes personalizados para los errores de validación.
            'string.base': 'Processor must be a text',
            'any.required': 'Processor is required',
            'string.empty': 'Processor cannot be empty',
        }),

    // Validación del campo 'funcionariousuario'.
    funcionariousuario: Joi.string() // Se espera que 'funcionariousuario' sea una cadena de texto.
       // .required() // Este campo es obligatorio.
        //.min(1) // La longitud mínima es de 1 carácter.
        .max(255) // La longitud máxima es de 255 caracteres.
        .messages({ // Mensajes personalizados para los errores de validación.
            'string.base': 'User must be a text',
            'any.required': 'User is required',
            'string.empty': 'User cannot be empty',
        }),

    // Validación del campo 'lector'.
    lector: Joi.string() // Se espera que 'lector' sea una cadena de texto.
        //.required() // Este campo es obligatorio.
        //.min(1) // La longitud mínima es de 1 carácter.
        .max(255) // La longitud máxima es de 255 caracteres.
        .messages({ // Mensajes personalizados para los errores de validación.
            'string.base': 'Reader must be a text',
            'any.required': 'Reader is required',
            'string.empty': 'Reader cannot be empty',
        }),

    // Validación del campo 'tarjetavideo'.
    tarjetavideo: Joi.string() // Se espera que 'tarjetavideo' sea una cadena de texto.
        //.required() // Este campo es obligatorio.
        //.min(1) // La longitud mínima es de 1 carácter.
        .max(255) // La longitud máxima es de 255 caracteres.
        .messages({ // Mensajes personalizados para los errores de validación.
            'string.base': 'Video card must be a text',
            'any.required': 'Video card is required',
            'string.empty': 'Video card cannot be empty',
        }),

    // Validación del campo 'funcionarioasignado'.
    funcionarioasignado: Joi.string() // Se espera que 'funcionarioasignado' sea una cadena de texto.
       // .required() // Este campo es obligatorio.
        //.min(1) // La longitud mínima es de 1 carácter.
        .max(255) // La longitud máxima es de 255 caracteres.
        .messages({ // Mensajes personalizados para los errores de validación.
            'string.base': 'Assigned employee must be a text',
            'any.required': 'Assigned employee is required',
            'string.empty': 'Assigned employee cannot be empty',
        }),

    // Validación del campo 'oficina'.
    oficina: Joi.string() // Se espera que 'oficina' sea una cadena de texto.
        //.required() // Este campo es obligatorio.
        //.min(1) // La longitud mínima es de 1 carácter.
        .max(255) // La longitud máxima es de 255 caracteres.
        .messages({ // Mensajes personalizados para los errores de validación.
            'string.base': 'Office must be a text',
            'any.required': 'Office is required',
            'string.empty': 'Office cannot be empty',
        }),

    // Validación del campo 'fecharegistro'.
    fecharegistro: Joi.string() // Se espera que 'fecharegistro' sea una cadena de texto.
        //.required() // Este campo es obligatorio.
       // .min(1) // La longitud mínima es de 1 carácter.
        .max(255) // La longitud máxima es de 255 caracteres.
        .messages({ // Mensajes personalizados para los errores de validación.
            'string.base': 'Registration date must be a text',
            'any.required': 'Registration date is required',
            'string.empty': 'Registration date cannot be empty',
        }),

    // Validación del campo 'codigo'.
    codigo: Joi.string() // Se espera que 'codigo' sea una cadena de texto.
        //.required() // Este campo es obligatorio.
        //.min(1) // La longitud mínima es de 1 carácter.
        .max(255) // La longitud máxima es de 255 caracteres.
        .messages({ // Mensajes personalizados para los errores de validación.
            'string.base': 'Code must be a text',
            'any.required': 'Code is required',
            'string.empty': 'Code cannot be empty',
        }),

    // Validación del campo 'memoria'.
    memoria: Joi.string() // Se espera que 'memoria' sea una cadena de texto.
       // .required() // Este campo es obligatorio.
        //.min(1) // La longitud mínima es de 1 carácter.
        .max(255) // La longitud máxima es de 255 caracteres.
        .messages({ // Mensajes personalizados para los errores de validación.
            'string.base': 'Memory must be a text',
            'any.required': 'Memory is required',
            'string.empty': 'Memory cannot be empty',
        }),

    // Validación del campo 'tarjetamadre'.
    tarjetamadre: Joi.string() // Se espera que 'tarjetamadre' sea una cadena de texto.
       // .required() // Este campo es obligatorio.
        //.min(1) // La longitud mínima es de 1 carácter.
        .max(255) // La longitud máxima es de 255 caracteres.
        .messages({ // Mensajes personalizados para los errores de validación.
            'string.base': 'Motherboard must be a text',
            'any.required': 'Motherboard is required',
            'string.empty': 'Motherboard cannot be empty',
        }),

    // Validación del campo 'antivirus'.
    antivirus: Joi.string() // Se espera que 'antivirus' sea una cadena de texto.
       // .required() // Este campo es obligatorio.
        //.min(1) // La longitud mínima es de 1 carácter.
        .max(255) // La longitud máxima es de 255 caracteres.
        .messages({ // Mensajes personalizados para los errores de validación.
            'string.base': 'Antivirus must be a text',
            'any.required': 'Antivirus is required',
            'string.empty': 'Antivirus cannot be empty',
        }),

    // Validación del campo 'garantia'.
    garantia: Joi.string() // Se espera que 'garantia' sea una cadena de texto.
       // .required() // Este campo es obligatorio.
        //.min(1) // La longitud mínima es de 1 carácter.
        .max(255) // La longitud máxima es de 255 caracteres.
        .messages({ // Mensajes personalizados para los errores de validación.
            'string.base': 'Warranty must be a text',
            'any.required': 'Warranty is required',
            'string.empty': 'Warranty cannot be empty',
        }),

    // Validación del campo 'discoduro'.
    discoduro: Joi.string() // Se espera que 'discoduro' sea una cadena de texto.
       // .required() // Este campo es obligatorio.
        //.min(1) // La longitud mínima es de 1 carácter.
        .max(255) // La longitud máxima es de 255 caracteres.
        .messages({ // Mensajes personalizados para los errores de validación.
            'string.base': 'Hard drive must be a text',
            'any.required': 'Hard drive is required',
            'string.empty': 'Hard drive cannot be empty',
        }),

    // Validación del campo 'marca'.
    marca: Joi.string() // Se espera que 'marca' sea una cadena de texto.
       // .required() // Este campo es obligatorio.
        //.min(1) // La longitud mínima es de 1 carácter.
        .max(255) // La longitud máxima es de 255 caracteres.
        .messages({ // Mensajes personalizados para los errores de validación.
            'string.base': 'Brand must be a text',
            'any.required': 'Brand is required',
            'string.empty': 'Brand cannot be empty',
        }),

    // Validación del campo 'tipo'.
    tipo: Joi.number().integer() // Se espera que 'tipo' sea un número entero.
       // .required() // Este campo es obligatorio.
        .messages({ // Mensajes personalizados para los errores de validación.
            'number.base': 'Type must be a number', // Mensaje si no es un número.
            'any.required': 'Type is required', // Mensaje si no se proporciona.
        }),

    // Validación del campo 'modelo'.
    modelo: Joi.string() // Se espera que 'modelo' sea una cadena de texto.
       // .required() // Este campo es obligatorio.
        //.min(1) // La longitud mínima es de 1 carácter.
        .max(255) // La longitud máxima es de 255 caracteres.
        .messages({ // Mensajes personalizados para los errores de validación.
            'string.base': 'Model must be a text',
            'any.required': 'Model is required',
            'string.empty': 'Model cannot be empty',
        }),

    // Validación del campo 'serie'.
    serie: Joi.string() // Se espera que 'serie' sea una cadena de texto.
       // .required() // Este campo es obligatorio.
        //.min(1) // La longitud mínima es de 1 carácter.
        .max(255) // La longitud máxima es de 255 caracteres.
        .messages({ // Mensajes personalizados para los errores de validación.
            'string.base': 'Series must be a text',
            'any.required': 'Series is required',
            'string.empty': 'Series cannot be empty',
        }),

    // Validación del campo 'so'.
    so: Joi.string() // Se espera que 'so' sea una cadena de texto.
        //.required() // Este campo es obligatorio.
        //.min(1) // La longitud mínima es de 1 carácter.
        .max(255) // La longitud máxima es de 255 caracteres.
        .messages({ // Mensajes personalizados para los errores de validación.
            'string.base': 'Operating system must be a text',
            'any.required': 'Operating system is required',
            'string.empty': 'Operating system cannot be empty',
        }),

    // Validación del campo 'responsable'.
    responsable: Joi.number().integer() // Se espera que 'responsable' sea un número entero.
        //.required() // Este campo es obligatorio.
        .messages({ // Mensajes personalizados para los errores de validación.
            'number.base': 'Responsible person must be a number', // Mensaje si no es un número.
            'any.required': 'Responsible person is required', // Mensaje si no se proporciona.
        }),

    // Validación del campo 'mac'.
    mac: Joi.string() // Se espera que 'mac' sea una cadena de texto.
        //.required() // Este campo es obligatorio.
        //.min(1) // La longitud mínima es de 1 carácter.
        .max(255) // La longitud máxima es de 255 caracteres.
        .messages({ // Mensajes personalizados para los errores de validación.
            'string.base': 'MAC address must be a text',
            'any.required': 'MAC address is required',
            'string.empty': 'MAC address cannot be empty',
        })
});

// Exporta el esquema de validación para que pueda ser utilizado en otras partes de la aplicación.
module.exports = storeDTO;
