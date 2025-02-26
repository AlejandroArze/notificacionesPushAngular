const { Model } = require('sequelize'); // Importa la clase Model de Sequelize.
const sequelize = require('../config/dataBase'); // Importa la instancia de Sequelize conectada a la base de datos.

module.exports = (sequelize, DataTypes) => {
  class Type extends Model {
    static associate(models) {
      // Aquí se pueden definir asociaciones entre otros modelos si es necesario.
    }
  }

  // Definimos el modelo Type utilizando el método 'init' y especificando los campos de la tabla.
  Type.init({
    // Campo 'tipos_id' que corresponde a la clave primaria en la tabla 'tipos'.
    tipos_id: {
      type: DataTypes.INTEGER, // El tipo de dato es INTEGER.
      primaryKey: true, // Es la clave primaria.
      autoIncrement: true // Se incrementa automáticamente.
    },
    // Campo 'descripcion' que corresponde a la descripción en la tabla 'tipos'.
    descripcion: {
      type: DataTypes.TEXT, // El tipo de dato es TEXT.
      allowNull: false, // No permite valores nulos.
      validate: {
        notEmpty: true, // No permite cadenas vacías.
        notNull: true // Valida que el valor no sea nulo.
      }
    },
    // Campo 'formulario' que corresponde al formulario en la tabla 'tipos'.
    formulario: {
      type: DataTypes.TEXT, // El tipo de dato es TEXT.
      allowNull: false, // No permite valores nulos.
      validate: {
        notEmpty: true, // No permite cadenas vacías.
        notNull: true // Valida que el valor no sea nulo.
      }
    },
    // Campo 'estado' que podría representar el estado en la tabla 'tipos'.
    estado: {
      type: DataTypes.INTEGER, // El tipo de dato es INTEGER.
      allowNull: false, // No permite valores nulos.
      validate: {
        notEmpty: true, // No permite valores vacíos.
        notNull: true // Valida que el valor no sea nulo.
      }
    }
  }, {
    sequelize, // Pasamos la instancia de Sequelize para manejar la conexión con la base de datos.
    modelName: 'Type', // Nombre del modelo.
    tableName: 'tipos', // Nombre de la tabla en la base de datos.
    timestamps: false, // No hay timestamps en la tabla.
  });

  return Type; // Retorna el modelo Type.
};
