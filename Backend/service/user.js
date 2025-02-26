const { Model, Op } = require('sequelize'); // Agregamos Op a los imports
const bcrypt = require("bcryptjs") // Requiere bcryptjs para encriptar contraseñas
const jwt = require("jsonwebtoken"); // Para generar un token JWT
const Joi = require('joi');
const { User, sequelize } = require("../models") // Requiere el modelo 'usuarios' y la instancia de sequelize para las transacciones
const storeDTO = require("../http/request/user/storeDTO") // DTO para validar los datos del usuario en la operación de almacenamiento
const updateDTO = require("../http/request/user/updateDTO") // DTO para validar los datos del usuario en la operación de actualización
const idDTO = require("../http/request/user/idDTO") // DTO para validar los identificadores de usuarios
const loginDTO = require("../http/request/user/loginDTO"); // DTO para validar los datos del login
const updateRoleDTO = require("../http/request/user/updateRoleDTO");
const updateStatusDTO = require("../http/request/user/updateStatusDTO");


class UserService {

        // Método de login
        static async login(data) {
            try {
                // Verifica que 'data' es un objeto
                if (typeof data !== 'object' || data === null) {
                    throw new Error("Invalid data format, expected an object");
                }
    
                // Valida los datos de entrada usando el esquema loginSchema
                await loginDTO.validateAsync(data, { abortEarly: false });
    
                const { email, password } = data;
    
                // Busca al usuario en la base de datos por correo electrónico
                const user = await User.findOne({ where: { email } });
                if (!user) {
                    throw new Error("User not found");
                }
    
                // Compara la contraseña ingresada con la almacenada
                const isPasswordValid = await bcrypt.compare(password, user.password);
                if (!isPasswordValid) {
                    throw new Error("Incorrect password");
                }
    
                // Genera un token JWT
                const token = jwt.sign(
                    { id: user.usuarios_id, email: user.email, role: user.role },
                    process.env.JWT_SECRET,
                    { expiresIn: "1h" }
                );
    
                // Retorna los datos del usuario y el token
                return {
                    user: {
                        id: user.usuarios_id,
                        email: user.email,
                        role: user.role,
                        nombres: user.nombres,
                        apellidos: user.apellidos
                    },
                    token
                };
            } catch (error) {
                // Manejo de errores
                if (error instanceof Joi.ValidationError) {
                    throw new Error("Validation Error: " + error.details.map(e => e.message).join(", "));
                }
                // Si el error es general, se lanza con el mensaje del error
                throw error;
            }
        }

    // Método para almacenar un nuevo usuario
    static async store(data) {

        const DB = await sequelize.transaction(); // Inicia una transacción de base de datos con sequelize

        console.log("Servicer: ",data)
        try {
            // Valida los datos de entrada usando storeDTO (con Joi)
            await storeDTO.validateAsync(data, { abortEarly: false })

            // Encripta la contraseña del usuario
            const hashedPassword = await bcrypt.hash(data.password, 10)
            // Asigna la imagen, si está presente; si no, usa el valor por defecto
            const image = data.image || '/uploads/default-profile.png';

            // Crea un nuevo usuario en la base de datos usando los campos correspondientes
            const newUser = await User.create({
                usuario: data.usuario, // Se asigna el campo 'usuario'
                password: hashedPassword, // Se asigna la contraseña encriptada
                email: data.email, // Se asigna el campo 'email'
                nombres: data.nombres, // Se asigna el nombre
                apellidos: data.apellidos, // Se asigna el apellido
                role: data.role, // Se asigna el rol
                estado: 1, // Estado por defecto al crear un usuario (activo)
                image: image  // Se asigna la imagen (si no se proporciona, usa la predeterminada)
            })

            await DB.commit() // Confirma la transacción

            return newUser // Retorna el nuevo usuario

        } catch (error) {
            await DB.rollback(); // Deshace los cambios si hay un error
            throw error; // Lanza el error para manejarlo
        }
    }

    // Método para mostrar un usuario por su ID
    static async show(id) {

        try {
            // Valida el ID del usuario
            await idDTO.validateAsync({ usuarios_id: id })

            // Busca el usuario por su ID (campo usuarios_id)
            const user = await User.findByPk(id);

            return user; // Retorna el usuario

        } catch (error) {
            throw error; // Lanza el error para manejarlo
        }

    }

    // Método para actualizar un usuario por su ID
    static async update(data, id) {

        const DB = await sequelize.transaction() // Inicia una transacción de base de datos
        console.log("Servicer: ",data)
        console.log("Servicer2: ",id)
        try {

            data.usuarios_id = id // Asigna el ID al objeto de datos

            // Valida los datos de entrada usando updateDTO
            await updateDTO.validateAsync(
                data, { abortEarly: false }
            )

            // Encripta la nueva contraseña del usuario
            const hashedPassword = await bcrypt.hash(data.password, 10)
             // Asigna la imagen, si está presente; si no, conserva la imagen actual o usa la predeterminada
            const image = data.image || '/uploads/default-profile.png';

            // Actualiza los campos del usuario con los datos proporcionados
            const user = await User.update({
                usuario: data.usuario, // Actualiza el campo 'usuario'
                nombres: data.nombres, // Actualiza el campo 'nombres'
                apellidos: data.apellidos, // Actualiza el campo 'apellidos'
                email: data.email, // Actualiza el campo 'email'
                password: hashedPassword, // Actualiza la contraseña encriptada
                role: data.role, // Actualiza el campo 'role'
                estado: data.estado, // Actualiza el estado del usuario
                image: image
            }, { where: { usuarios_id: id } }); // Condición para actualizar el registro por ID

            await DB.commit() // Confirma la transacción

            return user // Retorna el usuario actualizado

        } catch (error) {
            await DB.rollback() // Deshace los cambios si hay un error
            throw error // Lanza el error para manejarlo
        }
    }


    //
    // Método para actualizar solo el estado de un usuario por su ID
    static async updateStatus(data, id) {
    const DB = await sequelize.transaction(); // Inicia una transacción de base de datos
    console.log("Servicer: ", data);
    console.log("Servicer2: ", id);

    try {
        // Valida el ID del usuario
        await idDTO.validateAsync({ usuarios_id: id });

        // Actualiza solo el estado del usuario con el nuevo estado proporcionado
        const [updated] = await User.update(
            { estado: data.estado },
            { where: { usuarios_id: id } } // Condición para actualizar el registro por ID
        );

        await DB.commit(); // Confirma la transacción

        if (updated) {
            // Devuelve solo el estado actualizado como respuesta
            return { estado: data.estado };
        } else {
            throw new Error('Usuario no encontrado');
        }
    } catch (error) {
        await DB.rollback(); // Deshace los cambios si hay un error
        throw error; // Lanza el error para manejarlo
    }
}



    // Método para eliminar un usuario por su ID
    static async destroy(id) {
        console.log("Servicer3: ",id)
        const DB = await sequelize.transaction() // Inicia una transacción de base de datos
        
        try {

            // Valida el ID del usuario
            await idDTO.validateAsync({ usuarios_id: id })

            // Elimina el usuario por su ID (campo usuarios_id)
            await User.destroy({ where: { usuarios_id: id } })

            await DB.commit() // Confirma la transacción

        } catch (error) {
            await DB.rollback() // Deshace los cambios si hay un error
            throw error // Lanza el error para manejarlo
        }
    }

    /**
     * Método para paginar y buscar usuarios
     */
    static async paginate(page = 1, limit = 10, search = '') {
        try {
            const offset = (page - 1) * limit;
            
            let whereClause = {};
            if (search) {
                whereClause = {
                    [Op.or]: [
                        { nombres: { [Op.iLike]: `%${search}%` } },
                        { apellidos: { [Op.iLike]: `%${search}%` } },
                        { email: { [Op.iLike]: `%${search}%` } },
                        { usuario: { [Op.iLike]: `%${search}%` } }
                    ]
                };
            }

            const { count, rows } = await User.findAndCountAll({
                where: whereClause,
                limit: parseInt(limit),
                offset: offset,
                order: [['usuarios_id', 'DESC']]
            });

            const totalPages = Math.ceil(count / limit);

            // Estructura con exactamente 2 niveles de data
            return {
                message: "Users retrieved successfully",
                data: {
                    total: count,
                    perPage: limit,
                    currentPage: page,
                    totalPages: totalPages,
                    data: rows.map(user => ({
                        usuarios_id: user.usuarios_id,
                        email: user.email,
                        usuario: user.usuario,
                        nombres: user.nombres,
                        apellidos: user.apellidos,
                        role: user.role,
                        estado: user.estado,
                        image: user.image
                    }))
                }
            };
        } catch (error) {
            throw error;
        }
    }

    // Método para actualizar el rol de un usuario
    static async updateRole(data, id) {
        const DB = await sequelize.transaction();
        try {
            data.usuarios_id = id;

            // Valida los datos usando updateRoleDTO
            await updateRoleDTO.validateAsync(data, { abortEarly: false });

            // Verifica las reglas de negocio para la actualización del rol
            if (data.requesterRole === 2 && data.role === 1) {
                throw new Error('Un usuario con rol 2 no puede asignar el rol 1');
            }

            // Actualiza solo el rol del usuario
            const user = await User.update({
                role: data.role
            }, { 
                where: { usuarios_id: id },
                returning: true
            });

            await DB.commit();
            return user;
        } catch (error) {
            await DB.rollback();
            throw error;
        }
    }

    // Método para actualizar el estado de un usuario
    static async updateUserStatus(data, id) {
        const DB = await sequelize.transaction();
        try {
            data.usuarios_id = id;

            // Valida los datos usando updateStatusDTO
            await updateStatusDTO.validateAsync(data, { abortEarly: false });

            // Solo el rol 1 (admin) puede actualizar el estado de los usuarios
            if (data.requesterRole !== 1) {
                throw new Error('Solo el administrador puede cambiar el estado de los usuarios');
            }

            // Actualiza solo el estado del usuario
            const user = await User.update({
                estado: data.estado
            }, { 
                where: { usuarios_id: id },
                returning: true
            });

            await DB.commit();
            return user;
        } catch (error) {
            await DB.rollback();
            throw error;
        }
    }
}

module.exports = UserService // Exporta la clase UserService
