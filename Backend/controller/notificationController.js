const NotificationService = require('../service/notificationService');

class NotificationController {
    async sendToUser(req, res) {
        try {
            const { userId, title, body, data, type } = req.body;
            const payload = {
                senderId: req.user.usuarios_id,
                userId,
                title,
                body,
                data,
                type
            };

            const result = await NotificationService.sendToUser(userId, payload);
            
            res.status(200).json({
                success: true,
                data: {
                    notification: result.notification,
                    sent: result.sent
                }
            });
        } catch (error) {
            console.error('Error en sendToUser:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: error.name,
                    message: error.message
                }
            });
        }
    }

    async sendBroadcast(req, res) {
        try {
            const { title, body, data, type } = req.body;
            const payload = {
                title,
                body,
                data,
                type
            };

            const result = await NotificationService.sendBroadcast(payload);
            
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Error en sendBroadcast:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: error.name,
                    message: error.message
                }
            });
        }
    }

    async sendToGroup(req, res) {
        try {
            const { userIds, title, body, data, type } = req.body;
            const payload = {
                senderId: req.user.usuarios_id,
                userIds,
                title,
                body,
                data,
                type
            };

            const result = await NotificationService.sendToGroup(userIds, payload);
            
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Error en sendToGroup:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: error.name,
                    message: error.message
                }
            });
        }
    }
}

module.exports = new NotificationController(); 