// Importa el servicio 'type' desde la carpeta 'service'
const typeService = require("../service/type");
// Importa una utilidad para responder en formato JSON
const jsonResponse = require("../http/response/jsonResponse");
// Importa el Data Transfer Object (DTO) que define la estructura de un 'tipo'
const TypeDTO = require("../http/request/type/responseDTO");
// Importa Joi para validación de datos
const Joi = require("joi");

class TypeController {

    // Método estático asíncrono para crear un nuevo tipo
    static async store(req, res) {
        try {
            // Desestructura los campos necesarios para el nuevo tipo desde req.body
            const { descripcion, formulario, estado } = req.body;

            // Asegura que el campo `estado` sea tratado como número
            const estadoInt = parseInt(estado, 10);

            // Crea un nuevo tipo utilizando el servicio 'typeService'
            const { tipos_id } = await typeService.store({ descripcion, formulario, estado: estadoInt });

            // Crea un nuevo DTO del tipo con los datos creados
            const newType = new TypeDTO(tipos_id, descripcion, formulario, estadoInt);

            // Retorna una respuesta exitosa en formato JSON indicando que el tipo ha sido registrado
            return jsonResponse.successResponse(
                res,
                201,
                "Type has been registered successfully",
                newType
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

    // Método estático asíncrono para obtener información de un tipo
    static async show(req, res) {
        try {
            // Obtiene el ID del tipo a través de req.params
            const { tipos_id, descripcion, formulario, estado } = await typeService.show(req.params.tipos_id);

            // Crea un DTO con los datos obtenidos del tipo, asegurando que `estado` sea número
            const type = new TypeDTO(tipos_id, descripcion, formulario, parseInt(estado, 10));

            // Retorna una respuesta exitosa en formato JSON indicando que el tipo existe
            return jsonResponse.successResponse(
                res,
                200,
                "Type exists",
                type
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

    // Método estático asíncrono para actualizar la información de un tipo
    static async update(req, res) {
        try {
            // Asegura que el campo `estado` sea tratado como número
            const { descripcion, formulario, estado } = req.body;
            const estadoInt = parseInt(estado, 10);
            const id = req.params.tipos_id;

            console.log("id ", id);

            // Actualiza el tipo en la base de datos
            await typeService.update({ tipos_id: req.params.tipos_id, descripcion, formulario, estado: estadoInt }, req.params.tipos_id);

            // Crea un nuevo DTO con los datos actualizados del tipo
            const updatedType = new TypeDTO(id, descripcion, formulario, estadoInt);

            // Retorna una respuesta exitosa en formato JSON indicando que el tipo ha sido actualizado
            return jsonResponse.successResponse(
                res,
                200,
                "Type has been updated",
                updatedType
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

    // Método estático asíncrono para eliminar un tipo
    static async destroy(req, res) {
        try {
            const id = req.params.tipos_id;
            console.log("id ", id);

            // Elimina al tipo mediante el servicio 'typeService'
            await typeService.destroy(req.params.tipos_id);

            // Retorna una respuesta exitosa en formato JSON indicando que el tipo ha sido eliminado
            return jsonResponse.successResponse(
                res,
                200,
                "Type has been deleted"
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
    /**
 * Método estático asíncrono en el controlador para obtener equipos paginados.
 * @param {object} req - Objeto de solicitud HTTP, contiene información como parámetros de consulta.
 * @param {object} res - Objeto de respuesta HTTP, se usa para enviar respuestas al cliente.
 * @returns {Promise} - Promesa que resuelve al enviar una respuesta al cliente.
 */
    static async paginate(req, res) {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const search = req.query.search || ''; // Obtiene el término de búsqueda de la consulta
    
        try {
            // Llama al servicio de paginación con el término de búsqueda
            const { count, rows } = await typeService.paginate({ page, limit, search });
            console.log("Count rows: ",{ count, rows });
            // Transforma los resultados en DTOs
            const typeDTOs = rows.map(type =>TypeDTO.createFromEntity(type));
            console.log("typeDTOs: ",typeDTOs)
            // Retorna la respuesta con paginación y resultados
            return jsonResponse.successResponse(res, 200, "Type retrieved successfully", {
                total: count,
                perPage: limit,
                currentPage: page,
                totalPages: Math.ceil(count / limit),
                data: typeDTOs,
            });
        } catch (error) {
            return jsonResponse.errorResponse(res, 500, error.message);
        }
    }
}

// Exporta la clase TypeController para que pueda ser utilizada en otros archivos
module.exports = TypeController;
