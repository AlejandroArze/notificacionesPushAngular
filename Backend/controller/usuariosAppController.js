const { UsuariosApp, Usuarios } = require('../models');
const { Op } = require('sequelize');

class UsuariosAppController {
    async buscarUsuarios(req, res) {
        try {
            console.log('Parámetros de búsqueda recibidos:', req.query);

            const {
                // Filtros generales
                id,
                user_id,
                nombres,
                paterno,
                materno,
                nro_documento,
                
                // Filtros específicos
                tipodocumento_id,
                expedido_id,
                genero,
                estado_civil,
                municipio,
                subalcaldia,
                distrito,
                subdistrito,
                zona,
                
                // Filtros de estado
                estado,
                
                // Paginación
                page = 1,
                limit = 10,
                
                // Ordenamiento
                orderBy = 'id',
                order = 'ASC'
            } = req.query;

            // Construir condiciones de búsqueda dinámicamente
            const whereCondition = {};

            // Validación y conversión de tipos
            const parseIntSafe = (value) => {
                const parsed = parseInt(value);
                return !isNaN(parsed) ? parsed : undefined;
            };

            // Agregar condiciones si están presentes
            if (id) whereCondition.id = parseIntSafe(id);
            if (user_id) whereCondition.user_id = parseIntSafe(user_id);
            
            // Búsquedas parciales para campos de texto
            if (nombres) whereCondition.nombres = { [Op.iLike]: `%${nombres}%` };
            if (paterno) whereCondition.paterno = { [Op.iLike]: `%${paterno}%` };
            if (materno) whereCondition.materno = { [Op.iLike]: `%${materno}%` };
            if (nro_documento) whereCondition.nro_documento = { [Op.iLike]: `%${nro_documento}%` };

            // Otros filtros específicos
            if (tipodocumento_id) whereCondition.tipodocumento_id = parseIntSafe(tipodocumento_id);
            if (expedido_id) whereCondition.expedido_id = parseIntSafe(expedido_id);
            if (genero) whereCondition.genero = genero;
            if (estado_civil) whereCondition.estado_civil = estado_civil;
            if (municipio) whereCondition.municipio = { [Op.iLike]: `%${municipio}%` };
            if (subalcaldia) whereCondition.subalcaldia = { [Op.iLike]: `%${subalcaldia}%` };
            if (distrito) whereCondition.distrito = { [Op.iLike]: `%${distrito}%` };
            if (subdistrito) whereCondition.subdistrito = { [Op.iLike]: `%${subdistrito}%` };
            if (zona) whereCondition.zona = { [Op.iLike]: `%${zona}%` };
            if (estado) whereCondition.estado = estado;

            // Validar parámetros de paginación
            const pageNum = Math.max(1, parseIntSafe(page) || 1);
            const limitNum = Math.max(1, Math.min(100, parseIntSafe(limit) || 10));

            // Validar ordenamiento
            const validOrderColumns = ['id', 'nombres', 'paterno', 'materno', 'nro_documento'];
            const safeOrderBy = validOrderColumns.includes(orderBy) ? orderBy : 'id';
            const safeOrder = ['ASC', 'DESC'].includes(order.toUpperCase()) ? order.toUpperCase() : 'ASC';

            // Realizar búsqueda con paginación
            const { count, rows } = await UsuariosApp.findAndCountAll({
                where: whereCondition,
                include: [
                    {
                        model: Usuarios,
                        as: 'usuario',
                        attributes: ['email', 'usuario', 'role']
                    }
                ],
                order: [[safeOrderBy, safeOrder]],
                limit: limitNum,
                offset: (pageNum - 1) * limitNum
            });

            // Formatear respuesta
            res.json({
                success: true,
                total: count,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(count / limitNum),
                data: rows
            });
        } catch (error) {
            console.error('Error completo en búsqueda de usuarios:', {
                message: error.message,
                stack: error.stack,
                query: req.query
            });
            res.status(500).json({
                success: false,
                error: error.message,
                detailedError: error.toString(),
                query: req.query
            });
        }
    }

    // Obtener detalles de un usuario específico
    async obtenerDetalleUsuario(req, res) {
        try {
            const { id } = req.params;

            const usuario = await UsuariosApp.findByPk(id, {
                include: [
                    {
                        model: Usuarios,
                        as: 'usuario',
                        attributes: ['email', 'usuario', 'role', 'nombres', 'apellidos']
                    }
                ]
            });

            if (!usuario) {
                return res.status(404).json({
                    success: false,
                    error: 'Usuario no encontrado'
                });
            }

            res.json({
                success: true,
                data: usuario
            });
        } catch (error) {
            console.error('Error obteniendo detalle de usuario:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async createUsuarioApp(req, res) {
        try {
            const nuevoUsuario = await UsuariosApp.create(req.body);
            res.status(201).json({
                success: true,
                data: nuevoUsuario
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async getAllUsuariosApp(req, res) {
        try {
            const usuarios = await UsuariosApp.findAll();
            res.json({
                success: true,
                data: usuarios
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async getUsuarioAppById(req, res) {
        try {
            const { id } = req.params;
            const usuario = await UsuariosApp.findByPk(id);
            
            if (!usuario) {
                return res.status(404).json({
                    success: false,
                    error: 'Usuario no encontrado'
                });
            }

            res.json({
                success: true,
                data: usuario
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async updateUsuarioApp(req, res) {
        try {
            const { id } = req.params;
            const [updated] = await UsuariosApp.update(req.body, {
                where: { id: id }
            });

            if (updated) {
                const usuarioActualizado = await UsuariosApp.findByPk(id);
                return res.json({
                    success: true,
                    data: usuarioActualizado
                });
            }

            throw new Error('Usuario no encontrado');
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async deleteUsuarioApp(req, res) {
        try {
            const { id } = req.params;
            const deleted = await UsuariosApp.destroy({
                where: { id: id }
            });

            if (deleted) {
                return res.json({
                    success: true,
                    message: 'Usuario eliminado exitosamente'
                });
            }

            throw new Error('Usuario no encontrado');
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = new UsuariosAppController(); 