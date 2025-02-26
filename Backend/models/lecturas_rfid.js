const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/dataBase");

module.exports = (sequelize, DataTypes) => {
  class LecturasRFID extends Model {}

  LecturasRFID.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      codigo: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      fecha_hora: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      oficina: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      accion: {
        type: DataTypes.STRING(10),
        
      },
    },
    {
      sequelize,
      modelName: "LecturasRFID",
      tableName: "lecturas_rfid",
      timestamps: false,
    }
  );

  return LecturasRFID;
};
