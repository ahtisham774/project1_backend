const express = require('express');
const router = express.Router();
const reminderController = require('../controllers/ReminderController');

router.post('/:id/create', reminderController.createReminder);
router.get('/:id/get', reminderController.getAllReminders);
router.put('/mark/:id', reminderController.updateReminder);
router.put('/:id/delete', reminderController.deleteReminder);

module.exports = router;