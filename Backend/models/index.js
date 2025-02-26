'use strict'; // Usa el modo estricto para evitar errores comunes de JavaScript y mejorar la seguridad del código.

const fs = require('fs'); // Importa el módulo 'fs' para trabajar con el sistema de archivos.
const path = require('path'); // Importa el módulo 'path' para trabajar con rutas de archivos y directorios.
const Sequelize = require('sequelize'); // Importa Sequelize, un ORM para interactuar con bases de datos.
const basename = path.basename(__filename); // Obtiene el nombre base del archivo actual.
const env = process.env.NODE_ENV || 'development'; // Obtiene el entorno de ejecución (por ejemplo, 'development', 'production'), por defecto es 'development'.
const config = require(__dirname + '/../config/config.js')[env]; // Carga la configuración de la base de datos correspondiente al entorno.
const db = {}; // Crea un objeto vacío que contendrá los modelos de la base de datos.

let sequelize; // Declara la variable sequelize para usarla más adelante.
if (config.use_env_variable) {
  // Si en la configuración existe una variable de entorno para la base de datos:
  sequelize = new Sequelize(process.env[config.use_env_variable], config); 
  // Inicializa Sequelize utilizando la variable de entorno (por ejemplo, una URL de base de datos).
} else {
  // Si no hay variable de entorno, usa los parámetros de la configuración.
  sequelize = new Sequelize(config.database, config.username, config.password, config); 
  // Inicializa Sequelize con la configuración de la base de datos, nombre de usuario y contraseña.
}

fs
  .readdirSync(__dirname) // Lee el contenido del directorio actual (donde están los modelos).
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'); 
    // Filtra los archivos para que solo se incluyan los archivos JavaScript que no empiezan con '.' y que no sean el archivo actual.
  })
  .forEach(file => {
    // Para cada archivo de modelo:
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes); 
    // Importa el archivo del modelo y lo inicializa con la instancia de Sequelize.
    db[model.name] = model; // Añade el modelo al objeto 'db' usando el nombre del modelo como clave.
  });

Object.keys(db).forEach(modelName => {
  // Recorre las claves del objeto 'db' (que son los nombres de los modelos):
  if (db[modelName].associate) {
    // Si el modelo tiene una función 'associate' (para definir asociaciones entre modelos):
    db[modelName].associate(db); // Llama a esa función para asociar los modelos.
  }
});

db.sequelize = sequelize; // Añade la instancia de Sequelize al objeto 'db'.
db.Sequelize = Sequelize; // Añade el constructor de Sequelize al objeto 'db'.

module.exports = db; // Exporta el objeto 'db' que ahora contiene todos los modelos y la instancia de Sequelize.
