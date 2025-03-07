const admin = require('../config/firebase');
const { Notifications, NotificationRecipients, UsuariosApp } = require('../models');
const { Op } = require('sequelize');

class NotificationService {
    async sendToUser(userId, payload) {
        try {
            // Buscar el usuario en UsuariosApp por su ID
            const usuarioApp = await UsuariosApp.findOne({
                where: { 
                    id: userId  // Buscar por el campo 'id'
                }
            });
            
            if (!usuarioApp) {
                throw new Error('Usuario no encontrado');
            }

            // Validar tokens de notificación
            const tokens = usuarioApp.tokens_notificaciones || [];
            
            if (!tokens || tokens.length === 0) {
                throw new Error('El usuario no tiene tokens de notificación');
            }

            // Filtrar tokens válidos (eliminar tokens vacíos o nulos)
            const validTokens = tokens.filter(token => token && token.trim() !== '');

            if (validTokens.length === 0) {
                throw new Error('No hay tokens de notificación válidos');
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
            const messages = validTokens.map(token => ({
                token: token,
                notification: {
                    title: payload.title,
                    body: payload.body
                },
                data: {
                    ...payload.data,
                    // Agregar metadatos adicionales si es necesario
                    click_action: 'FLUTTER_NOTIFICATION_CLICK'
                }
            }));

            // Enviar notificaciones y manejar errores
            const sendResults = await Promise.allSettled(
                messages.map(message => admin.messaging().send(message))
            );

            // Analizar resultados
            const successfulSends = sendResults.filter(result => result.status === 'fulfilled');
            const failedSends = sendResults.filter(result => result.status === 'rejected');

            // Registrar y manejar tokens inválidos
            const invalidTokens = failedSends.map(fail => {
                console.error('Error enviando notificación:', fail.reason);
                return fail.reason.errorInfo?.token;
            }).filter(Boolean);

            if (invalidTokens.length > 0) {
                console.warn('Tokens inválidos detectados:', invalidTokens);
                
                // Eliminar tokens inválidos del registro de usuario
                const updatedTokens = validTokens.filter(token => !invalidTokens.includes(token));
                
                await UsuariosApp.update(
                    { 
                        tokens_notificaciones: updatedTokens 
                    },
                    { where: { id: userId } }
                );
            }

            return { 
                notification, 
                sent: successfulSends.length > 0,
                totalTokens: validTokens.length,
                successfulSends: successfulSends.length,
                failedSends: failedSends.length
            };
        } catch (error) {
            console.error('Error completo enviando notificación:', error);
            throw error;
        }
    }

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