// Importa el servicio 'user' desde la carpeta 'service'
const userService = require("../service/user");
// Importa una utilidad para responder en formato JSON
const jsonResponse = require("../http/response/jsonResponse");
// Importa el Data Transfer Object (DTO) que define la estructura de un usuario
const UserDTO = require("../http/request/user/responseDTO");
const { updateDTO } = require('../http/request/user/updateDTO');
const db = require('../models');
const bcrypt = require('bcryptjs');
const loginSchema = require("../http/request/user/loginDTO");
// Importa Joi para validación de datos
const Joi = require("joi");

const jwt = require('jsonwebtoken');



class UserController {

    // Método para iniciar sesión
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            console.log('Iniciando proceso de login con datos:', { email, password });
            
            // Valida el cuerpo de la solicitud   
            await loginSchema.validateAsync(req.body);
            console.log('Validación del schema exitosa');

            // Usa findOne sin especificar columnas especiales
            const user = await db.Usuarios.findOne({ 
                where: { email: email },
                // Opcional: excluir columnas no deseadas
                attributes: { 
                    exclude: ['__v'] 
                }
            });
            console.log('Usuario encontrado:', user ? 'Sí' : 'No');

            if (!user) {
                console.log('Usuario no encontrado con email:', email);
                return res.status(404).json({ message: 'El usuario no existe con ese correo electrónico' });
            }

            // Verifica la contraseña
            console.log('Comparando contraseñas...');
            const isPasswordValid = await bcrypt.compare(password, user.password);
            console.log('Contraseña válida:', isPasswordValid);

            if (!isPasswordValid) {
                console.log('Contraseña incorrecta para usuario:', email);
                return res.status(401).json({ message: 'La contraseña es incorrecta' });
            }

            // Genera el token
            const token = jwt.sign(
                { id: user.usuarios_id, email: user.email, role: user.role},
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );
            console.log('Token generado:', token);

            return res.status(200).json({
                message: 'Inicio de sesión exitoso',
                user: {
                    id: user.usuarios_id,
                    email: user.email,
                    role: user.role
                },
                token
            });

        } catch (error) {
            console.error('Error detallado durante el inicio de sesión:', error);
            
            // Manejo más detallado de errores
            if (error.name === 'SequelizeDatabaseError') {
                return jsonResponse.errorResponse(
                    res, 
                    500, 
                    'Error en la base de datos', 
                    error.message
                );
            }

            return jsonResponse.errorResponse(
                res, 
                500, 
                'Error en el inicio de sesión', 
                error.message
            );
        }
    }
    //Método para iniciar sesion con el token
    static async loginToken(req, res) {
        try {
            const { accessToken } = req.body;

            // Verificar si se envió el token
            if (!accessToken) {
                return res.status(400).json({ message: 'Token de acceso requerido' });
            }

            // Verificar y decodificar el token
            jwt.verify(accessToken, process.env.JWT_SECRET || 'default_secret', async (err, decoded) => {
                if (err) {
                    return res.status(401).json({ message: 'Token no válido o expirado' });
                }

                // Buscar al usuario en la base de datos usando la información del token
                const user = await db.Usuarios.findOne({ where: { usuarios_id: decoded.id } });

                if (!user) {
                    return res.status(404).json({ message: 'Usuario no encontrado' });
                }

                // Si el token es válido, devolver la información del usuario
                return res.status(200).json({
                    message: 'Autenticación exitosa con el token',
                    user: {
                        id: user.usuarios_id,
                        email: user.email,
                        role: user.role
                    },
                    accessToken  // Devolver el token actual
                });
            });

        } catch (error) {
            console.error('Error durante la autenticación con token:', error);
            return res.status(500).json({ message: 'Ocurrió un error inesperado' });
        }
    }


       /* // Método estático asíncrono para crear un nuevo usuario
        static async store(req, res) {
            try {
                // Desestructura los campos necesarios para el nuevo usuario desde req.body
                const { email, usuario, nombres, apellidos, password, role, image, estado } = req.body;
                //console.log(req.body)
                // Asegura que el campo `estado` sea tratado como número
                const estadoInt = parseInt(estado, 10);

                let imagePath = null;
                if (req.file) {
                   imagePath = req.file.path; // Aquí obtienes el path del archivo subido
                }
    
                // Crea un nuevo usuario utilizando el servicio 'userService'
                const { usuarios_id } = await userService.store({ email, usuario, nombres, apellidos, password, role, image: imagePath, estado: estadoInt });
    
                // Crea un nuevo DTO del usuario con los datos creados
                const newUser = new UserDTO(usuarios_id, email, usuario, nombres, apellidos, role, image, estadoInt);
    
                // Retorna una respuesta exitosa en formato JSON indicando que el usuario ha sido registrado
                return jsonResponse.successResponse(
                    res,
                    201,
                    "User has been registered successfully",
                    newUser
                );
            } catch (error) {
                // Si hay un error de validación de Joi, retorna una respuesta de validación  
                return Joi.isError(error) ? jsonResponse.validationResponse(
                    res,
                    409,
                    "Validation error",
                    error.details.map(err => err.message)
                ) : jsonResponse.errorResponse(
                    res,
                    500,
                    error.message
                );
            }
        }*/

    // 
    static async store(req, res) {
    try {
        const { email, usuario, nombres, apellidos, password, role, estado } = req.body;
        const estadoInt = parseInt(estado, 10);

        // Verifica si se subió una imagen; si no, usa la predeterminada
        //const imagePath = req.file ? req.file.path : "/uploads/default-profile.png";
        // Guarda solo el nombre del archivo en la base de datos
        //const imagePath = req.file ? `/uploads/${req.file.filename}` : "/uploads/default-profile.png";
        // Verifica si se subió un archivo
        if (!req.file) {
            console.log("No se ha subido ningún archivo");
        } else {
            console.log("Archivo recibido:", req.file);  // Muestra el archivo recibido
        }

        const imagePath = req.file ? `/uploads/${req.file.filename}` : (req.body.image || "/uploads/default-profile.png");
    

        console.log("Ruta de la imagen guardada:", imagePath);

        // Crea el usuario
        const { usuarios_id } = await userService.store({
            email,
            usuario,
            nombres,
            apellidos,
            password,
            role,
            image: imagePath,
            estado: estadoInt
        });

        // Retorna los datos del nuevo usuario
        const newUser = new UserDTO(usuarios_id, nombres, apellidos, usuario, email, estadoInt, role, imagePath);
        return jsonResponse.successResponse(res, 201, "User has been registered successfully", newUser);
    } catch (error) {
        return Joi.isError(error)
            ? jsonResponse.validationResponse(res, 409, "Validation error", error.details.map(err => err.message))
            : jsonResponse.errorResponse(res, 500, error.message);
    }
}

    

    // Método estático asíncrono para obtener información de un usuario 
    static async show(req, res) {
        try {
            // Convierte a número entero
            const usuarios_id = parseInt(req.params.usuarios_id, 10);

            // Verifica que sea un número válido
            if (isNaN(usuarios_id)) {
                return jsonResponse.errorResponse(
                    res,
                    400,
                    "ID de usuario inválido"
                );
            }

            const { 
                usuarios_id: id, 
                nombres, 
                apellidos, 
                usuario, 
                email, 
                role, 
                image, 
                estado 
            } = await userService.show(usuarios_id);

            // Crea un DTO asegurándose de que los valores sean números
            const user = new UserDTO(
                Number(id), 
                nombres, 
                apellidos, 
                usuario, 
                email, 
                Number(estado), 
                role, 
                image
            );

            return jsonResponse.successResponse(
                res,
                200,
                "User exists",
                user
            );
        } catch (error) {
            console.error('Error en show de UserController:', error);
            return Joi.isError(error) 
                ? jsonResponse.validationResponse(
                    res,
                    409,
                    "Validation error",
                    error.details.map(err => err.message)
                ) 
                : jsonResponse.errorResponse(
                    res,
                    500,
                    error.message
                );
        }
    }
            
        
        

    // Método para obtener todos los usuarios
    
static async getAll(req, res) {
    try {
        // Obtén todos los usuarios desde la base de datos
        const usuarios = await db.Usuarios.findAll(); // Cambia esto si usas otro ORM

        // Si no hay usuarios, retorna una respuesta con un mensaje adecuado
        if (!usuarios || usuarios.length === 0) {
            return jsonResponse.successResponse(
                res,
                200,
                "No users found",
                []
            );
        }

        // Si hay usuarios, retorna la lista
        return jsonResponse.successResponse(
            res,
            200,
            "Users retrieved successfully",
            usuarios
        );
    } catch (error) {
        // Maneja el error adecuadamente
        return jsonResponse.errorResponse(
            res,
            500,
            error.message
        );
    }
}



    // Método estático asíncrono para actualizar la información de un usuario
    // Método estático asíncrono para actualizar la información de un usuario

    static async update(req, res) {
        try {
            const { email, usuario, nombres, apellidos, password, role, estado } = req.body;
            const estadoInt = parseInt(estado, 10);
            const id = req.params.usuarios_id;

            console.log("ID del usuario:", id);

            // Obtener el usuario actual para mantener la imagen existente si no se sube una nueva
            const currentUser = await db.Usuarios.findByPk(id);
            if (!currentUser) {
                return jsonResponse.errorResponse(res, 404, "Usuario no encontrado");
            }

            // Verifica si se subió una nueva imagen; si no, mantiene la imagen existente
            let imagePath = req.file ? `/uploads/${req.file.filename}` : currentUser.image;

            console.log("Ruta de la imagen guardada:", imagePath);

            // Actualiza el usuario en la base de datos
            await userService.update({
                email,
                usuario,
                nombres,
                apellidos,
                password,
                role,
                image: imagePath,
                estado: estadoInt
            }, id);

            // Crea un DTO con los datos actualizados del usuario
            const updatedUser = new UserDTO(id, nombres, apellidos, usuario, email, estadoInt, role, imagePath);

            // Retorna una respuesta exitosa
            return jsonResponse.successResponse(res, 200, "User has been updated", updatedUser);
        } catch (error) {
            console.error('Error al actualizar el usuario:', error);
            return Joi.isError(error)
                ? jsonResponse.validationResponse(res, 409, "Validation error", error.details.map(err => err.message))
                : jsonResponse.errorResponse(res, 500, error.message);
        }
    }

    // Método para actualizar el rol de un usuario
    static async updateRole(req, res) {
        try {
            const id = req.params.usuarios_id;
            const roleInt = parseInt(req.body.role, 10); // Convertimos el role a número
            const requesterRole = parseInt(req.user.role, 10); // Aseguramos que el rol del solicitante sea número

            // Validar que el rol sea un número válido
            if (isNaN(roleInt)) {
                return jsonResponse.errorResponse(
                    res,
                    400,
                    "El rol debe ser un número válido"
                );
            }

            // Validar permisos según el rol del solicitante
            if (requesterRole === 2) {
                // Si el solicitante tiene rol 2, solo puede asignar roles 2 o 3
                if (![2, 3].includes(roleInt)) {
                    return jsonResponse.errorResponse(
                        res,
                        403,
                        "Con rol 2 solo puedes asignar roles 2 o 3"
                    );
                }
            } else if (requesterRole !== 1) {
                // Si no es rol 1 ni 2, no puede cambiar roles
                return jsonResponse.errorResponse(
                    res,
                    403,
                    "No tienes permisos para cambiar roles"
                );
            }

            // Actualiza el rol del usuario
            await userService.updateRole({
                role: roleInt, // Enviamos el rol como número
                requesterRole
            }, id);

            // Obtiene los datos actualizados del usuario
            const updatedUser = await userService.show(id);

            // Retorna una respuesta exitosa con los datos actualizados
            return jsonResponse.successResponse(
                res,
                200,
                "El rol del usuario ha sido actualizado exitosamente",
                {
                    usuarios_id: updatedUser.usuarios_id,
                    role: updatedUser.role,
                    nombres: updatedUser.nombres,
                    apellidos: updatedUser.apellidos
                }
            );
        } catch (error) {
            console.error('Error al actualizar el rol del usuario:', error);
            return Joi.isError(error)
                ? jsonResponse.validationResponse(res, 409, "Error de validación", error.details.map(err => err.message))
                : jsonResponse.errorResponse(res, 500, error.message);
        }
    }

    // Controlador para actualizar el estado
    static async updateStatus(req, res) {
        try {
            const { estado } = req.body;
            const estadoInt = parseInt(estado, 10);
            const id = req.params.usuarios_id;
            const requesterRole = parseInt(req.user.role, 10); // Convertimos el rol del solicitante a número

            // Validar que el estado sea un número válido
            if (isNaN(estadoInt)) {
                return jsonResponse.errorResponse(
                    res,
                    400,
                    "El estado debe ser un número válido"
                );
            }

            // Solo el rol 1 (admin) puede cambiar el estado
            if (requesterRole !== 1) {
                return jsonResponse.errorResponse(
                    res,
                    403,
                    "Solo el administrador puede cambiar el estado de los usuarios"
                );
            }

            console.log("ID del usuario:", id);
            console.log("Nuevo estado:", estadoInt);
            console.log("Rol del solicitante:", requesterRole);

            // Validar el nuevo estado
            if (![0, 1].includes(estadoInt)) {
                return jsonResponse.errorResponse(
                    res,
                    400,
                    "El estado debe ser 0 o 1"
                );
            }

            // Actualiza solo el estado del usuario en la base de datos
            await userService.updateStatus({ 
                estado: estadoInt,
                requesterRole 
            }, id);

            // Obtiene los datos actualizados del usuario
            const updatedUser = await userService.show(id);

            // Retorna una respuesta exitosa con el estado actualizado y más información
            return jsonResponse.successResponse(
                res,
                200,
                "User status has been updated",
                {
                    usuarios_id: updatedUser.usuarios_id,
                    estado: updatedUser.estado,
                    nombres: updatedUser.nombres,
                    apellidos: updatedUser.apellidos,
                    usuario: updatedUser.usuario,
                    email: updatedUser.email
                }
            );
        } catch (error) {
            console.error('Error al actualizar el estado del usuario:', error);
            return Joi.isError(error)
                ? jsonResponse.validationResponse(res, 409, "Error de validación", error.details.map(err => err.message))
                : jsonResponse.errorResponse(res, 500, error.message);
        }
    }

    

static async paginate(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';

        const result = await userService.paginate(page, limit, search);
        
        return res.status(200).json(result);
    } catch (error) {
        return jsonResponse.errorResponse(
            res,
            500,
            error.message
        );
    }
}


    // Método estático asíncrono para eliminar un usuario
    static async destroy(req, res) {
        try {
            const id= req.params.usuarios_id;
            console.log("id ",id)
            // Elimina al usuario mediante el servicio 'userService'
            await userService.destroy(req.params.usuarios_id);

            // Retorna una respuesta exitosa en formato JSON indicando que el usuario ha sido eliminado
            return jsonResponse.successResponse(
                res,
                200,
                "User has been deleted"
            );
        } catch (error) {
            // Si hay un error de validación de Joi, retorna una respuesta de validación
            return Joi.isError(error) ? jsonResponse.validationResponse(
                res,
                409,
                "Validation error",
                error.details.map(err => err.message)
            ) : jsonResponse.errorResponse(
                res,
                500,
                error.message
            );
        }
    }

    // Método para actualizar el estado de un usuario
    static async updateUserStatus(req, res) {
        try {
            const id = req.params.usuarios_id;
            const { estado } = req.body;
            const requesterRole = req.user.role;

            // Solo el rol 1 (admin) puede cambiar el estado
            if (requesterRole !== 1) {
                return jsonResponse.errorResponse(
                    res,
                    403,
                    "Solo el administrador puede cambiar el estado de los usuarios"
                );
            }

            // Actualiza el estado del usuario
            await userService.updateUserStatus({
                estado,
                requesterRole
            }, id);

            // Obtiene los datos actualizados del usuario
            const updatedUser = await userService.show(id);

            // Retorna una respuesta exitosa con los datos actualizados
            return jsonResponse.successResponse(
                res,
                200,
                "El estado del usuario ha sido actualizado exitosamente",
                {
                    usuarios_id: updatedUser.usuarios_id,
                    estado: updatedUser.estado,
                    nombres: updatedUser.nombres,
                    apellidos: updatedUser.apellidos
                }
            );
        } catch (error) {
            console.error('Error al actualizar el estado del usuario:', error);
            return Joi.isError(error)
                ? jsonResponse.validationResponse(res, 409, "Error de validación", error.details.map(err => err.message))
                : jsonResponse.errorResponse(res, 500, error.message);
        }
    }

    // Método para actualizar la contraseña
    static async updatePassword(req, res) {
        try {
            const id = req.params.usuarios_id;
            const { currentPassword, newPassword } = req.body;
            const requesterId = req.user.id; // ID del usuario que hace la solicitud

            // Verificar que el usuario solo pueda cambiar su propia contraseña
            if (parseInt(id) !== requesterId) {
                return jsonResponse.errorResponse(
                    res,
                    403,
                    "Solo puedes cambiar tu propia contraseña"
                );
            }

            // Obtener el usuario actual
            const currentUser = await db.Usuarios.findByPk(id);
            if (!currentUser) {
                return jsonResponse.errorResponse(
                    res,
                    404,
                    "Usuario no encontrado"
                );
            }

            // Verificar la contraseña actual
            const isPasswordValid = await bcrypt.compare(currentPassword, currentUser.password);
            if (!isPasswordValid) {
                return jsonResponse.errorResponse(
                    res,
                    401,
                    "La contraseña actual es incorrecta"
                );
            }

            // Validar la nueva contraseña
            if (!newPassword || newPassword.length < 6) {
                return jsonResponse.errorResponse(
                    res,
                    400,
                    "La nueva contraseña debe tener al menos 6 caracteres"
                );
            }

            // Encriptar la nueva contraseña
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Actualizar la contraseña
            await db.Usuarios.update(
                { password: hashedPassword },
                { where: { usuarios_id: id } }
            );

            return jsonResponse.successResponse(
                res,
                200,
                "Contraseña actualizada exitosamente"
            );
        } catch (error) {
            console.error('Error al actualizar la contraseña:', error);
            return jsonResponse.errorResponse(
                res,
                500,
                "Error al actualizar la contraseña"
            );
        }
    }

}

// Exporta la clase UserController para que pueda ser utilizada en otros archivos
module.exports = UserController;
