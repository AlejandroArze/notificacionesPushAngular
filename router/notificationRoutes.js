const express = require('express');
const router = express.Router();
const NotificationController = require('../controller/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

// Rutas protegidas por JWT
router.post('/send', authMiddleware, NotificationController.sendToUser);
router.post('/broadcast', authMiddleware, NotificationController.sendBroadcast);
router.post('/group', authMiddleware, NotificationController.sendToGroup);

module.exports = router; 