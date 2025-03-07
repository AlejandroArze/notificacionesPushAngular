'use strict'; // Usa el modo estricto para evitar errores comunes de JavaScript y mejorar la seguridad del código.

const fs = require('fs'); // Importa el módulo 'fs' para trabajar con el sistema de archivos.
const path = require('path'); // Importa el módulo 'path' para trabajar con rutas de archivos y directorios.
const { Sequelize } = require('sequelize'); // Importa Sequelize, un ORM para interactuar con bases de datos.
const basename = path.basename(__filename); // Obtiene el nombre base del archivo actual.
const env = process.env.NODE_ENV || 'development'; // Obtiene el entorno de ejecución (por ejemplo, 'development', 'production'), por defecto es 'development'.
const config = require(__dirname + '/../config/config.js')[env]; // Carga la configuración de la base de datos correspondiente al entorno.

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

const db = {
  sequelize,
  Sequelize
};

// Carga manual de modelos con inyección de Sequelize
const modelFiles = [
  'usuarios',
  'usuariosApp', 
  'notifications', 
  'notification_recipients'
];

modelFiles.forEach(modelName => {
  const modelModule = require(path.join(__dirname, `${modelName}.js`));
  const model = modelModule(sequelize, Sequelize.DataTypes);
  db[model.name] = model;
});

// Asegúrate de que Usuarios esté disponible
console.log('Modelos cargados:', Object.keys(db));
console.log('Usuarios model:', db.Usuarios);

// Definir asociaciones
function setupAssociations() {
    // Asociación entre Usuarios y UsuariosApp
    db.Usuarios.hasOne(db.UsuariosApp, {
        foreignKey: 'user_id', // Asegúrate de que este nombre de columna coincida con tu modelo
        as: 'usuarioApp'
    });

    db.UsuariosApp.belongsTo(db.Usuarios, {
        foreignKey: 'user_id',
        as: 'usuario'
    });

    // Otras asociaciones si las tienes...
}

setupAssociations();

module.exports = db;
