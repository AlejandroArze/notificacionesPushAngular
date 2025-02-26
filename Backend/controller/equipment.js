// Importa el servicio 'equipment' desde la carpeta 'service'
const equipmentService = require("../service/equipment");
// Importa una utilidad para responder en formato JSON
const jsonResponse = require("../http/response/jsonResponse");
// Importa el Data Transfer Object (DTO) que define la estructura de un 'equipo'
const EquipmentDTO = require("../http/request/equipment/responseDTO");
// Importa Joi para validación de datos
const Joi = require("joi");

class EquipmentController {

    // Método estático asíncrono para crear un nuevo equipo
    static async store(req, res) {
        try {
            // Desestructura los campos necesarios para el nuevo equipo desde req.body
            const { 
                ip, procesador, funcionariousuario, lector, tarjetavideo, funcionarioasignado, oficina, 
                fecharegistro, codigo, memoria, tarjetamadre, antivirus, garantia, discoduro, marca, tipo, 
                modelo, serie, so, responsable, mac 
            } = req.body;

            // Crea un nuevo equipo utilizando el servicio 'equipmentService'
            const { equipos_id } = await equipmentService.store({
                ip, procesador, funcionariousuario, lector, tarjetavideo, funcionarioasignado, oficina, 
                fecharegistro, codigo, memoria, tarjetamadre, antivirus, garantia, discoduro, marca, tipo, 
                modelo, serie, so, responsable, mac
            });

            // Crea un nuevo DTO del equipo con los datos creados
            const newEquipment = new EquipmentDTO(equipos_id, ip, procesador, funcionariousuario, lector, tarjetavideo, 
                funcionarioasignado, oficina, fecharegistro, codigo, memoria, tarjetamadre, antivirus, garantia, 
                discoduro, marca, tipo, modelo, serie, so, responsable, mac);

            // Retorna una respuesta exitosa en formato JSON indicando que el equipo ha sido registrado
            return jsonResponse.successResponse(
                res,
                201,
                "Equipment has been registered successfully",
                newEquipment
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

    // Método estático asíncrono para obtener información de un equipo
    static async show(req, res) {
        try {
            // Obtiene el ID del equipo a través de req.params
            const equipment = await equipmentService.show(req.params.equipos_id);

            if (!equipment) {
                return jsonResponse.errorResponse(res, 404, "Equipment not found");
            }

            // Crea un DTO con los datos obtenidos del equipo
            const equipmentDTO = new EquipmentDTO(
                equipment.equipos_id, equipment.ip, equipment.procesador, equipment.funcionariousuario, 
                equipment.lector, equipment.tarjetavideo, equipment.funcionarioasignado, equipment.oficina, 
                equipment.fecharegistro, equipment.codigo, equipment.memoria, equipment.tarjetamadre, 
                equipment.antivirus, equipment.garantia, equipment.discoduro, equipment.marca, equipment.tipo, 
                equipment.modelo, equipment.serie, equipment.so, equipment.responsable, equipment.mac
            );

            // Retorna una respuesta exitosa en formato JSON indicando que el equipo existe
            return jsonResponse.successResponse(
                res,
                200,
                "Equipment exists",
                equipmentDTO
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
static async paginate2(req, res) {
    // Obtiene los parámetros page y limit de la consulta, proporcionando valores predeterminados si no están presentes.
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    try {
        // Llama al método paginate del servicio, pasando los parámetros de paginación.
        const { count, rows } = await equipmentService.paginate({ page, limit });

        // Transforma cada elemento obtenido en un DTO utilizando un método estático definido en la clase DTO.
        const equipmentDTOs = rows.map(equipment => EquipmentDTO.createFromEntity(equipment));

        // Envía una respuesta JSON con éxito incluyendo los detalles de la paginación y los datos transformados.
        return jsonResponse.successResponse(
            res,
            200,
            "Equipments retrieved successfully",
            {
                total: count, // Número total de equipos.
                perPage: limit, // Número de equipos por página.
                currentPage: page, // Número de la página actual.
                totalPages: Math.ceil(count / limit), // Número total de páginas.
                data: equipmentDTOs // Datos de los equipos transformados a DTO.
            }
        );
    } catch (error) {
        // Maneja errores genéricos y específicos, enviando una respuesta adecuada al cliente.
        
        
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
static async paginate(req, res) {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || ''; // Obtiene el término de búsqueda de la consulta

    try {
        // Llama al servicio de paginación con el término de búsqueda
        const { count, rows } = await equipmentService.paginate({ page, limit, search });
        console.log("Count rows: ",{ count, rows });
        // Transforma los resultados en DTOs
        const equipmentDTOs = rows.map(equipment => EquipmentDTO.createFromEntity(equipment));

        // Retorna la respuesta con paginación y resultados
        return jsonResponse.successResponse(res, 200, "Equipments retrieved successfully", {
            total: count,
            perPage: limit,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            data: equipmentDTOs,
        });
    } catch (error) {
        return jsonResponse.errorResponse(res, 500, error.message);
    }
}

    // Método estático asíncrono para actualizar la información de un equipo
    static async update(req, res) {
        try {
            // Desestructura los campos del equipo desde req.body
            const { 
                ip, procesador, funcionariousuario, lector, tarjetavideo, funcionarioasignado, oficina, 
                fecharegistro, codigo, memoria, tarjetamadre, antivirus, garantia, discoduro, marca, tipo, 
                modelo, serie, so, responsable, mac 
            } = req.body;
            const id = req.params.equipos_id;

            console.log("id ", id);

            // Actualiza el equipo en la base de datos
            await equipmentService.update({
                ip, procesador, funcionariousuario, lector, tarjetavideo, funcionarioasignado, oficina, 
                fecharegistro, codigo, memoria, tarjetamadre, antivirus, garantia, discoduro, marca, tipo, 
                modelo, serie, so, responsable, mac
            }, id);

            // Crea un nuevo DTO con los datos actualizados del equipo
            const updatedEquipment = new EquipmentDTO(
                id, ip, procesador, funcionariousuario, lector, tarjetavideo, funcionarioasignado, oficina, 
                fecharegistro, codigo, memoria, tarjetamadre, antivirus, garantia, discoduro, marca, tipo, 
                modelo, serie, so, responsable, mac
            );

            // Retorna una respuesta exitosa en formato JSON indicando que el equipo ha sido actualizado
            return jsonResponse.successResponse(
                res,
                200,
                "Equipment has been updated",
                updatedEquipment
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

    // Método estático asíncrono para eliminar un equipo
    static async destroy(req, res) {
        try {
            const id = req.params.equipos_id;
            console.log("id ", id);

            // Realiza el borrado lógico y obtiene el registro actualizado
            await equipmentService.destroy(id);
            
            // Obtener el registro actualizado para mostrarlo en la respuesta
            const updatedEquipment = await equipmentService.show(id);

            // Crear un DTO con los datos actualizados
            const equipmentDTO = new EquipmentDTO(
                updatedEquipment.equipos_id,
                updatedEquipment.ip,
                updatedEquipment.procesador,
                updatedEquipment.funcionariousuario,
                updatedEquipment.lector,
                updatedEquipment.tarjetavideo,
                updatedEquipment.funcionarioasignado,
                updatedEquipment.oficina,
                updatedEquipment.fecharegistro,
                updatedEquipment.codigo,
                updatedEquipment.memoria,
                updatedEquipment.tarjetamadre,
                updatedEquipment.antivirus,
                updatedEquipment.garantia,
                updatedEquipment.discoduro,
                updatedEquipment.marca,
                updatedEquipment.tipo,
                updatedEquipment.modelo,
                updatedEquipment.serie,
                updatedEquipment.so,
                updatedEquipment.responsable,
                updatedEquipment.mac
            );

            return jsonResponse.successResponse(
                res,
                200,
                "Equipment has been marked as deleted",
                equipmentDTO
            );
        } catch (error) {
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
}

// Exporta la clase EquipmentController para que pueda ser utilizada en otros archivos
module.exports = EquipmentController;
