const { Service, sequelize } = require("../models"); // Requiere el modelo 'Service' y la instancia de sequelize para las transacciones
const storeDTO = require("../http/request/service/storeDTO"); // DTO para validar los datos del servicio en la operación de almacenamiento
const updateDTO = require("../http/request/service/updateDTO"); // DTO para validar los datos del servicio en la operación de actualización
const idDTO = require("../http/request/service/idDTO"); // DTO para validar los identificadores de servicios
const { Op, Sequelize } = require("sequelize");
const jsonResponse = require('../http/response/jsonResponse'); // Agregar esta línea al inicio del archivo

class ServiceService {

    // Método para almacenar un nuevo servicio
    static async store(data) {
        const DB = await sequelize.transaction(); // Inicia una transacción de base de datos con sequelize
        console.log("Service Data: ", data);

        try {
            // Valida los datos de entrada usando storeDTO (con Joi)
            await storeDTO.validateAsync(data, { abortEarly: false });

            // Convertir equipo vacío a null
            const equipoValue = data.equipo === "" ? null : data.equipo;

            // Crea un nuevo servicio en la base de datos usando los campos correspondientes
            const newService = await Service.create({
                nombreResponsableEgreso: data.nombreResponsableEgreso, // Se asigna el campo 'nombreResponsableEgreso'
                cargoSolicitante: data.cargoSolicitante, // Se asigna el campo 'cargoSolicitante'
                informe: data.informe, // Se asigna el campo 'informe'
                cargoResponsableEgreso: data.cargoResponsableEgreso, // Se asigna el campo 'cargoResponsableEgreso'
                oficinaSolicitante: data.oficinaSolicitante, // Se asigna el campo 'oficinaSolicitante'
                fechaRegistro: data.fechaRegistro, // Se asigna el campo 'fechaRegistro'
                equipo: data.equipo, // Se asigna el campo 'equipo'
                problema: data.problema, // Se asigna el campo 'problema'
                telefonoResponsableEgreso: data.telefonoResponsableEgreso, // Se asigna el campo 'telefonoResponsableEgreso'
                gestion: data.gestion, // Se asigna el campo 'gestion'
                telefonoSolicitante: data.telefonoSolicitante, // Se asigna el campo 'telefonoSolicitante'
                tecnicoAsignado: data.tecnicoAsignado, // Se asigna el campo 'tecnicoAsignado'
                observaciones: data.observaciones, // Se asigna el campo 'observaciones'
                tipoResponsableEgreso: data.tipoResponsableEgreso, // Se asigna el campo 'tipoResponsableEgreso'
                estado: data.estado, // Se asigna el campo 'estado'
                tipoSolicitante: data.tipoSolicitante, // Se asigna el campo 'tipoSolicitante'
                fechaTerminado: data.fechaTerminado, // Se asigna el campo 'fechaTerminado'
                oficinaResponsableEgreso: data.oficinaResponsableEgreso, // Se asigna el campo 'oficinaResponsableEgreso'
                numero: data.numero, // Se asigna el campo 'numero'
                fechaInicio: data.fechaInicio, // Se asigna el campo 'fechaInicio'
                fechaEgreso: data.fechaEgreso, // Se asigna el campo 'fechaEgreso'
                ciSolicitante: data.ciSolicitante, // Se asigna el campo 'ciSolicitante'
                nombreSolicitante: data.nombreSolicitante, // Se asigna el campo 'nombreSolicitante'
                tipo: data.tipo, // Se asigna el campo 'tipo'
                tecnicoRegistro: data.tecnicoRegistro, // Se asigna el campo 'tecnicoRegistro'
                tecnicoEgreso: data.tecnicoEgreso, // Se asigna el campo 'tecnicoEgreso'
                ciResponsableEgreso: data.ciResponsableEgreso // Se asigna el campo 'ciResponsableEgreso'
            });

            await DB.commit(); // Confirma la transacción

            return newService; // Retorna el nuevo servicio

        } catch (error) {
            await DB.rollback(); // Deshace los cambios si hay un error
            throw error; // Lanza el error para manejarlo
        }
    }

    // Método para mostrar un servicio por su ID
    static async show(id) {
        try {
            // Valida el ID del servicio
            await idDTO.validateAsync({ servicios_id: id });

            // Busca el servicio por su ID (campo servicios_id)
            const service = await Service.findByPk(id);

            return service; // Retorna el servicio

        } catch (error) {
            throw error; // Lanza el error para manejarlo
        }
    }

    // Método para actualizar un servicio por su ID
    static async update(data, id) {
        const DB = await sequelize.transaction(); // Inicia una transacción de base de datos
        console.log("Service Data: ", data);
        console.log("Service ID: ", id);

        try {
            data.servicios_id = id; // Asigna el ID al objeto de datos

            // Valida los datos de entrada usando updateDTO
            await updateDTO.validateAsync(data, { abortEarly: false });

            // Convertir equipo vacío a null
            const equipoValue = data.equipo === "" ? null : data.equipo;

            // Actualiza los campos del servicio con los datos proporcionados
            await Service.update(data, { 
                where: { servicios_id: id } 
            });

            // Obtener el registro actualizado
            const updatedService = await Service.findByPk(id);

            await DB.commit(); // Confirma la transacción

            return updatedService; // Retorna el servicio actualizado

        } catch (error) {
            await DB.rollback(); // Deshace los cambios si hay un error
            throw error; // Lanza el error para manejarlo
        }
    }

    // Método para eliminar un servicio por su ID
    static async destroy(id) {
        console.log("Service Logical Delete ID: ", id);
        const DB = await sequelize.transaction();
        
        try {
            // Valida el ID del servicio
            await idDTO.validateAsync({ servicios_id: id });

             // Elimina el servicio por su ID (campo servicios_id)
             //await Service.destroy({ where: { servicios_id: id } });

            // En lugar de eliminar, actualiza el campo __v a 1
            await Service.update(
                { __v: 1 },
                { 
                    where: { servicios_id: id },
                    transaction: DB
                }
            );

            await DB.commit();

        } catch (error) {
            await DB.rollback();
            throw error;
        }
    }

    static async paginate(queryParams) {
        try {
            const { 
                page = 1, 
                limit = 10, 
                search = '', 
                sort = 'fechaRegistro',
                order = 'DESC'
            } = queryParams;

            const orderDirection = (order || 'DESC').toString().toUpperCase();
            const decodedSearch = decodeURIComponent(search).trim();
            
            // Agregar condición para __v en whereConditions
            const whereConditions = {
                __v: 0 // Solo mostrar registros activos
            };

            if (decodedSearch) {
                whereConditions[Op.or] = [
                    { nombreSolicitante: { [Op.iLike]: `%${decodedSearch}%` } },
                    { problema: { [Op.iLike]: `%${decodedSearch}%` } },
                    { estado: { [Op.iLike]: `%${decodedSearch}%` } }
                ];
            }

            const { count, rows } = await Service.findAndCountAll({
                where: whereConditions,
                order: [[sort, orderDirection]],
                limit: parseInt(limit),
                offset: (parseInt(page)) * parseInt(limit),
                raw: true
            });

            return { 
                count, 
                rows,
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit)
            };
        } catch (error) {
            console.error('Error en paginación:', error);
            throw error;
        }
    }
    
    static async getServicesByTypeAndTechnician(req, res) {
        console.log('Service: getServicesByTypeAndTechnician called');
        try {
            const { 
                tipo, 
                tecnicoAsignado, 
                estado,  
                page = 1, 
                limit = 100, 
                search = ''
            } = req.query;
            
            // Obtener el rol del usuario autenticado
            const role = req.user.role;
            
            console.log('Query params:', { tipo, tecnicoAsignado, estado, page, limit, search });
            console.log('User role:', role);
            
            const whereConditions = {
                __v: 0  // Agregar esta condición para servicios activos
            };

            // Si es rol 2, manejar las dos situaciones
            if (role === '2') {
                // Obtener lista de usuarios activos primero
                const activeUsers = await sequelize.models.User.findAll({
                    where: {
                        estado: 1 // Usuarios ACTIVOS tienen estado = 1
                    }
                });

                console.log('Usuarios activos encontrados:', activeUsers.length);
                const activeUserIds = activeUsers.map(user => user.usuarios_id);
                console.log('IDs de usuarios activos:', activeUserIds);

                if (activeUserIds.length > 0) {
                    
                       
                        // Situación 1: tecnicoAsignado es null y tecnicoRegistro es activo
                        whereConditions[Op.and] = [
                            {
                                [Op.or]: [
                                    {
                                        tecnicoAsignado: null
                                    },
                                    {
                                        tecnicoAsignado: {
                                            [Op.in]: activeUserIds
                                        }
                                    }
                                ]
                            },
                            {
                                tecnicoRegistro: {
                                    [Op.in]: activeUserIds
                                }
                            }
                        ];
                    
                }
            } else if (role === '3' ) {
                console.log('Entrando a verificación de rol 3:', {
                    role,
                    tecnicoAsignado,
                    user: req.user
                });

                const userId = req.user?.id || req.user?.usuarios_id;

                if (!userId) {
                    console.log('Usuario no autenticado o sin ID válido');
                    if (tipo) {
                        whereConditions.tipo = decodeURIComponent(tipo).trim();
                    }
                } else {
                    // Verificar estado del usuario solicitante
                    const requestingUser = await sequelize.models.User.findOne({
                        where: { usuarios_id: userId }
                    });

                    if (requestingUser && requestingUser.estado === 0) {
                        // Usuario INACTIVO
                        console.log('Usuario está inactivo, buscando servicios de técnicos inactivos');
                        
                        const inactiveUsers = await sequelize.models.User.findAll({
                            where: { estado: 0 }
                        });                        

                        const inactiveUserIds = inactiveUsers.map(user => user.usuarios_id);
                        console.log('IDs de usuarios inactivos:', inactiveUserIds);

                        if (inactiveUserIds.length > 0) {
                            

                            // Luego agregar las condiciones de técnicos
                            whereConditions[Op.or] = [
                                {
                                    
                                        
                                    tecnicoAsignado: null,
                                    tecnicoRegistro: {
                                        [Op.in]: inactiveUserIds
                                    }
                                        
                                    
                                },
                                {
                                    
                                        
                                    tecnicoAsignado: {
                                        [Op.in]: inactiveUserIds
                                    },
                                    tecnicoRegistro: {
                                        [Op.in]: inactiveUserIds
                                    }
                                        
                                }
                            ];

                            console.log('Condiciones completas para inactivos:', JSON.stringify(whereConditions, null, 2));
                        }
                    } else {
                        // Usuario ACTIVO
                        console.log('Usuario está activo, buscando servicios de técnicos activos');
                        
                        const activeUsers = await sequelize.models.User.findAll({
                            where: { estado: 1 }
                        });

                        const activeUserIds = activeUsers.map(user => user.usuarios_id);
                        
                        if (activeUserIds.length > 0) {
                            // Situación 1: tecnicoAsignado es null y tecnicoRegistro es activo
                        whereConditions[Op.and] = [
                            {
                                [Op.or]: [
                                    {
                                        tecnicoAsignado: null
                                    },
                                    {
                                        tecnicoAsignado: {
                                            [Op.in]: activeUserIds
                                        }
                                    }
                                ]
                            },
                            {
                                tecnicoRegistro: {
                                    [Op.in]: activeUserIds
                                }
                            }
                        ];
                        }
                    }
                }
            } else if (tecnicoAsignado && tecnicoAsignado !== 'null') {
                whereConditions.tecnicoAsignado = parseInt(tecnicoAsignado, 10);
            }

            if (tipo) {
                whereConditions.tipo = decodeURIComponent(tipo).trim();
            }

            if (estado && estado !== 'null' && estado !== 'undefined') {
                whereConditions.estado = {
                    [Op.iLike]: decodeURIComponent(estado).trim()
                };
            }

            console.log('Where conditions:', whereConditions);

            const { count, rows } = await Service.findAndCountAll({
                where: whereConditions,
                order: [['fechaRegistro', 'DESC']],
                limit: parseInt(limit),
                offset: (parseInt(page) - 1) * parseInt(limit),
                raw: true
            });

            return jsonResponse.successResponse(
                res,
                200,
                "Services retrieved successfully",
                {
                    total: count,
                    perPage: parseInt(limit),
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(count / limit),
                    data: rows
                }
            );
        } catch (error) {
            console.error("Service Error:", error);
            return jsonResponse.errorResponse(res, 500, error.message);
        }
    }

    static async getServicesByDateRangeAndFilters(req, res) {
        try {
            const {
                fechaInicio,
                fechaFin,
                tipo,
                tecnicoAsignado,
                estado,
                page = 1,
                limit = 10
            } = req.query;

            const role = req.user?.role;
            
            let whereConditions = {
                __v: 0
            };

            // Aplicar restricciones por rol
            if (role === '2' || role === '3') {
                const userId = req.user?.id || req.user?.usuarios_id;
                
                if (role === '2') {
                    // Para rol 2 - Solo servicios de técnicos activos
                    const activeUsers = await sequelize.models.User.findAll({
                        where: { estado: 1 }
                    });
                    const activeUserIds = activeUsers.map(user => user.usuarios_id);

                    whereConditions[Op.and] = [
                        {
                            [Op.or]: [
                                { tecnicoAsignado: null },
                                { tecnicoAsignado: { [Op.in]: activeUserIds } }
                            ]
                        },
                        {
                            tecnicoRegistro: { [Op.in]: activeUserIds }
                        }
                    ];
                } else if (role === '3') {
                    const requestingUser = await sequelize.models.User.findOne({
                        where: { usuarios_id: userId }
                    });

                    if (requestingUser?.estado === 0) {
                        // Usuario inactivo - ver servicios de inactivos
                        const inactiveUsers = await sequelize.models.User.findAll({
                            where: { estado: 0 }
                        });
                        const inactiveUserIds = inactiveUsers.map(user => user.usuarios_id);

                        whereConditions[Op.or] = [
                            {
                                tecnicoAsignado: null,
                                tecnicoRegistro: { [Op.in]: inactiveUserIds }
                            },
                            {
                                tecnicoAsignado: { [Op.in]: inactiveUserIds },
                                tecnicoRegistro: { [Op.in]: inactiveUserIds }
                            }
                        ];
                    } else {
                        // Usuario activo - ver servicios de activos
                        const activeUsers = await sequelize.models.User.findAll({
                            where: { estado: 1 }
                        });
                        const activeUserIds = activeUsers.map(user => user.usuarios_id);

                        whereConditions[Op.and] = [
                            {
                                [Op.or]: [
                                    { tecnicoAsignado: null },
                                    { tecnicoAsignado: { [Op.in]: activeUserIds } }
                                ]
                            },
                            {
                                tecnicoRegistro: { [Op.in]: activeUserIds }
                            }
                        ];
                    }
                }
            }

            // Agregar filtro de rango de fechas si se proporcionan
            if (fechaInicio && fechaFin) {
                const startDate = new Date(decodeURIComponent(fechaInicio).trim());
                let endDate = new Date(decodeURIComponent(fechaFin).trim());
                
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);

                const dateConditions = {
                    [Op.or]: [
                        {
                            fechaInicio: {
                                [Op.between]: [startDate.toISOString(), endDate.toISOString()]
                            }
                        },
                        {
                            fechaTerminado: {
                                [Op.between]: [startDate.toISOString(), endDate.toISOString()]
                            }
                        }
                    ]
                };

                if (whereConditions[Op.and]) {
                    whereConditions[Op.and].push(dateConditions);
                } else if (whereConditions[Op.or]) {
                    whereConditions = {
                        [Op.and]: [
                            whereConditions,
                            dateConditions
                        ]
                    };
                } else {
                    whereConditions = {
                        ...whereConditions,
                        ...dateConditions
                    };
                }
            }

            // Resto de los filtros igual que antes...
            if (tipo) whereConditions.tipo = { [Op.iLike]: `%${decodeURIComponent(tipo).trim()}%` };
            if (tecnicoAsignado) whereConditions.tecnicoAsignado = parseInt(tecnicoAsignado, 10);
            if (estado) whereConditions.estado = { [Op.iLike]: `%${decodeURIComponent(estado).trim()}%` };

            const { count, rows } = await Service.findAndCountAll({
                where: whereConditions,
                order: [['fechaRegistro', 'DESC']],
                limit: parseInt(limit),
                offset: (parseInt(page) - 1) * parseInt(limit),
                raw: true
            });

            return jsonResponse.successResponse(res, 200, "Services filtered successfully", {
                total: count,
                perPage: parseInt(limit),
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                data: rows
            });
        } catch (error) {
            console.error("Service Error:", error);
            return jsonResponse.errorResponse(res, 500, error.message);
        }
    }

    static async getServiceMetrics(params) {
        try {
            const { fechaInicio, fechaFin, tipo, tecnicoAsignado, estado, role, user } = params;
            let whereConditions = {
                __v: 0
            };

            // Aplicar restricciones por rol
            if (role === '2' || role === '3') {
                const userId = user?.id || user?.usuarios_id;
                
                if (role === '2') {
                    const activeUsers = await sequelize.models.User.findAll({
                        where: { estado: 1 }
                    });
                    const activeUserIds = activeUsers.map(user => user.usuarios_id);

                    whereConditions[Op.and] = [
                        {
                            [Op.or]: [
                                { tecnicoAsignado: null },
                                { tecnicoAsignado: { [Op.in]: activeUserIds } }
                            ]
                        },
                        {
                            tecnicoRegistro: { [Op.in]: activeUserIds }
                        }
                    ];
                } else if (role === '3') {
                    const requestingUser = await sequelize.models.User.findOne({
                        where: { usuarios_id: userId }
                    });

                    if (requestingUser?.estado === 0) {
                        const inactiveUsers = await sequelize.models.User.findAll({
                            where: { estado: 0 }
                        });
                        const inactiveUserIds = inactiveUsers.map(user => user.usuarios_id);

                        whereConditions[Op.or] = [
                            {
                                tecnicoAsignado: null,
                                tecnicoRegistro: { [Op.in]: inactiveUserIds }
                            },
                            {
                                tecnicoAsignado: { [Op.in]: inactiveUserIds },
                                tecnicoRegistro: { [Op.in]: inactiveUserIds }
                            }
                        ];
                    } else {
                        const activeUsers = await sequelize.models.User.findAll({
                            where: { estado: 1 }
                        });
                        const activeUserIds = activeUsers.map(user => user.usuarios_id);

                        whereConditions[Op.and] = [
                            {
                                [Op.or]: [
                                    { tecnicoAsignado: null },
                                    { tecnicoAsignado: { [Op.in]: activeUserIds } }
                                ]
                            },
                            {
                                tecnicoRegistro: { [Op.in]: activeUserIds }
                            }
                        ];
                    }
                }
            }

            // Agregar filtros según los parámetros recibidos
            if (fechaInicio && fechaFin) {
                const startDate = new Date(decodeURIComponent(fechaInicio).trim());
                let endDate = new Date(decodeURIComponent(fechaFin).trim());
                
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);

                const dateConditions = {
                    [Op.or]: [
                        {
                            fechaInicio: {
                                [Op.between]: [startDate.toISOString(), endDate.toISOString()]
                            }
                        },
                        {
                            fechaTerminado: {
                                [Op.between]: [startDate.toISOString(), endDate.toISOString()]
                            }
                        }
                    ]
                };

                if (whereConditions[Op.and]) {
                    whereConditions[Op.and].push(dateConditions);
                } else if (whereConditions[Op.or]) {
                    whereConditions = {
                        [Op.and]: [
                            whereConditions,
                            dateConditions
                        ]
                    };
                } else {
                    whereConditions = {
                        ...whereConditions,
                        ...dateConditions
                    };
                }
            }

            if (tipo) {
                whereConditions.tipo = {
                    [Op.iLike]: `%${decodeURIComponent(tipo).trim()}%`
                };
            }

            if (tecnicoAsignado) {
                whereConditions.tecnicoAsignado = parseInt(tecnicoAsignado, 10);
            }

            if (estado) {
                whereConditions.estado = {
                    [Op.iLike]: `%${decodeURIComponent(estado).trim()}%`
                };
            }

            // 1. Distribución por tipo de servicio
            const serviciosPorTipo = await Service.findAll({
                attributes: [
                    'tipo',
                    [sequelize.fn('COUNT', sequelize.col('servicios_id')), 'cantidad'],
                    [
                        sequelize.literal('ROUND(CAST(COUNT(*) AS DECIMAL) * 100 / NULLIF((SELECT COUNT(*) FROM servicios), 0), 2)'),
                        'porcentaje'
                    ]
                ],
                where: whereConditions,
                group: ['tipo'],
                order: [[sequelize.fn('COUNT', sequelize.col('servicios_id')), 'DESC']]
            });

            // 2. Métricas por técnico
            const metricasPorTecnico = await Service.findAll({
                attributes: [
                    'tecnicoAsignado',
                    [sequelize.fn('COUNT', sequelize.col('servicios_id')), 'total_servicios'],
                    [
                        sequelize.literal(`SUM(CASE WHEN estado = 'TERMINADO' THEN 1 ELSE 0 END)`),
                        'servicios_completados'
                    ],
                    [
                        sequelize.literal(`
                            EXTRACT(EPOCH FROM AVG(
                                CASE 
                                    WHEN "fechaTerminado" IS NOT NULL AND "fechaInicio" IS NOT NULL 
                                    THEN GREATEST("fechaTerminado"::timestamp, "fechaInicio"::timestamp) - 
                                         LEAST("fechaTerminado"::timestamp, "fechaInicio"::timestamp)
                                END
                            ))
                        `),
                        'tiempo_promedio_segundos'
                    ]
                ],
                where: {
                    ...whereConditions,
                    tecnicoAsignado: { [Op.not]: null }
                },
                group: ['tecnicoAsignado']
            });

            // 3. Tiempo promedio de resolución por tipo
            const tiempoResolucionPorTipo = await Service.findAll({
                attributes: [
                    'tipo',
                    [
                        sequelize.literal(`
                            EXTRACT(EPOCH FROM AVG(
                                CASE 
                                    WHEN "fechaTerminado" IS NOT NULL AND "fechaInicio" IS NOT NULL 
                                    THEN GREATEST("fechaTerminado"::timestamp, "fechaInicio"::timestamp) - 
                                         LEAST("fechaTerminado"::timestamp, "fechaInicio"::timestamp)
                                END
                            ))
                        `),
                        'tiempo_promedio'
                    ],
                    [sequelize.fn('COUNT', sequelize.col('servicios_id')), 'total_servicios']
                ],
                where: {
                    ...whereConditions,
                    fechaTerminado: { [Op.not]: null },
                    fechaInicio: { [Op.not]: null }
                },
                group: ['tipo']
            });

            // 4. Resumen general
            const resumenGeneral = await Service.findAll({
                attributes: [
                    [sequelize.fn('COUNT', sequelize.col('servicios_id')), 'total_servicios'],
                    [
                        sequelize.literal(`SUM(CASE WHEN estado = 'TERMINADO' THEN 1 ELSE 0 END)`),
                        'servicios_terminados'
                    ],
                    [
                        sequelize.literal(`
                            EXTRACT(EPOCH FROM AVG(
                                CASE 
                                    WHEN "fechaTerminado" IS NOT NULL AND "fechaInicio" IS NOT NULL 
                                    THEN GREATEST("fechaTerminado"::timestamp, "fechaInicio"::timestamp) - 
                                         LEAST("fechaTerminado"::timestamp, "fechaInicio"::timestamp)
                                END
                            ))
                        `),
                        'tiempo_promedio_general'
                    ]
                ],
                where: whereConditions
            });

            // Procesar y formatear los datos para los gráficos
            const chartData = {
                resumen: {
                    total_servicios: parseInt(resumenGeneral[0].dataValues.total_servicios) || 0,
                    servicios_terminados: parseInt(resumenGeneral[0].dataValues.servicios_terminados) || 0,
                    tiempo_promedio_general: parseFloat(resumenGeneral[0].dataValues.tiempo_promedio_general) / 3600 || 0
                },
                distribucionTipos: {
                    labels: serviciosPorTipo.map(item => item.tipo || 'Sin tipo'),
                    data: serviciosPorTipo.map(item => ({
                        tipo: item.tipo || 'Sin tipo',
                        cantidad: parseInt(item.get('cantidad')) || 0,
                        porcentaje: parseFloat(item.get('porcentaje')) || 0
                    }))
                },
                rendimientoTecnicos: await Promise.all(metricasPorTecnico.map(async item => {
                    const tecnico = await sequelize.models.User.findByPk(item.tecnicoAsignado);
                    const tiempoPromedioSegundos = parseFloat(item.get('tiempo_promedio_segundos')) || 0;
                    const tiempoPromedioHoras = tiempoPromedioSegundos / 3600;
                    const tiempoPromedioMinutos = tiempoPromedioSegundos / 60;

                    return {
                        tecnico_id: item.tecnicoAsignado,
                        tecnico: tecnico ? `${tecnico.nombres} ${tecnico.apellidos}` : `Técnico ${item.tecnicoAsignado}`,
                        total_servicios: parseInt(item.get('total_servicios')) || 0,
                        completados: parseInt(item.get('servicios_completados')) || 0,
                        tiempo_promedio_horas: parseFloat(tiempoPromedioHoras.toFixed(2)),
                        tiempo_promedio_minutos: parseFloat(tiempoPromedioMinutos.toFixed(2)),
                        tiempo_promedio_segundos: parseFloat(tiempoPromedioSegundos.toFixed(2))
                    };
                })),
                tiemposResolucion: tiempoResolucionPorTipo.map(item => {
                    const tiempoPromedioSegundos = parseFloat(item.get('tiempo_promedio')) || 0;
                    const tiempoPromedioHoras = tiempoPromedioSegundos / 3600;
                    const tiempoPromedioMinutos = tiempoPromedioSegundos / 60;

                    return {
                        tipo: item.tipo || 'Sin tipo',
                        tiempo_promedio_horas: parseFloat(tiempoPromedioHoras.toFixed(2)),
                        tiempo_promedio_minutos: parseFloat(tiempoPromedioMinutos.toFixed(2)),
                        tiempo_promedio_segundos: parseFloat(tiempoPromedioSegundos.toFixed(2)),
                        total_servicios: parseInt(item.get('total_servicios')) || 0
                    };
                })
            };

            return chartData;
        } catch (error) {
            console.error("Error al obtener métricas de servicios:", error);
            throw error;
        }
    }
}

module.exports = ServiceService;

