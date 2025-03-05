'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('notification_recipients', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      notification_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'notifications',
          key: 'id'
        }
      },
      recipient_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'usuariosApp',
          key: 'id'
        }
      },
      status: {
        type: Sequelize.ENUM('pending', 'read', 'deleted', 'scheduled'),
        defaultValue: 'pending'
      },
      read_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    await queryInterface.addIndex('notification_recipients', ['id']);
    await queryInterface.addIndex('notification_recipients', ['notification_id']);
    await queryInterface.addIndex('notification_recipients', ['recipient_id']);
    await queryInterface.addIndex('notification_recipients', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('notification_recipients');
  }
}; 