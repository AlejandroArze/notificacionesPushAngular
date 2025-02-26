// Importa el servicio 'service' desde la carpeta 'service'
const { Service } = require("../models");
const serviceService = require("../service/service");
// Importa una utilidad para responder en formato JSON
const jsonResponse = require("../http/response/jsonResponse");
// Importa el Data Transfer Object (DTO) que define la estructura de un 'servicio'
const ServiceDTO = require("../http/request/service/responseDTO");
// Importa Joi para validación de datos
const Joi = require("joi");
const ServiceService = require('../service/service');

class ServiceController {

    // Método estático asíncrono para crear un nuevo servicio
    static async store(req, res) {
        try {
            // Desestructura los campos necesarios para el nuevo servicio desde req.body
            const {
                nombreResponsableEgreso,
                cargoSolicitante,
                informe,
                cargoResponsableEgreso,
                oficinaSolicitante,
                fechaRegistro,
                equipo,
                problema,
                telefonoResponsableEgreso,
                gestion,
                telefonoSolicitante,
                tecnicoAsignado,
                observaciones,
                tipoResponsableEgreso,
                estado,
                tipoSolicitante,
                fechaTerminado,
                oficinaResponsableEgreso,
                numero,
                fechaInicio,
                fechaEgreso,
                ciSolicitante,
                nombreSolicitante,
                tipo,
                tecnicoRegistro,
                tecnicoEgreso,
                ciResponsableEgreso
            } = req.body;

            // Convertir NaN o undefined a null para tecnicoAsignado
            const tecnicoAsignadoValue = isNaN(tecnicoAsignado) || tecnicoAsignado === undefined ? 
                null : tecnicoAsignado;

            // Asegura que los campos numéricos sean tratados correctamente
            const gestionInt = parseInt(gestion, 10);

            // Crea un nuevo servicio utilizando el servicio 'serviceService'
            const { servicios_id } = await serviceService.store({
                nombreResponsableEgreso,
                cargoSolicitante,
                informe,
                cargoResponsableEgreso,
                oficinaSolicitante,
                fechaRegistro,
                equipo,
                problema,
                telefonoResponsableEgreso,
                gestion: gestionInt,
                telefonoSolicitante,
                tecnicoAsignado: tecnicoAsignadoValue,
                observaciones,
                tipoResponsableEgreso,
                estado,
                tipoSolicitante,
                fechaTerminado,
                oficinaResponsableEgreso,
                numero,
                fechaInicio,
                fechaEgreso,
                ciSolicitante,
                nombreSolicitante,
                tipo,
                tecnicoRegistro,
                tecnicoEgreso,
                ciResponsableEgreso
            });

            // Crea un nuevo DTO del servicio con los datos creados
            const newService = new ServiceDTO(
                servicios_id,
                nombreResponsableEgreso,
                cargoSolicitante,
                informe,
                cargoResponsableEgreso,
                oficinaSolicitante,
                fechaRegistro,
                equipo,
                problema,
                telefonoResponsableEgreso,
                gestionInt,
                telefonoSolicitante,
                tecnicoAsignadoValue,
                observaciones,
                tipoResponsableEgreso,
                estado,
                tipoSolicitante,
                fechaTerminado,
                oficinaResponsableEgreso,
                numero,
                fechaInicio,
                fechaEgreso,
                ciSolicitante,
                nombreSolicitante,
                tipo,
                tecnicoRegistro,
                tecnicoEgreso,
                ciResponsableEgreso
            );

            // Retorna una respuesta exitosa en formato JSON indicando que el servicio ha sido registrado
            return jsonResponse.successResponse(
                res,
                201,
                "Service has been registered successfully",
                newService
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

    // Método estático asíncrono para obtener información de un servicio
    static async show(req, res) {
        try {
            // Obtiene el ID del servicio a través de req.params
            const {
                servicios_id,
                nombreResponsableEgreso,
                cargoSolicitante,
                informe,
                cargoResponsableEgreso,
                oficinaSolicitante,
                fechaRegistro,
                equipo,
                problema,
                telefonoResponsableEgreso,
                gestion,
                telefonoSolicitante,
                tecnicoAsignado,
                observaciones,
                tipoResponsableEgreso,
                estado,
                tipoSolicitante,
                fechaTerminado,
                oficinaResponsableEgreso,
                numero,
                fechaInicio,
                fechaEgreso,
                ciSolicitante,
                nombreSolicitante,
                tipo,
                tecnicoRegistro,
                tecnicoEgreso,
                ciResponsableEgreso
            } = await serviceService.show(req.params.servicios_id);

            // Crea un DTO con los datos obtenidos del servicio, asegurando que los campos numéricos sean tratados correctamente
            const service = new ServiceDTO(
                servicios_id,
                nombreResponsableEgreso,
                cargoSolicitante,
                informe,
                cargoResponsableEgreso,
                oficinaSolicitante,
                fechaRegistro,
                equipo,
                problema,
                telefonoResponsableEgreso,
                parseInt(gestion, 10),
                telefonoSolicitante,
                parseInt(tecnicoAsignado, 10),
                observaciones,
                tipoResponsableEgreso,
                estado,
                tipoSolicitante,
                fechaTerminado,
                oficinaResponsableEgreso,
                numero,
                fechaInicio,
                fechaEgreso,
                ciSolicitante,
                nombreSolicitante,
                tipo,
                tecnicoRegistro,
                tecnicoEgreso,
                ciResponsableEgreso
            );

            // Retorna una respuesta exitosa en formato JSON indicando que el servicio existe
            return jsonResponse.successResponse(
                res,
                200,
                "Service exists",
                service
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

    // Método estático asíncrono para actualizar la información de un servicio
    static async update(req, res) {
        try {
            // Obtener el servicio actual de la base de datos
            const currentService = await Service.findByPk(req.params.servicios_id);
            
            // Función auxiliar para limpiar campos de texto
            const cleanField = (value, key) => {
                if (value === null || value === undefined) return value;
                if (typeof value !== 'string') return value;
                
                // Si el campo solo tiene espacios, mantener un espacio
                if (value.trim() === '') return ' ';
                
                // Si no, eliminar espacios al inicio y final
                return value.trim();
            };

            // Lista de campos permitidos
            const allowedFields = [
                'nombreResponsableEgreso',
                'cargoSolicitante',
                'informe',
                'cargoResponsableEgreso',
                'oficinaSolicitante',
                'fechaRegistro',
                'equipo',
                'problema',
                'telefonoResponsableEgreso',
                'gestion',
                'telefonoSolicitante',
                'tecnicoAsignado',
                'observaciones',
                'tipoResponsableEgreso',
                'estado',
                'tipoSolicitante',
                'fechaTerminado',
                'oficinaResponsableEgreso',
                'numero',
                'fechaInicio',
                'fechaEgreso',
                'ciSolicitante',
                'nombreSolicitante',
                'tipo',
                'tecnicoRegistro',
                'tecnicoEgreso',
                'ciResponsableEgreso',
                'servicios_id'
            ];

            // Limpia todos los campos del body y solo incluye los campos permitidos
            const cleanedBody = Object.keys(req.body).reduce((acc, key) => {
                if (allowedFields.includes(key)) {
                    acc[key] = cleanField(req.body[key], key);
                }
                return acc;
            }, {});

            // Mantener el tipo actual solo si no se envió uno nuevo
            if (!cleanedBody.tipo) {
                cleanedBody.tipo = currentService.tipo;
            }

            console.log('tiposId a guardar:', cleanedBody.tipo);

            // Actualiza el servicio con los datos limpios - CAMBIAR ORDEN DE PARÁMETROS
            const updatedService = await serviceService.update(
                cleanedBody,  // Primero los datos
                req.params.servicios_id  // Luego el ID
            );

            return jsonResponse.successResponse(
                res,
                200,
                "Service has been updated",
                updatedService
            );
        } catch (error) {
            console.error('Error en la actualización:', error);
            return Joi.isError(error) ? 
                jsonResponse.validationResponse(
                    res,
                    409,
                    "Validation error",
                    error.details.map(err => err.message)
                ) : 
                jsonResponse.errorResponse(
                    res,
                    500,
                    error.message
                );
        }
    }
    // Método estático asíncrono para eliminar un equipo
    static async destroy(req, res) {
        try {
            const id = req.params.servicios_id;
            console.log("id ", id);

            // Ahora realiza una eliminación lógica
            await serviceService.destroy(id);

            // Actualizar el mensaje para reflejar que es una eliminación lógica
            return jsonResponse.successResponse(
                res,
                200,
                "Service has been logically deleted"
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
    static async paginate(req, res) {
        try {
            const { 
                page = 1,
                limit = 10,
                search = '',
                sort = 'servicios_id',
                order = 'desc'
            } = req.query;

            // Llama al servicio de paginación con los parámetros
            const { count, rows } = await serviceService.paginate({ 
                page: parseInt(page), 
                limit: parseInt(limit), 
                search,
                sort,
                order
            });

            // Transforma los resultados en DTOs
            const serviceDTOs = rows.map(service => new ServiceDTO(service));

            return jsonResponse.successResponse(res, 200, "Services retrieved successfully", {
                total: count,
                perPage: parseInt(limit),
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                data: serviceDTOs
            });
        } catch (error) {
            console.error("Error en controlador de paginación:", error);
            return jsonResponse.errorResponse(res, 500, error.message);
        }
    }
    static async getServicesByTypeAndTechnician(req, res) {
        try {
            console.log('Controller: getServicesByTypeAndTechnician called');
            return await ServiceService.getServicesByTypeAndTechnician(req, res);
        } catch (error) {
            console.error('Controller Error:', error);
            return res.status(500).json({
                message: error.message
            });
        }
    }
    static async getServicesByDateRange(req, res) {
        try {
            console.log('Controller: getServicesByDateRange called');
            return await ServiceService.getServicesByDateRangeAndFilters(req, res);
        } catch (error) {
            console.error('Controller Error:', error);
            return res.status(500).json({
                message: error.message
            });
        }
    }
    static async getMetrics(req, res) {
        try {
            // Agregar role y user a los parámetros
            const metrics = await ServiceService.getServiceMetrics({
                ...req.query,
                role: req.user.role,
                user: req.user
            });
            return jsonResponse.successResponse(
                res,
                200,
                "Métricas de servicios obtenidas exitosamente",
                metrics
            );
        } catch (error) {
            console.error('Controller Error:', error);
            return jsonResponse.errorResponse(res, 500, error.message);
        }
    }
}


// Exporta la clase EquipmentController para que pueda ser utilizada en otros archivos
module.exports = ServiceController;