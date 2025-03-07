const express = require('express');
const router = express.Router();
const UsuariosAppController = require('../controller/usuariosAppController');
const authMiddleware = require('../middleware/authMiddleware');

// Cambiar el orden de las rutas para evitar conflictos
router.get('/buscar', authMiddleware, UsuariosAppController.buscarUsuarios);
router.post('/', UsuariosAppController.createUsuarioApp);
router.get('/', UsuariosAppController.getAllUsuariosApp);

// Mover las rutas específicas con :id al final
router.get('/:id', UsuariosAppController.getUsuarioAppById);
router.put('/:id', UsuariosAppController.updateUsuarioApp);
router.delete('/:id', UsuariosAppController.deleteUsuarioApp);

module.exports = router; 