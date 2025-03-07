// Carga las variables de entorno desde el archivo .env (si existe)
require('dotenv').config();
const axios = require('axios');
const { sequelize } = require('./models'); // O el archivo donde configuras la conexión
const cors = require('cors');
const express = require('express');
const morgan = require("morgan"); // Middleware para registrar solicitudes HTTP
const router = require('./router/router'); // Importa el enrutador con las rutas de la API
const path = require("path");
const multer = require('multer');
const upload = multer();
const qs = require('qs'); // Para serializar los datos
const cron = require('node-cron');
const { UsuariosApp, Usuarios } = require('./models'); // Importar ambos modelos
const notificationRoutes = require('./router/notificationRoutes');
// Crea una instancia de la aplicación Express
const app = express();
const request = require('request');
// Middleware
app.use(morgan("dev")); // Log de cada solicitud HTTP
app.use(express.json()); // Analizar el cuerpo de las solicitudes JSON
app.use(cors()); // Configuración CORS, puedes personalizarlo según los orígenes permitidos
app.use(express.urlencoded({ extended: true })); // Si necesitas leer datos del body en POST
app.use("/api/v1/uploads", express.static(path.join(__dirname, "uploads")));

// Antes de definir las rutas, agrega logging detallado
app.use(morgan('combined')); // Logging de solicitudes HTTP
app.use(express.json()); // Importante para parsear JSON
app.use(express.urlencoded({ extended: true })); // Para parsear datos de formularios

// Obtén el puerto de la variable de entorno o usa 3001 por defecto
const port = process.env.APP_PORT || 3001;

// Ruta raíz para verificar que el servidor esté funcionando
app.get("/", (req, res) => {
    res.send("This is Express");
});

// Usa el enrutador para todas las rutas que comienzan con '/api/v1'
app.use("/api/v1", router);

app.get('/api/bienes', async (req, res) => {
    try {
      const codigo = req.query.codigo; // Obtener el código de los parámetros de la consulta
  console.log("Codigo",codigo);
      // Realizar la solicitud POST al servidor externo
    const response = await axios.post('https://appgamc.cochabamba.bo/transparencia/servicio/ws-consulta-bienes.php', {
        cod_bienes: codigo  // Enviar el código de bienes en el cuerpo de la solicitud
      });
      console.log("data",response);
      // Devolver la respuesta a tu frontend
      res.json(response.data);
    } catch (error) {
      console.error('Error al obtener los bienes:', error);
      res.status(500).json({ error: 'Error al consultar los bienes' });
    }
  });

  app.post('/api/proxy', async (req, res) => {
    try {
      const data = qs.stringify(req.body); // Convierte a x-www-form-urlencoded
  
      const response = await axios.post(
        'https://appgamc.cochabamba.bo/transparencia/servicio/ws-consulta-bienes.php',
        data,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
  
      res.send(response.data);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  app.post('/api/empleados', async (req, res) => {
    try {
      const data = qs.stringify(req.body); // Convierte a x-www-form-urlencoded
  
      const response = await axios.post(
        'https://appgamc.cochabamba.bo/transparencia/servicio/buscar-empleados.php',
        data,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
  
      res.send(response.data);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  app.post('/api/v1/proxy/buscar-empleados-ci', upload.none(), async (req, res) => {
    try {
        console.log('Datos recibidos en el backend:', req.body); // Debug
        
        if (!req.body.dato) {
            return res.status(400).json({
                status: false,
                data: "No ingresaste datos"
            });
        }

        const data = qs.stringify({
            dato: req.body.dato,
            tipo: 'D'
        });

        console.log('Datos a enviar a la API externa:', data); // Debug

        const response = await axios.post(
            'https://appgamc.cochabamba.bo/transparencia/servicio/busqueda_empleados.php',
            data,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        console.log('Respuesta de la API externa:', response.data); // Debug

        res.json(response.data);
    } catch (error) {
        console.error('Error en proxy buscar-empleados-ci:', error);
        res.status(500).json({ 
            error: 'Error al buscar empleados por CI',
            details: error.message 
        });
    }
  });
  

// Función para sincronizar usuarios
async function sincronizarUsuarios() {
    try {
        console.log('🔄 Iniciando sincronización de usuarios...');

        const response = await axios.post('https://multiservdev.cochabamba.bo/api/v1/innova/getNotifications', {
            token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiYjFlY2ZkMzMzODM4NWZiMjc3NmE5Nzc1MmQ0NzkzZWY1MmNhZTU3NmMxNzIyNjI3NmIwOTg5NzQ2MDAwYWE0MDdmZGUzNjFlYThjMTZkYTMiLCJpYXQiOjE3NDA1ODIyNDguMTI5Mjc4LCJuYmYiOjE3NDA1ODIyNDguMTI5MjgsImV4cCI6MTc3MjExODI0OC4wNDQ5NTIsInN1YiI6IjEiLCJzY29wZXMiOltdfQ.LOEqQ48iw82mGk61kN4KbJCXG48XlwasAJlMwWGQBM3OnQsGz9jzFTTHl_i_Jo8DKu-j4aUSnEY8yap_12iCmIjj24rGsEk75FiWvLSRFO0gg_UzzHcj1dskaY0jf4TNyw67MT7LX72Rze_T19oh2qtNQNNq4srTBBhyJRpc_6yMY6pWo3-TVziF99Azir7UZgtG9EXH_6wmVabmEZ3vJdRoaT6UTE3-T3Smfo_YkMfw5FG2KZ1zDarxEYpCTCZDPRxMyx5cAsy6VDZiePSIv5-kdmWUOyms0Vv82uUsfjEOSz_gvBexPmnvhwqF5tdGyw_HIrgXPyPTHn0OHI-Q0wjJniB36gRRgz1SP0PEVSGF9DdiHVpSlLnBaVbGWZLqcGjVkoW3yxoSkf7kR0r42EgTwqM1PlOCFtksjj9-IZWCJJY-HmavdcmiLoWk0n0V-7YIPi_mv8I4bbLkwxU0MlQlkeTLUQjaE3Yeso67NvA8P-HGAYtSPX5ODr1JbOoBc6u_BiN8UdHSQV-wBen1Tvw_9cFF0KQyl64BzXGnYHYc0f0Q1fguq_Pn4IH-IXax61ZzWEL-cW80PwSoh7q4ux91cXe-E3eD-ckvqYProa-e-hrO8Z21UZ2kUxSZv59aI9UH_zAHyZyK0k8IgK7p3US7oZ80Kek84T3-86-C_1I"
        });

        const usuarios = response.data.data;

        const mapeoGenero = {
            'MASCULINO': 'masculino',
            'FEMENINO': 'femenino',
            'NINGUNO': 'masculino',
            'masculino': 'masculino',
            'femenino': 'femenino'
        };

        const mapeoEstadoCivil = {
            'SOLTERO(A)': 'soltero',
            'CASADO(A)': 'casado',
            'DIVORCIADO(A)': 'divorciado',
            'NINGUNO': 'soltero',
            'soltero': 'soltero',
            'casado': 'casado',
            'divorciado': 'divorciado'
        };

        for (const usuario of usuarios) {
            console.log('Procesando usuario:', {
                id: usuario.id,
                nro_documento: usuario.nro_documento,
                genero_original: usuario.genero,
                estado_civil_original: usuario.estado_civil
            });

            const generoNormalizado = mapeoGenero[usuario.genero] || 'masculino';
            const estadoCivilNormalizado = mapeoEstadoCivil[usuario.estado_civil] || 'soltero';

            try {
                // Función para parsear tokens de notificación de manera segura
                const parseTokens = (tokens) => {
                    try {
                        // Si ya es un array, devolverlo
                        if (Array.isArray(tokens)) return tokens;
                        
                        // Intentar parsear como JSON
                        const parsedTokens = JSON.parse(tokens || '[]');
                        return Array.isArray(parsedTokens) ? parsedTokens : [];
                    } catch (error) {
                        // Si falla, devolver un array vacío
                        console.warn(`Error parseando tokens para ${usuario.nro_documento}:`, error.message);
                        return [];
                    }
                };

                // Preparar datos para comparación y actualización
                const datosActualizacion = {
                    ...usuario,
                    genero: generoNormalizado,
                    estado_civil: estadoCivilNormalizado,
                    tokens_notificaciones: parseTokens(usuario.tokens_notificaciones)
                };

                // Buscar el usuario existente por ID
                const usuarioExistente = await UsuariosApp.findOne({
                    where: { id: usuario.id }
                });

                // Función para comparar si hay cambios
                const hayCambios = (existente, nuevo) => {
                    const cambios = {};
                    let hayModificaciones = false;

                    // Lista de campos a comparar (todos los campos relevantes)
                    const camposAComparar = [
                        'nombres', 'paterno', 'materno', 'tercer_apellido', 
                        'avatar', 'ci_anverso', 'ci_reverso', 'fecha_nacimiento', 
                        'genero', 'estado_civil', 'celular', 'telefono', 
                        'municipio', 'latitud', 'longitud', 'subalcaldia', 
                        'distrito', 'subdistrito', 'zona', 'tipo_lugar', 
                        'domicilio', 'referencia_adicional', 'nro_puerta', 
                        'estado', 'tokens_notificaciones', 'tipodocumento_id', 
                        'fecha_caducidad_ci', 'expedido_id', 'id_google', 
                        'nro_documento', 'user_id'
                    ];

                    camposAComparar.forEach(campo => {
                        // Comparación especial para tokens_notificaciones
                        if (campo === 'tokens_notificaciones') {
                            const tokensExistentes = parseTokens(existente.tokens_notificaciones);
                            const tokensNuevos = nuevo.tokens_notificaciones;
                            const sonIguales = JSON.stringify(tokensExistentes) === JSON.stringify(tokensNuevos);
                            
                            if (!sonIguales) {
                                cambios[campo] = {
                                    anterior: tokensExistentes,
                                    nuevo: tokensNuevos
                                };
                                hayModificaciones = true;
                            }
                        } 
                        // Comparación para otros campos
                        else if (existente[campo] !== nuevo[campo]) {
                            cambios[campo] = {
                                anterior: existente[campo],
                                nuevo: nuevo[campo]
                            };
                            hayModificaciones = true;
                        }
                    });

                    return {
                        hayModificaciones,
                        cambios
                    };
                };

                if (usuarioExistente) {
                    // Verificar si hay cambios
                    const { hayModificaciones, cambios } = hayCambios(usuarioExistente, datosActualizacion);
                    
                    if (hayModificaciones) {
                        await usuarioExistente.update(datosActualizacion);
                        console.log(`🔄 UsuariosApp ${usuario.nro_documento} actualizado`, {
                            id: usuarioExistente.id,
                            cambios: cambios
                        });
                    } else {
                        console.log(`✅ UsuariosApp ${usuario.nro_documento} sin cambios`);
                    }
                } else {
                    // Crear nuevo usuario si no existe
                    try {
                        const nuevoUsuario = await UsuariosApp.create(datosActualizacion);
                        console.log(`➕ UsuariosApp ${usuario.nro_documento} creado`, {
                            id: nuevoUsuario.id
                        });
                    } catch (createError) {
                        console.error(`❌ Error al crear usuario ${usuario.nro_documento}:`, {
                            error: createError.message,
                            datos: datosActualizacion
                        });
                    }
                }

            } catch (innerError) {
                console.error('Error al sincronizar usuario en UsuariosApp:', {
                    id: usuario.id,
                    nro_documento: usuario.nro_documento,
                    error: innerError.message,
                    stack: innerError.stack,
                    datosUsuario: usuario
                });
            }
        }

        console.log('✅ Sincronización de usuarios completada');
    } catch (error) {
        console.error('❌ Error en sincronización de usuarios:', error);
    }
}

// Agregar ruta para solicitar sincronización manual
app.post('/api/v1/sync-usuarios', async (req, res) => {
    try {
        await sincronizarUsuarios();
        res.json({ 
            status: 'success', 
            message: 'Sincronización de usuarios iniciada' 
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error', 
            message: 'Error en sincronización de usuarios' 
        });
    }
});

// Programar sincronización cada 10 minutos
cron.schedule('*/10 * * * *', () => {
    sincronizarUsuarios();
});

// Función para probar la conexión
async function testDatabaseConnection() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida correctamente.');
        
        // Verificar si podemos hacer consultas
        const result = await sequelize.query('SELECT NOW()');
        console.log('⏰ Hora del servidor de base de datos:', result[0][0].now);
        
        // Verificar tablas existentes
        const tables = await sequelize.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('📋 Tablas encontradas:', tables[0].map(t => t.table_name));
        
        return true;
    } catch (error) {
        console.error('❌ Error al conectar con la base de datos:', error.message);
        console.error('Detalles del error:', {
            host: process.env.DATABASE_HOST,
            port: process.env.DATABASE_PORT,
            database: process.env.DATABASE_NAME,
            user: process.env.DATABASE_USERNAME
        });
        return false;
    }
}

// Ejecutar sincronización al iniciar el servidor
async function iniciarSincronizacionInicial() {
    try {
        console.log('🚀 Iniciando sincronización inicial de usuarios...');
        await sincronizarUsuarios();
        console.log('✅ Sincronización inicial completada');
    } catch (error) {
        console.error('❌ Error en sincronización inicial:', error);
    }
}

// Modificar la parte de inicio del servidor
async function iniciarServidor() {
    try {
        // Probar conexión a la base de datos
        const conexionExitosa = await testDatabaseConnection();
        
        if (conexionExitosa) {
            // Sincronización inicial
            await iniciarSincronizacionInicial();

            // Programar sincronización cada 10 minutos
            cron.schedule('*/10 * * * *', () => {
                console.log('⏰ Iniciando sincronización programada de usuarios...');
                sincronizarUsuarios();
            });

            // Iniciar servidor
            app.listen(port,'0.0.0.0', () => {
                console.log(`🌐 Servidor corriendo en puerto ${port}`);
            });
        } else {
            console.error('❌ No se pudo iniciar el servidor debido a problemas de conexión');
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
}

// Llamar a la función para iniciar el servidor
iniciarServidor();

// Después de otras rutas, agrega:
app.use('/api/notifications', notificationRoutes);

// Agrega un middleware de error global para capturar rutas no encontradas
app.use((req, res, next) => {
    console.error(`🚨 Ruta no encontrada: ${req.method} ${req.originalUrl}`);
    console.error('Headers recibidos:', req.headers);
    console.error('Cuerpo de la solicitud:', req.body);
    
    res.status(404).json({
        success: false,
        error: {
            message: 'Ruta no encontrada',
            path: req.originalUrl,
            method: req.method
        }
    });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error('Error del servidor:', err);
    res.status(500).json({
        success: false,
        error: {
            message: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        }
    });
});

// Exporta la aplicación para que otros archivos puedan usarla
module.exports = app;
