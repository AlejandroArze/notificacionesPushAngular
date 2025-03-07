const admin = require('../config/firebase');
const { Notifications, NotificationRecipients, UsuariosApp } = require('../models');
const { Op } = require('sequelize');

class NotificationService {
    // Enviar notificación a un usuario específico
    async sendToUser(userId, payload) {
        try {
            // Buscar el usuario en UsuariosApp
            const usuarioApp = await UsuariosApp.findByPk(userId);
            
            if (!usuarioApp || !usuarioApp.tokens_notificaciones) {
                throw new Error('Usuario sin tokens de notificación');
            }

            // Crear registro de notificación
            const notification = await Notifications.create({
                sender_id: payload.senderId,
                title: payload.title,
                body: payload.body,
                data: payload.data,
                type: payload.type,
                status: 'sent',
                sent_at: new Date()
            });

            // Crear registro de destinatario
            await NotificationRecipients.create({
                notification_id: notification.id,
                recipient_id: userId,
                status: 'pending'
            });

            // Enviar notificación por Firebase
            const tokens = usuarioApp.tokens_notificaciones;
            const messages = tokens.map(token => ({
                token: token,
                notification: {
                    title: payload.title,
                    body: payload.body
                },
                data: payload.data
            }));

            // Enviar notificaciones
            const responses = await Promise.all(
                messages.map(message => admin.messaging().send(message))
            );

            return { 
                notification, 
                sent: responses.length > 0 
            };
        } catch (error) {
            console.error('Error enviando notificación:', error);
            throw error;
        }
    }

    // Enviar notificación de transmisión (a todos los usuarios)
    async sendBroadcast(payload) {
        try {
            // Obtener todos los tokens de usuarios
            const usuariosApp = await UsuariosApp.findAll({
                where: { 
                    tokens_notificaciones: { 
                        [Op.not]: null 
                    } 
                }
            });

            // Crear registro de notificación
            const notification = await Notifications.create({
                sender_id: null, // Notificación del sistema
                title: payload.title,
                body: payload.body,
                data: payload.data,
                type: payload.type,
                status: 'sent',
                sent_at: new Date()
            });

            // Recopilar todos los tokens
            const allTokens = usuariosApp.flatMap(usuario => 
                usuario.tokens_notificaciones || []
            );

            // Mensaje de notificación
            const message = {
                notification: {
                    title: payload.title,
                    body: payload.body
                },
                data: payload.data
            };

            // Enviar notificaciones en lotes
            const batchSize = 500;
            for (let i = 0; i < allTokens.length; i += batchSize) {
                const batchTokens = allTokens.slice(i, i + batchSize);
                await admin.messaging().sendMulticast({
                    tokens: batchTokens,
                    ...message
                });
            }

            return { 
                total_users: usuariosApp.length,
                notifications_created: 1
            };
        } catch (error) {
            console.error('Error en notificación broadcast:', error);
            throw error;
        }
    }

    // Enviar notificación a un grupo de usuarios
    async sendToGroup(userIds, payload) {
        try {
            // Buscar usuarios del grupo
            const usuariosApp = await UsuariosApp.findAll({
                where: { 
                    id: userIds,
                    tokens_notificaciones: { 
                        [Op.not]: null 
                    } 
                }
            });

            // Crear registro de notificación
            const notification = await Notifications.create({
                sender_id: payload.senderId,
                title: payload.title,
                body: payload.body,
                data: payload.data,
                type: payload.type,
                status: 'sent',
                sent_at: new Date()
            });

            // Preparar notificaciones para cada usuario
            const notificationPromises = usuariosApp.map(async (usuario) => {
                // Crear registro de destinatario
                await NotificationRecipients.create({
                    notification_id: notification.id,
                    recipient_id: usuario.id,
                    status: 'pending'
                });

                // Enviar notificaciones para cada token del usuario
                const messages = usuario.tokens_notificaciones.map(token => ({
                    token: token,
                    notification: {
                        title: payload.title,
                        body: payload.body
                    },
                    data: payload.data
                }));

                return Promise.all(
                    messages.map(message => admin.messaging().send(message))
                );
            });

            // Esperar a que se envíen todas las notificaciones
            await Promise.all(notificationPromises);

            return { 
                total_users: usuariosApp.length,
                enabled_users: usuariosApp.length,
                notifications_created: usuariosApp.length
            };
        } catch (error) {
            console.error('Error en notificación de grupo:', error);
            throw error;
        }
    }
}

module.exports = new NotificationService(); 