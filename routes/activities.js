
const express = require('express');
const router = express.Router();

// Import the activitiesController
const activitiesController = require('../controllers/ActivitiesController');
const levelController  = require("../controllers/LevelController")

// Define the endpoint for level
router.get('/:id/activity/all', activitiesController.getAllActivities);
router.post('/:id/activity/create',activitiesController.uploadImage, activitiesController.createActivities);
router.post('/:id/conversation/create',activitiesController.audio, activitiesController.createConversation);
router.post('/:id/add', activitiesController.createConversationItem);
router.post('/:id/lesson/all', activitiesController.getActivitiesContentById);
router.put('/:id', activitiesController.audio,activitiesController.updateConversationAudio);
router.post('/:id/material/all', activitiesController.getMaterialByLesson);
router.post('/:id/lesson/create', activitiesController.uploadImage, activitiesController.addLesson);
router.post('/:id/material/create-game',  activitiesController.createLessonGame);
router.post('/:id/material/add', activitiesController.uploadImage, activitiesController.addMaterial);
router.post('/:id/material/remove',  activitiesController.removeMaterial);
// router.get('/:id/subject/all', activitiesController.getLevelById);
// router.post('/:id/subject/create', activitiesController.uploadImage,activitiesController.updateLevelById);
router.put('/:id/remove', activitiesController.deleteConversation);
router.put('/:id/update-subject',levelController.uploadImage, levelController.updateSubject);
router.put('/:id/update-activity',activitiesController.uploadImage, activitiesController.updateActivity);
router.put('/:id/update-lesson',activitiesController.uploadImage, activitiesController.updateLesson);
router.put('/:id/update-conversation',activitiesController.audio, activitiesController.updateConversation);
router.delete('/:id/remove-subject', levelController.deleteSubject);
router.delete('/:id/remove-activity', activitiesController.deleteActivity);
router.delete('/:id/remove-game', activitiesController.deleteLessonGame);
router.delete('/:id/remove-lesson', activitiesController.deleteLesson);
router.delete('/:quizId/question/:questionId', activitiesController.deleteQuestion);
router.put('/:quizId/edit', activitiesController.editGame);
router.post('/update-activities-orders',activitiesController.updateActivitiesOrder)
router.post('/lesson/update-lesson-orders',activitiesController.updateLessonsOrder)

module.exports = router;
