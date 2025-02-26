'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('usuarios', {
      usuarios_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,  // Auto increment para usuarios_id
        allowNull: false
      },
      nombres: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      apellidos: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      usuario: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: true  // Aseguramos que el nombre de usuario sea único
      },
      email: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: true  // Aseguramos que el email sea único
      },
      role: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      image: {
        type: Sequelize.TEXT,
        allowNull: true,  // Permite que sea nulo
        defaultValue: '/uploads/default-profile.png'  // Valor predeterminado
      },
      estado: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1  // Valor predeterminado para el estado
      },
      password: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('usuarios');
  }
};

