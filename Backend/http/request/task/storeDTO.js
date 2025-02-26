const Joi = require("joi"); // Importa la librería Joi para la validación de datos.
const { Task } = require("../../../models"); // Importa el modelo 'Task' desde los modelos, usado para consultar la base de datos.

// Define un esquema de validación para el DTO de 'Tarea'.
const taskDTO = Joi.object({
    // Validación del campo 'descripcion'.
    descripcion: Joi.string() // Define que el campo 'descripcion' debe ser una cadena de texto.
        .required() // El campo 'descripcion' es obligatorio.
        .min(1) // Asegura que no sea una cadena vacía.
        .max(255), // Limita la longitud máxima (ajusta según tus necesidades).

    // Validación del campo 'servicio', que es una referencia a la tabla 'servicios'.
    servicio: Joi.number().integer() // Define que el campo 'servicio' es un número entero.
        .required(), // El campo 'servicio' es obligatorio.

    // Validación del campo 'fecha', que es de tipo texto.
    fecha: Joi.string() // Define que el campo 'fecha' debe ser una cadena de texto.
        .required() // El campo 'fecha' es obligatorio.
        .min(1) // Asegura que no sea una cadena vacía.
        .max(255), // Limita la longitud máxima (ajusta según tus necesidades).

    // 'tareas_id' es la clave primaria y se maneja automáticamente por la base de datos, no se incluye en el DTO.
});

// Exporta el esquema de validación para que pueda ser utilizado en otras partes de la aplicación.
module.exports = taskDTO;
