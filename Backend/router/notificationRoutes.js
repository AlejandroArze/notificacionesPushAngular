const express = require('express');
const router = express.Router();
const NotificationController = require('../controller/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

// Middleware de logging para rutas de notificaciones
router.use((req, res, next) => {
    console.log(`🔔 Solicitud de notificación recibida: ${req.method} ${req.path}`);
    console.log('Cabeceras:', req.headers);
    console.log('Cuerpo:', req.body);
    next();
});

// Rutas protegidas por JWT
router.post('/send', authMiddleware, NotificationController.sendToUser);
router.post('/broadcast', authMiddleware, NotificationController.sendBroadcast);
router.post('/group', authMiddleware, NotificationController.sendToGroup);

module.exports = router; 