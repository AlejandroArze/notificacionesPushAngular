module.exports = (sequelize, DataTypes) => {
  const Notifications = sequelize.define('Notifications', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    sender_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    data: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'sent', 'failed', 'read', 'scheduled'),
      defaultValue: 'pending'
    },
    sent_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    programacion_type: {
      type: DataTypes.ENUM('unica', 'recurrente'),
      allowNull: true
    },
    frecuencia: {
      type: DataTypes.ENUM('diaria', 'semanal', 'mensual'),
      allowNull: true
    },
    dias_envio: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    fecha_envio: {
      type: DataTypes.DATE,
      allowNull: true
    },
    fecha_inicio: {
      type: DataTypes.DATE,
      allowNull: true
    },
    fecha_fin: {
      type: DataTypes.DATE,
      allowNull: true
    },
    hora_envio: {
      type: DataTypes.TIME,
      allowNull: true
    },
    scheduled_status: {
      type: DataTypes.ENUM('activa', 'inactiva', 'completada'),
      allowNull: true
    }
  }, {
    tableName: 'notifications',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['id'] },
      { fields: ['sender_id'] },
      { fields: ['status'] },
      { fields: ['programacion_type'] }
    ]
  });

  return Notifications;
}; 