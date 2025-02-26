const { Model } = require('sequelize'); // Importa la clase Model de Sequelize.
const sequelize = require('../config/dataBase'); // Importa la instancia de Sequelize conectada a la base de datos.

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Aquí se pueden definir asociaciones entre otros modelos si es necesario.
    }
  }

  // Definimos el modelo User utilizando el método 'init' y especificando los campos de la tabla.
  User.init({
    // Campo 'usuarios_id' que corresponde a la clave primaria en la tabla 'usuarios'.
    usuarios_id: {
      type: DataTypes.INTEGER, // El tipo de dato es INTEGER (ya que es entero, no BIGINT).
      primaryKey: true, // Es la clave primaria.
      autoIncrement: true // Se incrementa automáticamente.
    },
    // Campo 'email' que corresponde al correo electrónico del usuario.
    email: {
      type: DataTypes.STRING, // El tipo de dato es STRING (texto).
      allowNull: false, // No permite valores nulos.
      unique: true, // El valor debe ser único.
      validate: {
        isEmail: true, // Valida que el valor sea un email válido.
        notEmpty: true, // No permite cadenas vacías.
        notNull: true // Valida que el valor no sea nulo.
      }
    },
    // Campo 'usuario' que corresponde al nombre de usuario.
    usuario: {
      type: DataTypes.STRING, // El tipo de dato es STRING (texto).
      allowNull: false, // No permite valores nulos.
      unique: true, // El valor debe ser único.
      validate: {
        notEmpty: true, // No permite cadenas vacías.
        notNull: true // Valida que el valor no sea nulo.
      }
    },
    
    // Campo 'nombres' que corresponde al nombre del usuario.
    nombres: {
      type: DataTypes.STRING, // El tipo de dato es STRING (texto).
      allowNull: false, // No permite valores nulos.
      validate: {
        notEmpty: true, // No permite cadenas vacías.
        notNull: true // Valida que el valor no sea nulo.
      }
    },
    // Campo 'password' que corresponde a la contraseña del usuario.
    password: {
      type: DataTypes.STRING, // El tipo de dato es STRING (texto).
      allowNull: false, // No permite valores nulos.
      validate: {
        notEmpty: true, // No permite cadenas vacías.
        notNull: true // Valida que el valor no sea nulo.
      }
    },
    // Campo 'role' que corresponde al rol del usuario (admin, usuario, etc.).
    role: {
      type: DataTypes.INTEGER, // El tipo de dato es INTEGER, como especificaste.
      allowNull: false, // No permite valores nulos.
      validate: {
        notEmpty: true, // No permite cadenas vacías.
        notNull: true // Valida que el valor no sea nulo.
      }
    },
    // Campo 'apellidos' que corresponde al apellido del usuario.
    apellidos: {
      type: DataTypes.STRING, // El tipo de dato es STRING (texto).
      allowNull: false, // No permite valores nulos.
      validate: {
        notEmpty: true, // No permite cadenas vacías.
        notNull: true // Valida que el valor no sea nulo.
      }
    },
    // Campo 'image' que corresponde a la imagen del usuario (posiblemente una URL o ruta).
    image: {
      type: DataTypes.STRING, // El tipo de dato es STRING (texto).
      allowNull: true, // Puede ser nulo, ya que no siempre es obligatorio que haya una imagen.
      defaultValue: '/uploads/default-profile.png'
    },
    // Campo 'estado' que podría representar el estado del usuario (activo, inactivo, etc.).
    estado: {
      type: DataTypes.INTEGER, // El tipo de dato es INTEGER, como especificaste.
      allowNull: false, // No permite valores nulos.
      validate: {
        notEmpty: true, // No permite cadenas vacías.
        notNull: true // Valida que el valor no sea nulo.
      }
    }
  }, {
    sequelize, // Pasamos la instancia de Sequelize para manejar la conexión con la base de datos.
    modelName: 'User', // Nombre del modelo.
    tableName: 'usuarios', // Nombre de la tabla en la base de datos.
    timestamps: false,
  });

  return User; // Retorna el modelo User.
};
