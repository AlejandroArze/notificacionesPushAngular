const express = require('express');
const router = express.Router();
const notificationRecipientsController = require('../controllers/notificationRecipientsController');

router.post('/', notificationRecipientsController.createNotificationRecipient);
router.get('/', notificationRecipientsController.getAllNotificationRecipients);
router.get('/:id', notificationRecipientsController.getNotificationRecipientById);
router.put('/:id', notificationRecipientsController.updateNotificationRecipient);
router.delete('/:id', notificationRecipientsController.deleteNotificationRecipient);

module.exports = router; 