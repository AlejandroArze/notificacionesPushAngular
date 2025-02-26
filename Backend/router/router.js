const router = require("express").Router();
const user = require("../controller/user");
const type = require("../controller/type");
const equipment = require("../controller/equipment");
const service = require("../controller/service");
const task = require("../controller/task");
const management = require("../controller/management");
const LecturasController = require("../controller/LecturasController");

const multer = require('multer');
const path = require('path');
// Configuración de Multer
/*const upload = multer({
    dest: path.join(__dirname, '../uploads') // Ruta donde se guardarán los archivos
});
*/
// Configuración de Multer para manejar la subida de imágenes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads')); // Carpeta donde se guardarán los archivos
    },
    filename: (req, file, cb) => {
        // Crear un nombre único para el archivo
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '.png'); // Asegurarse de que la extensión sea .png
    }
});

// Filtrar solo archivos PNG
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png') {
        cb(null, true); // Permitir el archivo si es PNG
    } else {
        cb(new Error('Solo se permiten archivos PNG'), false); // Rechazar otros tipos de archivo
    }
};

// Configurar Multer con el almacenamiento y filtro
const upload = multer({ storage, fileFilter });

// Middleware de autenticación
const authMiddleware = require("../middleware/auth");

// Rutas protegidas de usuario (solo admin)
//router.post("/user", authMiddleware([1,2,3]), user.store); // Crear un usuario
router.post("/user", authMiddleware([1,2,3]), upload.single('image'), user.store); // crear usuario
// Ruta para obtener todos los usuarios
router.get("/users", authMiddleware([1,2,3]), user.getAll); // buscar todos lso usuarios 
router.get("/user/:usuarios_id", authMiddleware([1,2,3]), user.show); // Obtener un usuario por ID
router.put("/user/:usuarios_id", authMiddleware([1,2,3]), upload.single('image'), user.update); // Actualizar un usuario por ID
router.delete("/user/:usuarios_id", authMiddleware([1]), user.destroy); // Eliminar un usuario por ID
// Ruta para actualizar solo el estado de un usuario por ID
router.patch("/user/:usuarios_id/status", authMiddleware([1,2,3]), user.updateStatus);

// Nuevas rutas para actualizar rol y estado
router.patch("/user/:usuarios_id/role", authMiddleware([1,2]), user.updateRole);
router.patch("/user/:usuarios_id/status", authMiddleware([1]), user.updateUserStatus);
// Ruta para actualizar contraseña
router.patch("/user/:usuarios_id/password", authMiddleware([1,2,3]), user.updatePassword);

// Login de usuario
router.post("/user/login", user.login);
router.post("/user/loginToken", user.loginToken);
//-----------------------------------------------------------------------------------------------------------
// Rutas relacionadas con "user"
router.get('/user', authMiddleware([1, 2, 3]), user.paginate);

//-----------------------------------------------------------------------------------------------------------
// Rutas relacionadas con "type"

router.post("/type", authMiddleware([1, 2, 3]), type.store);
router.get("/type/:tipos_id", authMiddleware([1, 2, 3]), type.show);
router.put("/type/:tipos_id", authMiddleware([1, 2, 3]), type.update);
router.delete("/type/:tipos_id", authMiddleware([1, 2, 3]), type.destroy);
router.get('/type', authMiddleware([1, 2, 3]), type.paginate);

//-----------------------------------------------------------------------------------------------------------
// Rutas relacionadas con "equipment"

router.post("/equipment", authMiddleware([1, 2, 3]), equipment.store);
router.get("/equipment/:equipos_id", authMiddleware([1, 2, 3]), equipment.show);
router.get('/equipment', authMiddleware([1, 2, 3]), equipment.paginate);
router.put("/equipment/:equipos_id", authMiddleware([1, 2, 3]), equipment.update);
router.delete("/equipment/:equipos_id", authMiddleware([1, 2, 3]), equipment.destroy);

//-----------------------------------------------------------------------------------------------------------
// Rutas relacionadas con "service"


router.get("/service/board", authMiddleware([1, 2, 3]), service.getServicesByTypeAndTechnician);
router.get("/service/date-range", authMiddleware([1, 2, 3]), service.getServicesByDateRange);
router.get("/service/metrics", authMiddleware([1, 2, 3]), service.getMetrics);
router.get('/service', authMiddleware([1, 2, 3]), service.paginate);
router.get("/service/:servicios_id", authMiddleware([1, 2, 3]), service.show);
router.put("/service/:servicios_id", authMiddleware([1, 2, 3]), service.update);
router.delete("/service/:servicios_id", authMiddleware([1, 2, 3]), service.destroy);
router.post("/service", authMiddleware([1, 2, 3]), service.store);

//-----------------------------------------------------------------------------------------------------------
// Rutas relacionadas con "task"


router.post("/task", authMiddleware([1, 2, 3]), task.store);
router.get("/task/:tareas_id", authMiddleware([1, 2, 3]), task.show);
router.put("/task/:tareas_id", authMiddleware([1, 2, 3]), task.update);
router.delete("/task/:tareas_id", authMiddleware([1, 2, 3]), task.destroy);

//-----------------------------------------------------------------------------------------------------------
// Rutas relacionadas con "management"


router.post("/management", authMiddleware([1, 2, 3]), management.store);
router.get("/management/:gestions_id", authMiddleware([1, 2, 3]), management.show);
router.put("/management/:gestions_id", authMiddleware([1, 2, 3]), management.update);
router.delete("/management/:gestions_id", authMiddleware([1, 2, 3]), management.destroy);

//-------------------------------------------------------------------------------------------------------------------------
// Rutas relacionadas con "lecturas"
router.post("/lecturas", authMiddleware([1, 2, 3]), LecturasController.store);
router.get("/lecturas/:id", authMiddleware([1, 2, 3]), LecturasController.show);
router.get("/lecturas", authMiddleware([1, 2, 3]), LecturasController.paginate);
router.put("/lecturas/:id", authMiddleware([1, 2, 3]), LecturasController.update);
router.delete("/lecturas/:id", authMiddleware([1, 2, 3]), LecturasController.destroy);

// Exporta el router para ser utilizado en otras partes de la aplicación
module.exports = router;


/*// Crea un nuevo router para manejar rutas específicas dentro de una aplicación Express
const router = require("express").Router();

// Importa el módulo de controlador de usuario donde están definidos los métodos para manejar solicitudes relacionadas con usuarios
const user = require("../controller/user");



// Define una ruta POST para crear un nuevo usuario. Utiliza el método 'store' del controlador de usuario. 
//router.post("/user", user.store);

// Define una ruta GET para obtener los detalles de un usuario específico por ID. Utiliza el método 'show' del controlador de usuario.
router.get("/user/:usuarios_id", user.show);

// Define una ruta PUT para actualizar un usuario existente por ID. Utiliza el método 'update' del controlador de usuario.
router.put("/user/:usuarios_id", user.update);

// Define una ruta DELETE para eliminar un usuario por ID. Utiliza el método 'destroy' del controlador de usuario.
router.delete("/user/:usuarios_id", user.destroy);

// Ruta para el login de un usuario
router.post("/user/login", user.login);


//-----------------------------------------------------------------------------------------------------------
// Importa el módulo de controlador de usuario donde están definidos los métodos para manejar solicitudes relacionadas con usuarios
const type = require("../controller/type");

// Define una ruta POST para crear un nuevo usuario. Utiliza el método 'store' del controlador de usuario.
router.post("/type", type.store);

// Define una ruta GET para obtener los detalles de un usuario específico por ID. Utiliza el método 'show' del controlador de usuario.
router.get("/type/:tipos_id", type.show);

// Define una ruta PUT para actualizar un usuario existente por ID. Utiliza el método 'update' del controlador de usuario.
router.put("/type/:tipos_id", type.update);

// Define una ruta DELETE para eliminar un usuario por ID. Utiliza el método 'destroy' del controlador de usuario.
router.delete("/type/:tipos_id", type.destroy);



//-----------------------------------------------------------------------------------------------------------
// Importa el módulo de controlador de usuario donde están definidos los métodos para manejar solicitudes relacionadas con usuarios
const equipment = require("../controller/equipment");

// Define una ruta POST para crear un nuevo usuario. Utiliza el método 'store' del controlador de usuario.
router.post("/equipment", equipment.store);

// Define una ruta GET para obtener los detalles de un usuario específico por ID. Utiliza el método 'show' del controlador de usuario.
router.get("/equipment/:equipos_id", equipment.show);


router.get('/equipment', equipment.paginate);
// Define una ruta PUT para actualizar un usuario existente por ID. Utiliza el método 'update' del controlador de usuario.
router.put("/equipment/:equipos_id", equipment.update);

// Define una ruta DELETE para eliminar un usuario por ID. Utiliza el método 'destroy' del controlador de usuario.
router.delete("/equipment/:equipos_id", equipment.destroy);


//-----------------------------------------------------------------------------------------------------------
// Importa el módulo de controlador de usuario donde están definidos los métodos para manejar solicitudes relacionadas con usuarios
const service = require("../controller/service");

// Define una ruta POST para crear un nuevo usuario. Utiliza el método 'store' del controlador de usuario.
router.post("/service", service.store);

// Define una ruta GET para obtener los detalles de un usuario específico por ID. Utiliza el método 'show' del controlador de usuario.
router.get("/service/:servicios_id", service.show);

// Define una ruta PUT para actualizar un usuario existente por ID. Utiliza el método 'update' del controlador de usuario.
router.put("/service/:servicios_id", service.update);

// Define una ruta DELETE para eliminar un usuario por ID. Utiliza el método 'destroy' del controlador de usuario.
router.delete("/service/:servicios_id", service.destroy);


//-----------------------------------------------------------------------------------------------------------
// Importa el módulo de controlador de usuario donde están definidos los métodos para manejar solicitudes relacionadas con usuarios
const task = require("../controller/task");

// Define una ruta POST para crear un nuevo usuario. Utiliza el método 'store' del controlador de usuario.
router.post("/task", task.store);

// Define una ruta GET para obtener los detalles de un usuario específico por ID. Utiliza el método 'show' del controlador de usuario.
router.get("/task/:tareas_id", task.show);

// Define una ruta PUT para actualizar un usuario existente por ID. Utiliza el método 'update' del controlador de usuario.
router.put("/task/:tareas_id", task.update);

// Define una ruta DELETE para eliminar un usuario por ID. Utiliza el método 'destroy' del controlador de usuario.
router.delete("/task/:tareas_id", task.destroy);



//-----------------------------------------------------------------------------------------------------------
// Importa el módulo de controlador de usuario donde están definidos los métodos para manejar solicitudes relacionadas con usuarios
const management = require("../controller/management");

// Define una ruta POST para crear un nuevo usuario. Utiliza el método 'store' del controlador de usuario.
router.post("/management", management.store);

// Define una ruta GET para obtener los detalles de un usuario específico por ID. Utiliza el método 'show' del controlador de usuario.
router.get("/management/:gestions_id", management.show);

// Define una ruta PUT para actualizar un usuario existente por ID. Utiliza el método 'update' del controlador de usuario.
router.put("/management/:gestions_id", management.update);

// Define una ruta DELETE para eliminar un usuario por ID. Utiliza el método 'destroy' del controlador de usuario.
router.delete("/management/:gestions_id", management.destroy);


// Exporta el router para ser utilizado en otras partes de la aplicación, típicamente en el archivo principal del servidor.
module.exports = router;
*/