const { Task, sequelize } = require("../models"); // Requiere el modelo 'Task' y la instancia de sequelize para las transacciones
const storeDTO = require("../http/request/task/storeDTO"); // DTO para validar los datos de la tarea en la operación de almacenamiento
const updateDTO = require("../http/request/task/updateDTO"); // DTO para validar los datos de la tarea en la operación de actualización
const idDTO = require("../http/request/task/idDTO"); // DTO para validar los identificadores de tareas

class TaskService {

    // Método para almacenar una nueva tarea
    static async store(data) {
        const DB = await sequelize.transaction(); // Inicia una transacción de base de datos con sequelize
        console.log("Task Data: ", data);

        try {
            // Valida los datos de entrada usando storeDTO (con Joi)
            await storeDTO.validateAsync(data, { abortEarly: false });

            // Crea una nueva tarea en la base de datos usando los campos correspondientes
            const newTask = await Task.create({
                descripcion: data.descripcion, // Se asigna el campo 'descripcion'
                servicio: data.servicio, // Se asigna el campo 'servicio' (clave foránea)
                fecha: data.fecha // Se asigna el campo 'fecha'
            });

            await DB.commit(); // Confirma la transacción

            return newTask; // Retorna la nueva tarea

        } catch (error) {
            await DB.rollback(); // Deshace los cambios si hay un error
            throw error; // Lanza el error para manejarlo
        }
    }

    // Método para mostrar una tarea por su ID
    static async show(id) {
        try {
            // Valida el ID de la tarea
            await idDTO.validateAsync({ tareas_id: id });

            // Busca la tarea por su ID (campo tareas_id)
            const task = await Task.findByPk(id);

            return task; // Retorna la tarea

        } catch (error) {
            throw error; // Lanza el error para manejarlo
        }
    }

    // Método para actualizar una tarea por su ID
    static async update(data, id) {
        const DB = await sequelize.transaction(); // Inicia una transacción de base de datos
        console.log("Task Data: ", data);
        console.log("Task ID: ", id);

        try {
            data.tareas_id = id; // Asigna el ID al objeto de datos

            // Valida los datos de entrada usando updateDTO
            await updateDTO.validateAsync(data, { abortEarly: false });

            // Actualiza los campos de la tarea con los datos proporcionados
            const updatedTask = await Task.update({
                descripcion: data.descripcion, // Actualiza el campo 'descripcion'
                servicio: data.servicio, // Actualiza el campo 'servicio'
                fecha: data.fecha // Actualiza el campo 'fecha'
            }, { where: { tareas_id: id } }); // Condición para actualizar el registro por ID

            await DB.commit(); // Confirma la transacción

            return updatedTask; // Retorna la tarea actualizada

        } catch (error) {
            await DB.rollback(); // Deshace los cambios si hay un error
            throw error; // Lanza el error para manejarlo
        }
    }

    // Método para eliminar una tarea por su ID
    static async destroy(id) {
        console.log("Task Destroy ID: ", id);
        const DB = await sequelize.transaction(); // Inicia una transacción de base de datos
        
        try {
            // Valida el ID de la tarea
            await idDTO.validateAsync({ tareas_id: id });

            // Elimina la tarea por su ID (campo tareas_id)
            await Task.destroy({ where: { tareas_id: id } });

            await DB.commit(); // Confirma la transacción

        } catch (error) {
            await DB.rollback(); // Deshace los cambios si hay un error
            throw error; // Lanza el error para manejarlo
        }
    }
}

module.exports = TaskService; // Exporta la clase TaskService
