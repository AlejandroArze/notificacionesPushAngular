'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('usuariosApp', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: true
      },
      tipodocumento_id: {
        type: Sequelize.BIGINT,
        allowNull: true
      },
      nro_documento: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      fecha_caducidad_ci: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      expedido_id: {
        type: Sequelize.BIGINT,
        allowNull: true
      },
      nombres: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      paterno: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      materno: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      tercer_apellido: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      avatar: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      ci_anverso: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      ci_reverso: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      fecha_nacimiento: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      genero: {
        type: Sequelize.ENUM('masculino', 'femenino', 'otro'),
        allowNull: true
      },
      estado_civil: {
        type: Sequelize.ENUM('soltero', 'casado', 'divorciado', 'viudo', 'otro'),
        allowNull: true
      },
      celular: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      telefono: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      municipio: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      latitud: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true
      },
      longitud: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true
      },
      subalcaldia: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      distrito: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      subdistrito: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      zona: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      tipo_lugar: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      domicilio: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      referencia_adicional: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      nro_puerta: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      estado: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      tokens_notificaciones: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      id_google: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('usuariosApp', ['id']);
    await queryInterface.addIndex('usuariosApp', ['user_id']);
    await queryInterface.addIndex('usuariosApp', ['nro_documento']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('usuariosApp');
  }
}; 