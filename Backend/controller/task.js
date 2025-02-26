// Importa el servicio 'task' desde la carpeta 'service'
const taskService = require("../service/task");
// Importa una utilidad para responder en formato JSON
const jsonResponse = require("../http/response/jsonResponse");
// Importa el Data Transfer Object (DTO) que define la estructura de una 'tarea'
const TaskDTO = require("../http/request/task/responseDTO");
// Importa Joi para validación de datos
const Joi = require("joi");

class TaskController {

    // Método estático asíncrono para crear una nueva tarea
    static async store(req, res) {
        try {
            // Desestructura los campos necesarios para la nueva tarea desde req.body
            const { descripcion, servicio, fecha } = req.body;

            // Crea una nueva tarea utilizando el servicio 'taskService'
            const { tareas_id } = await taskService.store({ descripcion, servicio, fecha });

            // Crea un nuevo DTO de la tarea con los datos creados
            const newTask = new TaskDTO(tareas_id, descripcion, servicio, fecha);

            // Retorna una respuesta exitosa en formato JSON indicando que la tarea ha sido registrada
            return jsonResponse.successResponse(
                res,
                201,
                "La tarea ha sido registrada exitosamente",
                newTask
            );
        } catch (error) {
            // Si hay un error de validación de Joi, retorna una respuesta de validación
            return Joi.isError(error) ? jsonResponse.validationResponse(
                res,
                409,
                "Error de validación",
                error.details.map(err => err.message)
            ) : jsonResponse.errorResponse(
                res,
                500,
                error.message
            );
        }
    }

    // Método estático asíncrono para obtener información de una tarea
    static async show(req, res) {
        try {
            // Obtiene el ID de la tarea a través de req.params
            const { tareas_id, descripcion, servicio, fecha } = await taskService.show(req.params.tareas_id);

            // Crea un DTO con los datos obtenidos de la tarea
            const task = new TaskDTO(tareas_id, descripcion, servicio, fecha);

            // Retorna una respuesta exitosa en formato JSON indicando que la tarea existe
            return jsonResponse.successResponse(
                res,
                200,
                "La tarea existe",
                task
            );
        } catch (error) {
            // Si hay un error de validación de Joi, retorna una respuesta de validación
            return Joi.isError(error) ? jsonResponse.validationResponse(
                res,
                409,
                "Error de validación",
                error.details.map(err => err.message)
            ) : jsonResponse.errorResponse(
                res,
                500,
                error.message
            );
        }
    }

    // Método estático asíncrono para actualizar la información de una tarea
    static async update(req, res) {
        try {
            const { descripcion, servicio, fecha } = req.body;
            const id = req.params.tareas_id;

            console.log("id ", id);

            // Actualiza la tarea en la base de datos
            await taskService.update({ tareas_id: req.params.tareas_id, descripcion, servicio, fecha }, req.params.tareas_id);

            // Crea un nuevo DTO con los datos actualizados de la tarea
            const updatedTask = new TaskDTO(id, descripcion, servicio, fecha);

            // Retorna una respuesta exitosa en formato JSON indicando que la tarea ha sido actualizada
            return jsonResponse.successResponse(
                res,
                200,
                "La tarea ha sido actualizada",
                updatedTask
            );
        } catch (error) {
            // Si hay un error de validación de Joi, retorna una respuesta de validación
            return Joi.isError(error) ? jsonResponse.validationResponse(
                res,
                409,
                "Error de validación",
                error.details.map(err => err.message)
            ) : jsonResponse.errorResponse(
                res,
                500,
                error.message
            );
        }
    }

    // Método estático asíncrono para eliminar una tarea
    static async destroy(req, res) {
        try {
            const id = req.params.tareas_id;
            console.log("id ", id);

            // Elimina la tarea mediante el servicio 'taskService'
            await taskService.destroy(req.params.tareas_id);

            // Retorna una respuesta exitosa en formato JSON indicando que la tarea ha sido eliminada
            return jsonResponse.successResponse(
                res,
                200,
                "La tarea ha sido eliminada"
            );
        } catch (error) {
            // Si hay un error de validación de Joi, retorna una respuesta de validación
            return Joi.isError(error) ? jsonResponse.validationResponse(
                res,
                409,
                "Error de validación",
                error.details.map(err => err.message)
            ) : jsonResponse.errorResponse(
                res,
                500,
                error.message
            );
        }
    }
}

// Exporta la clase TaskController para que pueda ser utilizada en otros archivos
module.exports = TaskController;
