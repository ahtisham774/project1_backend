const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/ConversationController');

// Route for registering a new student
router.post('/create', conversationController.audio, conversationController.createConversation);

router.get('/all', conversationController.getAllConversations);
router.get('/:id', conversationController.getConversationById);
// Route to update a student
router.put('/:id', conversationController.updateConversationById);
// Route to delete a student
router.delete('/:id', conversationController.deleteConversationById);

module.exports = router;

