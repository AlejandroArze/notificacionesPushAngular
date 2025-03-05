const { UsuariosApp } = require('../models');

exports.createUsuarioApp = async (req, res) => {
  try {
    const usuarioApp = await UsuariosApp.create(req.body);
    res.status(201).json(usuarioApp);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllUsuariosApp = async (req, res) => {
  try {
    const usuariosApp = await UsuariosApp.findAll();
    res.json(usuariosApp);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUsuarioAppById = async (req, res) => {
  try {
    const usuarioApp = await UsuariosApp.findByPk(req.params.id);
    if (!usuarioApp) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(usuarioApp);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUsuarioApp = async (req, res) => {
  try {
    const [updated] = await UsuariosApp.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedUsuarioApp = await UsuariosApp.findByPk(req.params.id);
      return res.json(updatedUsuarioApp);
    }
    throw new Error('Usuario no encontrado');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUsuarioApp = async (req, res) => {
  try {
    const deleted = await UsuariosApp.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      return res.status(204).json({ message: 'Usuario eliminado' });
    }
    throw new Error('Usuario no encontrado');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 