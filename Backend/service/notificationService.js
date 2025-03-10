const { admin, messaging } = require('../config/firebase');
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
                sender_id: payload.senderId || 0,
                title: payload.title,
                body: payload.body,
                data: payload.data,
                type: payload.type || 'message',
                status: 'sent',
                sent_at: new Date()
            });

            // Crear registro de destinatario
            await NotificationRecipients.create({
                notification_id: notification.id,
                recipient_id: userId,
                status: 'pending'
            });

            // Enviar notificaciones en lotes
            const sendResults = [];

            try {
                // Usar sendEachFor para tokens individuales
                const batchPromises = validTokens.map(token => 
                    messaging.send({ 
                        token, 
                        notification: {
                            title: payload.title,
                            body: payload.body
                        },
                        data: payload.data || {} 
                    }).catch(error => {
                        console.error(`Error enviando a token ${token}:`, error);
                        return null;
                    })
                );

                const batchResponses = await Promise.all(batchPromises);

                const successCount = batchResponses.filter(response => response !== null).length;
                const failureCount = batchResponses.filter(response => response === null).length;

                sendResults.push({
                    totalTokens: validTokens.length,
                    successCount,
                    failureCount
                });
            } catch (batchError) {
                console.error(`Error en envío de notificación:`, batchError);
                sendResults.push({
                    totalTokens: validTokens.length,
                    successCount: 0,
                    failureCount: validTokens.length,
                    error: batchError.message
                });
            }

            // Calcular estadísticas
            const totalTokens = validTokens.length;
            const successfulSends = sendResults.reduce((sum, result) => sum + result.successCount, 0);
            const failedSends = sendResults.reduce((sum, result) => sum + result.failureCount, 0);

            return { 
                notification, 
                sent: successfulSends > 0,
                totalTokens: totalTokens,
                successfulSends: successfulSends,
                failedSends: failedSends,
                send_results: sendResults
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
                sender_id: 0,
                title: payload.title,
                body: payload.body,
                data: payload.data,
                type: payload.type || 'broadcast',
                status: 'sent',
                sent_at: new Date()
            });

            // Recopilar todos los tokens
            const allTokens = usuariosApp.flatMap(usuario => 
                (usuario.tokens_notificaciones || []).filter(token => token && token.trim() !== '')
            );

            // Filtrar tokens únicos
            const uniqueTokens = [...new Set(allTokens)];

            // Verificar si hay tokens para enviar
            if (uniqueTokens.length === 0) {
                return { 
                    notification,
                    total_users: 0,
                    total_tokens: 0,
                    successful_sends: 0,
                    failed_sends: 0,
                    send_results: []
                };
            }

            // Mensaje de notificación
            const message = {
                notification: {
                    title: payload.title,
                    body: payload.body
                },
                data: payload.data || {}
            };

            // Enviar notificaciones en lotes
            const batchSize = 500;
            const sendResults = [];

            for (let i = 0; i < uniqueTokens.length; i += batchSize) {
                const batchTokens = uniqueTokens.slice(i, i + batchSize);
                
                try {
                    // Usar sendEachFor para tokens individuales
                    const batchPromises = batchTokens.map(token => 
                        messaging.send({ 
                            token, 
                            ...message 
                        }).catch(error => {
                            console.error(`Error enviando a token ${token}:`, error);
                            return null;
                        })
                    );

                    const batchResponses = await Promise.all(batchPromises);

                    const successCount = batchResponses.filter(response => response !== null).length;
                    const failureCount = batchResponses.filter(response => response === null).length;

                    sendResults.push({
                        totalTokens: batchTokens.length,
                        successCount,
                        failureCount
                    });
                } catch (batchError) {
                    console.error(`Error en lote de notificaciones:`, batchError);
                    sendResults.push({
                        totalTokens: batchTokens.length,
                        successCount: 0,
                        failureCount: batchTokens.length,
                        error: batchError.message
                    });
                }
            }

            // Crear registros de destinatarios
            const recipientBatches = [];
            for (const usuario of usuariosApp) {
                recipientBatches.push(
                    NotificationRecipients.create({
                        notification_id: notification.id,
                        recipient_id: usuario.id,
                        status: 'pending'
                    })
                );
            }
            await Promise.all(recipientBatches);

            // Calcular estadísticas
            const totalTokens = uniqueTokens.length;
            const successfulSends = sendResults.reduce((sum, result) => sum + result.successCount, 0);
            const failedSends = sendResults.reduce((sum, result) => sum + result.failureCount, 0);

            return { 
                notification,
                total_users: usuariosApp.length,
                total_tokens: totalTokens,
                successful_sends: successfulSends,
                failed_sends: failedSends,
                send_results: sendResults
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
                    messages.map(message => messaging.send(message))
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