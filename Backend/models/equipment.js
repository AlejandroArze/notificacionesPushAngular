const { Model, DataTypes } = require('sequelize'); // Importa la clase Model y DataTypes de Sequelize.
const sequelize = require('../config/dataBase'); // Importa la instancia de Sequelize conectada a la base de datos.

module.exports = (sequelize, DataTypes) => {
  class Equipment extends Model {
    static associate(models) {
      // Aquí se pueden definir asociaciones entre otros modelos si es necesario.
    }
  }

  // Definimos el modelo Equipment utilizando el método 'init' y especificando los campos de la tabla.
  Equipment.init({
    equipos_id: {
      type: DataTypes.INTEGER, // El tipo de dato es INTEGER.
      primaryKey: true, // Es la clave primaria.
      autoIncrement: true // Se incrementa automáticamente.
    },
    ip: {
      type: DataTypes.TEXT, // El tipo de dato es TEXT.
      allowNull: true // Permitir valores nulos si es necesario.
    },
    procesador: {
      type: DataTypes.TEXT, // El tipo de dato es TEXT.
      allowNull: true
    },
    funcionariousuario: {
      type: DataTypes.TEXT, // El tipo de dato es TEXT.
      allowNull: true
    },
    lector: {
      type: DataTypes.TEXT, // El tipo de dato es TEXT.
      allowNull: true
    },
    tarjetavideo: {
      type: DataTypes.TEXT, // El tipo de dato es TEXT.
      allowNull: true
    },
    funcionarioasignado: {
      type: DataTypes.TEXT, // El tipo de dato es TEXT.
      allowNull: true
    },
    oficina: {
      type: DataTypes.TEXT, // El tipo de dato es TEXT.
      allowNull: true
    },
    fecharegistro: {
      type: DataTypes.TEXT, // El tipo de dato es TEXT.
      allowNull: true
    },
    codigo: {
      type: DataTypes.TEXT, // El tipo de dato es TEXT.
      allowNull: true
    },
    memoria: {
      type: DataTypes.TEXT, // El tipo de dato es TEXT.
      allowNull: true
    },
    tarjetamadre: {
      type: DataTypes.TEXT, // El tipo de dato es TEXT.
      allowNull: true
    },
    antivirus: {
      type: DataTypes.TEXT, // El tipo de dato es TEXT.
      allowNull: true
    },
    garantia: {
      type: DataTypes.TEXT, // El tipo de dato es TEXT.
      allowNull: true
    },
    discoduro: {
      type: DataTypes.TEXT, // El tipo de dato es TEXT.
      allowNull: true
    },
    marca: {
      type: DataTypes.TEXT, // El tipo de dato es TEXT.
      allowNull: true
    },
    tipo: {
      type: DataTypes.INTEGER, // El tipo de dato es INTEGER.
      allowNull: true
    },
    modelo: {
      type: DataTypes.TEXT, // El tipo de dato es TEXT.
      allowNull: true
    },
    serie: {
      type: DataTypes.TEXT, // El tipo de dato es TEXT.
      allowNull: true
    },
    so: {
      type: DataTypes.TEXT, // El tipo de dato es TEXT.
      allowNull: true
    },
    responsable: {
      type: DataTypes.INTEGER, // El tipo de dato es INTEGER.
      allowNull: true
    },
    mac: {
      type: DataTypes.TEXT, // El tipo de dato es TEXT.
      allowNull: true
    },
    __v: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    }
  }, {
    sequelize, // Pasamos la instancia de Sequelize para manejar la conexión con la base de datos.
    modelName: 'Equipment', // Nombre del modelo.
    tableName: 'equipos', // Nombre de la tabla en la base de datos.
    timestamps: false, // No hay timestamps en la tabla.
  });

  return Equipment; // Retorna el modelo Equipment.
};
