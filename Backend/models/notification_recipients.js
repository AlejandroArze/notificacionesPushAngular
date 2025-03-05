const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const NotificationRecipients = sequelize.define('NotificationRecipients', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    notification_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    recipient_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'read', 'deleted', 'scheduled'),
      defaultValue: 'pending'
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'notification_recipients',
    timestamps: false,
    underscored: true,
    indexes: [
      { fields: ['id'] },
      { fields: ['notification_id'] },
      { fields: ['recipient_id'] },
      { fields: ['status'] }
    ]
  });

  return NotificationRecipients;
}; 