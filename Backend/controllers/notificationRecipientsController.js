const { NotificationRecipients, Notifications, UsuariosApp } = require('../models');

exports.createNotificationRecipient = async (req, res) => {
  try {
    const notificationRecipient = await NotificationRecipients.create(req.body);
    res.status(201).json(notificationRecipient);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllNotificationRecipients = async (req, res) => {
  try {
    const notificationRecipients = await NotificationRecipients.findAll({
      include: [Notifications, UsuariosApp]
    });
    res.json(notificationRecipients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getNotificationRecipientById = async (req, res) => {
  try {
    const notificationRecipient = await NotificationRecipients.findByPk(req.params.id, {
      include: [Notifications, UsuariosApp]
    });
    
    if (!notificationRecipient) {
      return res.status(404).json({ message: 'Destinatario de notificación no encontrado' });
    }
    
    res.json(notificationRecipient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateNotificationRecipient = async (req, res) => {
  try {
    const [updated] = await NotificationRecipients.update(req.body, {
      where: { id: req.params.id }
    });
    
    if (updated) {
      const updatedNotificationRecipient = await NotificationRecipients.findByPk(req.params.id);
      return res.json(updatedNotificationRecipient);
    }
    
    throw new Error('Destinatario de notificación no encontrado');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteNotificationRecipient = async (req, res) => {
  try {
    const deleted = await NotificationRecipients.destroy({
      where: { id: req.params.id }
    });
    
    if (deleted) {
      return res.status(204).json({ message: 'Destinatario de notificación eliminado' });
    }
    
    throw new Error('Destinatario de notificación no encontrado');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 