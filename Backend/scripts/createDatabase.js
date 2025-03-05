const { Sequelize } = require('sequelize');
require('dotenv').config();

async function createDatabase() {
  try {
    // Conexión sin especificar la base de datos
    const sequelize = new Sequelize({
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      dialect: 'postgres'
    });

    // Crear la base de datos
    await sequelize.query(`CREATE DATABASE "${process.env.DATABASE_NAME}"`);
    console.log(`Base de datos ${process.env.DATABASE_NAME} creada exitosamente`);
  } catch (error) {
    if (error.name === 'SequelizeDatabaseError' && error.parent.code === '42P04') {
      console.log(`La base de datos ${process.env.DATABASE_NAME} ya existe`);
    } else {
      console.error('Error al crear la base de datos:', error);
    }
  }
}

createDatabase(); 