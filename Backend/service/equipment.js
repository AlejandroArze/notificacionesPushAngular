const { Equipment, sequelize } = require("../models"); // Requiere el modelo 'Equipment' y la instancia de sequelize para las transacciones
const storeDTO = require("../http/request/equipment/storeDTO"); // DTO para validar los datos en la operación de almacenamiento
const updateDTO = require("../http/request/equipment/updateDTO"); // DTO para validar los datos en la operación de actualización
const idDTO = require("../http/request/equipment/idDTO"); // DTO para validar los identificadores de equipos
const responseDTO = require("../http/request/equipment/responseDTO");
const { Op, Sequelize } = require("sequelize");

class EquipmentService {

    // Método para almacenar un nuevo equipo
    static async store(data) {
        const DB = await sequelize.transaction(); // Inicia una transacción de base de datos con sequelize
        console.log("Service Data: ", data);

        try {
            // Valida los datos de entrada usando storeDTO (con Joi)
            await storeDTO.validateAsync(data, { abortEarly: false });

            // Crea un nuevo equipo en la base de datos usando los campos correspondientes
            const newEquipment = await Equipment.create({
                ip: data.ip,
                procesador: data.procesador,
                funcionariousuario: data.funcionariousuario,
                lector: data.lector,
                tarjetavideo: data.tarjetavideo,
                funcionarioasignado: data.funcionarioasignado,
                oficina: data.oficina,
                fecharegistro: data.fecharegistro,
                codigo: data.codigo,
                memoria: data.memoria,
                tarjetamadre: data.tarjetamadre,
                antivirus: data.antivirus,
                garantia: data.garantia,
                discoduro: data.discoduro,
                marca: data.marca,
                tipo: data.tipo,
                modelo: data.modelo,
                serie: data.serie,
                so: data.so,
                responsable: data.responsable,
                mac: data.mac
            });

            await DB.commit(); // Confirma la transacción

            return newEquipment; // Retorna el nuevo equipo

        } catch (error) {
            await DB.rollback(); // Deshace los cambios si hay un error
            throw error; // Lanza el error para manejarlo
        }
    }

    // Método para mostrar un equipo por su ID
    static async show(id) {
        try {
            // Valida el ID del equipo
            await idDTO.validateAsync({ equipos_id: id });

            // Busca el equipo por su ID (campo equipos_id), incluyendo los marcados como eliminados
            const equipment = await Equipment.findOne({
                where: {
                    equipos_id: id
                }
            });

            return equipment;

        } catch (error) {
            throw error;
        }
    }
   
    /**
     * Método para paginar equipos en el servicio.
     * @param {object} queryParams - Contiene los parámetros necesarios para la paginación.
     * @returns {object} - Devuelve un objeto con el conteo total y los equipos correspondientes a la página solicitada.
     */
    static async paginate2(queryParams) {
        // Extrae los parámetros page y limit de queryParams.
        const { page, limit } = queryParams;
        console.log(page, limit)
        // Calcula el offset basado en el número de página y el límite de elementos por página.
        const offset = (page - 1) * limit;
        

        // Realiza una consulta a la base de datos para obtener la cantidad total de elementos y los elementos de la página actual.
        const { count, rows } = await Equipment.findAndCountAll({
            limit: limit, // Número máximo de elementos a retornar.
            offset: offset, // Número de elementos a omitir antes de comenzar a retornar los resultados.
            order: [['equipos_id', 'DESC']] // Criterio de ordenación, aquí se ordena por ID de manera descendente.
        });

        // Devuelve el resultado de la consulta que incluye tanto la cantidad total de equipos como los equipos de la página actual.
        return { count, rows };
    }
    static async paginate4(queryParams) {
        const { page, limit, search } = queryParams; // Agrega el término de búsqueda
        const offset = (page - 1) * limit;
    
        // Define la condición de búsqueda si `search` está presente
        const whereCondition = search
            ? {
                [Op.or]: [
                    
                    { funcionariousuario: { [Op.like]: `%${search}%` } },
                    // Agrega más campos si quieres buscar en ellos
                ],
            }
            : {};
    
        // Realiza la consulta con la condición de búsqueda
        const { count, rows } = await Equipment.findAndCountAll({
            where: whereCondition, // Agrega la condición de búsqueda
            limit: limit,
            offset: offset,
            order: [['equipos_id', 'DESC']],
        });
    
        return { count, rows };
    }
    static async paginate6(queryParams) {
        const { page, limit, search } = queryParams;
        const offset = (page - 1) * limit;
    
        // Construir dinámicamente las condiciones de búsqueda
        const whereCondition = search
            ? {
                [Op.or]: Object.keys(Equipment.rawAttributes).map((field) => ({
                    [field]: { [Op.like]: `%${search}%` },
                })),
            }
            : {};
    
        // Realizar la consulta con paginación y condiciones de búsqueda
        const { count, rows } = await Equipment.findAndCountAll({
            where: whereCondition,
            limit: limit,
            offset: offset,
            order: [['equipos_id', 'DESC']],
        });
    
        return { count, rows };
    }
    

static async paginate(queryParams) {
    const { page, limit, search } = queryParams;
    const offset = (page - 1) * limit;

    // Obtener todas las columnas del modelo
    const columns = Object.keys(Equipment.rawAttributes);

    // Construir las condiciones de búsqueda
    let whereCondition = {
        __v: 0  // Cambiado de _v a __v
    };

    if (search) {
        whereCondition = {
            [Op.and]: [
                { __v: 0 },  // Cambiado de _v a __v
                {
                    [Op.or]: columns.map((field) => {
                        const columnType = Equipment.rawAttributes[field].type.key;

                        if (columnType === "STRING" || columnType === "TEXT") {
                            return Sequelize.literal(`unaccent("${field}") ILIKE unaccent('%${search}%')`);
                        } else {
                            return Sequelize.literal(`CAST("${field}" AS TEXT) ILIKE '%${search}%'`);
                        }
                    })
                }
            ]
        };
    }

    try {
        const { count, rows } = await Equipment.findAndCountAll({
            where: whereCondition,
            limit: limit,
            offset: offset,
            order: [["equipos_id", "DESC"]],
        });

        return { count, rows };
    } catch (error) {
        console.error("Error en paginación:", error.message);
        throw error;
    }
}

    

    // Método para actualizar un equipo por su ID
    static async update(data, id) {
        const DB = await sequelize.transaction(); // Inicia una transacción de base de datos
        console.log("Service Data: ", data);
        console.log("Service ID: ", id);

        try {
            data.equipos_id = id; // Asigna el ID al objeto de datos

            // Valida los datos de entrada usando updateDTO
            await updateDTO.validateAsync(data, { abortEarly: false });

            // Actualiza los campos del equipo con los datos proporcionados
            const updatedEquipment = await Equipment.update({
                ip: data.ip,
                procesador: data.procesador,
                funcionariousuario: data.funcionariousuario,
                lector: data.lector,
                tarjetavideo: data.tarjetavideo,
                funcionarioasignado: data.funcionarioasignado,
                oficina: data.oficina,
                fecharegistro: data.fecharegistro,
                codigo: data.codigo,
                memoria: data.memoria,
                tarjetamadre: data.tarjetamadre,
                antivirus: data.antivirus,
                garantia: data.garantia,
                discoduro: data.discoduro,
                marca: data.marca,
                tipo: data.tipo,
                modelo: data.modelo,
                serie: data.serie,
                so: data.so,
                responsable: data.responsable,
                mac: data.mac
            }, { where: { equipos_id: id } }); // Condición para actualizar el registro por ID

            await DB.commit(); // Confirma la transacción

            return updatedEquipment; // Retorna el equipo actualizado

        } catch (error) {
            await DB.rollback(); // Deshace los cambios si hay un error
            throw error; // Lanza el error para manejarlo
        }
    }

    // Método para eliminar un equipo por su ID
    static async destroy(id) {
        console.log("Service Destroy ID: ", id);
        const DB = await sequelize.transaction();
        
        try {
            await idDTO.validateAsync({ equipos_id: id });

            // Cambiado de _v a __v
            await Equipment.update(
                { __v: 1 },
                { 
                    where: { equipos_id: id },
                    transaction: DB 
                }
            );

            await DB.commit();

        } catch (error) {
            await DB.rollback();
            throw error;
        }
    }
}

module.exports = EquipmentService; // Exporta la clase EquipmentService
