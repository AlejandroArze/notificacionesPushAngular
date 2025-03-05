const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const UsuariosApp = sequelize.define('UsuariosApp', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    tipodocumento_id: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    nro_documento: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    fecha_caducidad_ci: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    expedido_id: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    nombres: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    paterno: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    materno: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    tercer_apellido: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    avatar: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ci_anverso: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ci_reverso: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fecha_nacimiento: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    genero: {
      type: DataTypes.ENUM('masculino', 'femenino', 'otro'),
      allowNull: true
    },
    estado_civil: {
      type: DataTypes.ENUM('soltero', 'casado', 'divorciado', 'viudo', 'otro'),
      allowNull: true
    },
    celular: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    municipio: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    latitud: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true
    },
    longitud: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true
    },
    subalcaldia: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    distrito: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    subdistrito: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    zona: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    tipo_lugar: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    domicilio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    referencia_adicional: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    nro_puerta: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    estado: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    tokens_notificaciones: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    id_google: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    tableName: 'usuariosApp',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['id'] },
      { fields: ['user_id'] },
      { fields: ['nro_documento'] }
    ]
  });

  return UsuariosApp;
}; 