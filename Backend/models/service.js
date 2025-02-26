const { Model } = require('sequelize'); // Importa la clase Model de Sequelize.
const sequelize = require('../config/dataBase'); // Importa la instancia de Sequelize conectada a la base de datos.

module.exports = (sequelize, DataTypes) => {
  class Service extends Model {
    static associate(models) {
      // Define la asociación con User
      Service.belongsTo(models.User, {
        foreignKey: 'tecnicoAsignado',
        as: 'tecnico'
      });
    }
  }

  // Definimos el modelo Service utilizando el método 'init' y especificando los campos de la tabla.
  Service.init({
    // Campo 'servicios_id' que corresponde a la clave primaria en la tabla 'servicios'.
    servicios_id: {
      type: DataTypes.INTEGER, // El tipo de dato es INTEGER.
      primaryKey: true, // Es la clave primaria.
      autoIncrement: true // Se incrementa automáticamente.
    },
    // Campo 'nombreResponsableEgreso' que corresponde al responsable de egreso en la tabla 'servicios'.
    nombreResponsableEgreso: {
      type: DataTypes.TEXT, // El tipo de dato es TEXT.
      allowNull: false, // No permite valores nulos.
    },
    // Campo 'cargoSolicitante'.
    cargoSolicitante: {
      type: DataTypes.TEXT, 
      allowNull: true,  // Permitir nulo
    },
    // Campo 'informe'.
    informe: {
      type: DataTypes.TEXT, 
      allowNull: false, 
    },
    // Campo 'cargoResponsableEgreso'.
    cargoResponsableEgreso: {
      type: DataTypes.TEXT, 
      allowNull: false, 
    },
    // Campo 'oficinaSolicitante'.
    oficinaSolicitante: {
      type: DataTypes.TEXT, 
      allowNull: true,  // Permitir nulo
    },
    // Campo 'fechaRegistro'.
    fechaRegistro: {
      type: DataTypes.TEXT, 
      allowNull: false, 
    },
    // Campo 'equipo' que corresponde a una referencia a 'equipos.equipos_id'.
    equipo: {
      type: DataTypes.BIGINT, 
      references: {
        model: 'equipos',
        key: 'equipos_id'
      },
      allowNull: true,  // Permitir nulo
    },
    // Campo 'problema'.
    problema: {
      type: DataTypes.TEXT, 
      allowNull: false, 
    },
    // Campo 'telefonoResponsableEgreso'.
    telefonoResponsableEgreso: {
      type: DataTypes.TEXT, 
      allowNull: false, 
    },
    // Campo 'gestion' que corresponde a una referencia a 'gestions.gestions_id'.
    gestion: {
      type: DataTypes.INTEGER, 
      references: {
        model: 'gestions',
        key: 'gestions_id'
      },
      allowNull: false, 
    },
    // Campo 'telefonoSolicitante'.
    telefonoSolicitante: {
      type: DataTypes.TEXT, 
      allowNull: true,  // Permitir nulo
    },
    // Campo 'tecnicoAsignado'.
    tecnicoAsignado: {
      type: DataTypes.INTEGER, 
      allowNull: true,  // Cambiar a true para permitir valores nulos
    },
    // Campo 'observaciones'.
    observaciones: {
      type: DataTypes.TEXT, 
      allowNull: true, // Puede ser nulo.
    },
    // Campo 'tipoResponsableEgreso'.
    tipoResponsableEgreso: {
      type: DataTypes.TEXT, 
      allowNull: false, 
    },
    // Campo 'estado'.
    estado: {
      type: DataTypes.TEXT, 
      allowNull: false, 
    },
    // Campo 'tipoSolicitante'.
    tipoSolicitante: {
      type: DataTypes.TEXT, 
      allowNull: true,  // Permitir nulo
    },
    // Campo 'fechaTerminado'.
    fechaTerminado: {
      type: DataTypes.TEXT, 
      allowNull: true, // Puede ser nulo.
    },
    // Campo 'oficinaResponsableEgreso'.
    oficinaResponsableEgreso: {
      type: DataTypes.TEXT, 
      allowNull: false, 
    },
    // Campo 'numero'.
    numero: {
      type: DataTypes.INTEGER, 
      allowNull: false, 
    },
    // Campo 'fechaInicio'.
    fechaInicio: {
      type: DataTypes.TEXT, 
      allowNull: false, 
    },
    // Campo 'fechaEgreso'.
    fechaEgreso: {
      type: DataTypes.TEXT, 
      allowNull: true, // Puede ser nulo.
    },
    // Campo 'ciSolicitante'.
    ciSolicitante: {
      type: DataTypes.TEXT, 
      allowNull: true,  // Permitir nulo
    },
    // Campo 'nombreSolicitante'.
    nombreSolicitante: {
      type: DataTypes.TEXT, 
      allowNull: true,  // Permitir nulo
    },
    // Campo 'tipo'.
    tipo: {
      type: DataTypes.TEXT, 
      allowNull: false, 
    },
    // Campo 'tecnicoRegistro'.
    tecnicoRegistro: {
      type: DataTypes.INTEGER, 
      allowNull: false, 
    },
    // Campo 'tecnicoEgreso'.
    tecnicoEgreso: {
      type: DataTypes.TEXT, 
      allowNull: true, // Puede ser nulo.
    },
    // Campo 'ciResponsableEgreso'.
    ciResponsableEgreso: {
      type: DataTypes.TEXT, 
      allowNull: false, 
    },
    // Agregar el nuevo campo __v
    __v: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0 // 0 = activo, 1 = eliminado
    }
  }, {
    sequelize, // Pasamos la instancia de Sequelize para manejar la conexión con la base de datos.
    modelName: 'Service', // Nombre del modelo.
    tableName: 'servicios', // Nombre de la tabla en la base de datos.
    timestamps: false, // No hay timestamps en la tabla.
  });

  return Service; // Retorna el modelo Service.
};
