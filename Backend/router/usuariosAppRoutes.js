const express = require('express');
const router = express.Router();
const usuariosAppController = require('../controllers/usuariosAppController');

router.post('/', usuariosAppController.createUsuarioApp);
router.get('/', usuariosAppController.getAllUsuariosApp);
router.get('/:id', usuariosAppController.getUsuarioAppById);
router.put('/:id', usuariosAppController.updateUsuarioApp);
router.delete('/:id', usuariosAppController.deleteUsuarioApp);

module.exports = router; 