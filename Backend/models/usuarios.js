const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Usuarios = sequelize.define('Usuarios', {
    usuarios_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: true,
      unique: true
    },
    usuario: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    nombres: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    role: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    apellidos: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    _v: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: '_v'
    }
  }, {
    tableName: 'usuarios',
    timestamps: true,
    underscored: true,
    scopes: {
      withoutSpecialColumns: {
        attributes: { 
          exclude: ['__v'] 
        }
      }
    }
  });

  return Usuarios;
}; 