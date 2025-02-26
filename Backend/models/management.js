const { Model } = require('sequelize'); // Importa la clase Model de Sequelize.
const sequelize = require('../config/dataBase'); // Importa la instancia de Sequelize conectada a la base de datos.

module.exports = (sequelize, DataTypes) => {
  class Management extends Model {
    static associate(models) {
      // Aquí se pueden definir asociaciones entre otros modelos si es necesario.
      // Por ejemplo, relación con la tabla 'servicios' si fuera necesario en el futuro.
    }
  }

  // Definimos el modelo Management utilizando el método 'init' y especificando los campos de la tabla.
  Management.init({
    // Campo 'gestions_id' que corresponde a la clave primaria en la tabla 'gestions'.
    gestions_id: {
      type: DataTypes.INTEGER, // El tipo de dato es INTEGER.
      primaryKey: true, // Es la clave primaria.
      autoIncrement: true // Se incrementa automáticamente.
    },
    // Campo 'descripcion' que corresponde a la descripción en la tabla 'gestions'.
    descripcion: {
      type: DataTypes.TEXT, // El tipo de dato es TEXT.
      allowNull: false, // No permite valores nulos.
      validate: {
        notEmpty: true, // No permite cadenas vacías.
        notNull: true // Valida que el valor no sea nulo.
      }
    },
    // Campo 'numero' que corresponde al número en la tabla 'gestions'.
    numero: {
      type: DataTypes.INTEGER, // El tipo de dato es INTEGER.
      allowNull: false, // No permite valores nulos.
      validate: {
        notNull: true, // Valida que el valor no sea nulo.
        isInt: true // Valida que sea un número entero.
      }
    },
    // Campo 'anio' que corresponde al año en la tabla 'gestions'.
    anio: {
      type: DataTypes.TEXT, // El tipo de dato es TEXT.
      allowNull: false, // No permite valores nulos.
      validate: {
        notEmpty: true, // No permite cadenas vacías.
        notNull: true, // Valida que el valor no sea nulo.
        len: [4, 4] // Valida que el campo tenga exactamente 4 caracteres (año).
      }
    },
    // Campo 'estado' que corresponde al estado en la tabla 'gestions'.
    estado: {
      type: DataTypes.INTEGER, // El tipo de dato es INTEGER.
      allowNull: false, // No permite valores nulos.
      validate: {
        notNull: true, // Valida que el valor no sea nulo.
        isInt: true // Valida que sea un número entero.
      }
    }
  }, {
    sequelize, // Pasamos la instancia de Sequelize para manejar la conexión con la base de datos.
    modelName: 'Management', // Nombre del modelo.
    tableName: 'gestions', // Nombre de la tabla en la base de datos.
    timestamps: false, // No hay timestamps en la tabla.
  });

  return Management; // Retorna el modelo Management.
};
