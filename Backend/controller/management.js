// Importa el servicio 'management' desde la carpeta 'service'
const managementService = require("../service/management");
// Importa una utilidad para responder en formato JSON
const jsonResponse = require("../http/response/jsonResponse");
// Importa el Data Transfer Object (DTO) que define la estructura de una 'gestión'
const ManagementDTO = require("../http/request/management/responseDTO");
// Importa Joi para validación de datos
const Joi = require("joi");

class ManagementController {

    // Método estático asíncrono para crear una nueva gestión
    static async store(req, res) {
        try {
            // Desestructura los campos necesarios para la nueva gestión desde req.body
            const { descripcion, numero, anio, estado } = req.body;

            // Crea una nueva gestión utilizando el servicio 'managementService'
            const { gestions_id } = await managementService.store({ descripcion, numero, anio, estado });

            // Crea un nuevo DTO de la gestión con los datos creados
            const newManagement = new ManagementDTO(gestions_id, descripcion, numero, anio, estado);

            // Retorna una respuesta exitosa en formato JSON indicando que la gestión ha sido registrada
            return jsonResponse.successResponse(
                res,
                201,
                "La gestión ha sido registrada exitosamente",
                newManagement
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

    // Método estático asíncrono para obtener información de una gestión
    static async show(req, res) {
        try {
            // Obtiene el ID de la gestión a través de req.params
            const { gestions_id, descripcion, numero, anio, estado } = await managementService.show(req.params.gestions_id);

            // Crea un DTO con los datos obtenidos de la gestión
            const management = new ManagementDTO(gestions_id, descripcion, numero, anio, estado);

            // Retorna una respuesta exitosa en formato JSON indicando que la gestión existe
            return jsonResponse.successResponse(
                res,
                200,
                "La gestión existe",
                management
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

    // Método estático asíncrono para actualizar la información de una gestión
    static async update(req, res) {
        try {
            const { descripcion, numero, anio, estado } = req.body;
            const id = req.params.gestions_id;

            console.log("id ", id);

            // Actualiza la gestión en la base de datos
            await managementService.update({ gestions_id: req.params.gestions_id, descripcion, numero, anio, estado }, req.params.gestions_id);

            // Crea un nuevo DTO con los datos actualizados de la gestión
            const updatedManagement = new ManagementDTO(id, descripcion, numero, anio, estado);

            // Retorna una respuesta exitosa en formato JSON indicando que la gestión ha sido actualizada
            return jsonResponse.successResponse(
                res,
                200,
                "La gestión ha sido actualizada",
                updatedManagement
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

    // Método estático asíncrono para eliminar una gestión
    static async destroy(req, res) {
        try {
            const id = req.params.gestions_id;
            console.log("id ", id);

            // Elimina la gestión mediante el servicio 'managementService'
            await managementService.destroy(req.params.gestions_id);

            // Retorna una respuesta exitosa en formato JSON indicando que la gestión ha sido eliminada
            return jsonResponse.successResponse(
                res,
                200,
                "La gestión ha sido eliminada"
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

// Exporta la clase ManagementController para que pueda ser utilizada en otros archivos
module.exports = ManagementController;
