const { Management, sequelize } = require("../models"); // Requiere el modelo 'Management' y la instancia de sequelize para las transacciones
const storeDTO = require("../http/request/management/storeDTO"); // DTO para validar los datos de la gestión en la operación de almacenamiento
const updateDTO = require("../http/request/management/updateDTO"); // DTO para validar los datos de la gestión en la operación de actualización
const idDTO = require("../http/request/management/idDTO"); // DTO para validar los identificadores de gestiones

class ManagementService {

    // Método para almacenar una nueva gestión
    static async store(data) {
        const DB = await sequelize.transaction(); // Inicia una transacción de base de datos con sequelize
        console.log("Management Data: ", data);

        try {
            // Valida los datos de entrada usando storeDTO (con Joi)
            await storeDTO.validateAsync(data, { abortEarly: false });

            // Crea una nueva gestión en la base de datos usando los campos correspondientes
            const newManagement = await Management.create({
                descripcion: data.descripcion, // Se asigna el campo 'descripcion'
                numero: data.numero, // Se asigna el campo 'numero'
                anio: data.anio, // Se asigna el campo 'anio'
                estado: data.estado // Se asigna el campo 'estado'
            });

            await DB.commit(); // Confirma la transacción

            return newManagement; // Retorna la nueva gestión

        } catch (error) {
            await DB.rollback(); // Deshace los cambios si hay un error
            throw error; // Lanza el error para manejarlo
        }
    }

    // Método para mostrar una gestión por su ID
    static async show(id) {
        try {
            // Valida el ID de la gestión
            await idDTO.validateAsync({ gestions_id: id });

            // Busca la gestión por su ID (campo gestions_id)
            const management = await Management.findByPk(id);

            return management; // Retorna la gestión

        } catch (error) {
            throw error; // Lanza el error para manejarlo
        }
    }

    // Método para actualizar una gestión por su ID
    static async update(data, id) {
        const DB = await sequelize.transaction(); // Inicia una transacción de base de datos
        console.log("Management Data: ", data);
        console.log("Management ID: ", id);

        try {
            data.gestions_id = id; // Asigna el ID al objeto de datos

            // Valida los datos de entrada usando updateDTO
            await updateDTO.validateAsync(data, { abortEarly: false });

            // Actualiza los campos de la gestión con los datos proporcionados
            const updatedManagement = await Management.update({
                descripcion: data.descripcion, // Actualiza el campo 'descripcion'
                numero: data.numero, // Actualiza el campo 'numero'
                anio: data.anio, // Actualiza el campo 'anio'
                estado: data.estado // Actualiza el campo 'estado'
            }, { where: { gestions_id: id } }); // Condición para actualizar el registro por ID

            await DB.commit(); // Confirma la transacción

            return updatedManagement; // Retorna la gestión actualizada

        } catch (error) {
            await DB.rollback(); // Deshace los cambios si hay un error
            throw error; // Lanza el error para manejarlo
        }
    }

    // Método para eliminar una gestión por su ID
    static async destroy(id) {
        console.log("Management Destroy ID: ", id);
        const DB = await sequelize.transaction(); // Inicia una transacción de base de datos
        
        try {
            // Valida el ID de la gestión
            await idDTO.validateAsync({ gestions_id: id });

            // Elimina la gestión por su ID (campo gestions_id)
            await Management.destroy({ where: { gestions_id: id } });

            await DB.commit(); // Confirma la transacción

        } catch (error) {
            await DB.rollback(); // Deshace los cambios si hay un error
            throw error; // Lanza el error para manejarlo
        }
    }
}

module.exports = ManagementService; // Exporta la clase ManagementService
