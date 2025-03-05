const db = require('../models');
const { Op } = require('sequelize');

exports.createNotification = async (req, res) => {
  const { recipients, ...notificationData } = req.body;
  
  try {
    // Usa db.Usuarios en lugar de Usuarios directamente
    const senderExists = await db.Usuarios.findByPk(notificationData.sender_id);
    if (!senderExists) {
      return res.status(400).json({ error: 'Sender no encontrado' });
    }

    const notification = await db.Notifications.create(notificationData);
    
    if (recipients && recipients.length > 0) {
      const validRecipients = await db.UsuariosApp.findAll({
        where: { 
          id: { 
            [Op.in]: recipients 
          } 
        }
      });

      if (validRecipients.length !== recipients.length) {
        return res.status(400).json({ error: 'Algunos recipients no son válidos' });
      }

      const recipientRecords = recipients.map(recipientId => ({
        notification_id: notification.id,
        recipient_id: recipientId
      }));
      
      await db.NotificationRecipients.bulkCreate(recipientRecords);
    }
    
    res.status(201).json(notification);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await db.Notifications.findAll({
      include: [{
        model: db.NotificationRecipients,
        include: [db.UsuariosApp]
      }]
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getNotificationById = async (req, res) => {
  try {
    const notification = await db.Notifications.findByPk(req.params.id, {
      include: [{
        model: db.NotificationRecipients,
        include: [db.UsuariosApp]
      }]
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notificación no encontrada' });
    }
    
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateNotification = async (req, res) => {
  try {
    const [updated] = await db.Notifications.update(req.body, {
      where: { id: req.params.id }
    });
    
    if (updated) {
      const updatedNotification = await db.Notifications.findByPk(req.params.id);
      return res.json(updatedNotification);
    }
    
    throw new Error('Notificación no encontrada');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const deleted = await db.Notifications.destroy({
      where: { id: req.params.id }
    });
    
    if (deleted) {
      return res.status(204).json({ message: 'Notificación eliminada' });
    }
    
    throw new Error('Notificación no encontrada');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 