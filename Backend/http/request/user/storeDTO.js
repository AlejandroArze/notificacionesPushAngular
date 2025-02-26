const Joi = require("joi"); // Importa la librería Joi para la validación de datos.
const { User } = require("../../../models"); // Importa el modelo 'User' desde los modelos, usado para consultar la base de datos.

// Define un esquema de validación para el DTO del usuario.
const userDTO = Joi.object({
    
    // Validación del campo 'usuario' (nombre de usuario).
    usuario: Joi.string() // Define que el campo 'usuario' debe ser una cadena de texto.
        .required() // El campo 'usuario' es obligatorio.
        .external( // Valida el campo 'usuario' de manera externa.
            async (usuario) => { // Función asíncrona para verificar si el 'usuario' ya existe en la base de datos.
                const existsUsuario = await User.findOne({ where: { usuario: usuario } }); // Busca si el 'usuario' ya existe en la tabla 'usuarios'.
                if (existsUsuario) { // Si existe, lanza un error de validación personalizado.
                    throw new Joi.ValidationError("Username is already taken", [{ // Lanza un error de validación con el mensaje correspondiente.
                        message: "Username is already taken", // Mensaje de error si el nombre de usuario ya está en uso.
                        path: ["usuario"], // Especifica la ruta del campo 'usuario' que generó el error.
                        type: "unique.usuario", // Tipo de error indicando que el 'usuario' ya está en uso.
                        context: { key: "usuario" } // Contexto adicional, que en este caso es la clave 'usuario'.
                    }], usuario); // Pasa el valor del 'usuario' como referencia.
                }
            }
        ),
    
    // Validación del campo 'password'.
    password: Joi.string() // Define que el campo 'password' debe ser una cadena de texto.
        .required(), // El campo 'password' es obligatorio.
    
    // Validación del campo 'email'.
    email: Joi.string() // Define que el campo 'email' debe ser una cadena de texto.
        .email() // Valida que el formato del campo 'email' sea un correo electrónico válido.
        .required() // El campo 'email' es obligatorio.
        .external( // Valida el campo 'email' de manera externa.
            async (email) => { // Función asíncrona para verificar si el 'email' ya existe en la base de datos.
                const existsEmail = await User.findOne({ where: { email: email } }); // Busca si el 'email' ya existe en la tabla 'usuarios'.
                if (existsEmail) { // Si el correo electrónico ya existe, lanza un error de validación personalizado.
                    throw new Joi.ValidationError("Email is already taken", [{ // Lanza un error de validación si el correo electrónico ya está registrado.
                        message: "Email is already taken", // Mensaje de error si el correo electrónico ya está en uso.
                        path: ["email"], // Especifica la ruta del campo 'email' que generó el error.
                        type: "unique.email", // Tipo de error indicando que el 'email' ya está en uso.
                        context: { key: "email" } // Contexto adicional, que en este caso es la clave 'email'.
                    }], email); // Pasa el valor del 'email' como referencia.
                }
            }
        ),
    
    // Validación del campo 'nombres'.
    nombres: Joi.string() // Define que el campo 'nombres' debe ser una cadena de texto.
        .required(), // El campo 'nombres' es obligatorio.

    // Validación del campo 'apellidos'.
    apellidos: Joi.string() // Define que el campo 'apellidos' debe ser una cadena de texto.
        .required(), // El campo 'apellidos' es obligatorio.

    // Validación del campo 'role' (rol del usuario).
    role: Joi.string() // Define que el campo 'role' debe ser una cadena de texto.
        .required(), // El campo 'role' es obligatorio.

    // Validación del campo 'estado', que es un número entero.
    estado: Joi.number().integer() // Define que el campo 'estado' es un número entero.
        .required(), // El campo 'estado' es obligatorio.

    // Validación del campo 'image' (imagen de perfil del usuario).
    image: Joi.string() // Define que el campo 'image' puede ser una URL o ruta a la imagen.
        .optional() // El campo 'image' es opcional.
});

module.exports = userDTO; // Exporta el esquema de validación para que pueda ser utilizado en otras partes de la aplicación.
