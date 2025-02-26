const { Model } = require('sequelize'); // Importa la clase Model de Sequelize.
const sequelize = require('../config/dataBase'); // Importa la instancia de Sequelize conectada a la base de datos.

module.exports = (sequelize, DataTypes) => {
  class Task extends Model {
    static associate(models) {
      // Aquí se pueden definir asociaciones entre otros modelos si es necesario.
      // Por ejemplo, relación con la tabla 'servicios'.
      Task.belongsTo(models.Service, { foreignKey: 'servicio', as: 'servicioRelacionado' });
    }
  }

  // Definimos el modelo Task utilizando el método 'init' y especificando los campos de la tabla.
  Task.init({
    // Campo 'tareas_id' que corresponde a la clave primaria en la tabla 'tareas'.
    tareas_id: {
      type: DataTypes.INTEGER, // El tipo de dato es INTEGER.
      primaryKey: true, // Es la clave primaria.
      autoIncrement: true // Se incrementa automáticamente.
    },
    // Campo 'descripcion' que corresponde a la descripción en la tabla 'tareas'.
    descripcion: {
      type: DataTypes.TEXT, // El tipo de dato es TEXT.
      allowNull: false, // No permite valores nulos.
      validate: {
        notEmpty: true, // No permite cadenas vacías.
        notNull: true // Valida que el valor no sea nulo.
      }
    },
    // Campo 'servicio' que es una clave foránea que hace referencia a la tabla 'servicios'.
    servicio: {
      type: DataTypes.INTEGER, // El tipo de dato es INTEGER.
      allowNull: false, // No permite valores nulos.
      references: {
        model: 'servicios', // Nombre de la tabla referenciada
        key: 'servicios_id' // Clave primaria de la tabla referenciada
      },
      validate: {
        notNull: true // Valida que el valor no sea nulo.
      }
    },
    // Campo 'fecha' que corresponde a la fecha en la tabla 'tareas'.
    fecha: {
      type: DataTypes.TEXT, // El tipo de dato es TEXT.
      allowNull: false, // No permite valores nulos.
      validate: {
        notEmpty: true, // No permite cadenas vacías.
        notNull: true // Valida que el valor no sea nulo.
      }
    }
  }, {
    sequelize, // Pasamos la instancia de Sequelize para manejar la conexión con la base de datos.
    modelName: 'Task', // Nombre del modelo.
    tableName: 'tareas', // Nombre de la tabla en la base de datos.
    timestamps: false, // No hay timestamps en la tabla.
  });

  return Task; // Retorna el modelo Task.
};
