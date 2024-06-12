
const express = require('express');
const router = express.Router();

// Import the homeworkController
const homeworkController = require('../controllers/HomeworkController');

// Define the endpoint for homework
router.get('/level/all', homeworkController.getAllHomeworkLevels);
router.post('/level/create', homeworkController.createHomeworkLevel);
router.post('/level/:id/activity/create', homeworkController.createHomeworkActivities);
router.get('/level/:id/activity/all', homeworkController.getAllHomeworkActivities);
router.post('/activity/:id/homework/create', homeworkController.createHomework);
router.post('/activity/:id/homework-section/create', homeworkController.createHomeworkSection);
router.get('/activity/:id/homework/all', homeworkController.getAllHomework);
router.get('/activity/:id/homework-section/all', homeworkController.getAllHomeworkSections);
router.put('/:id/update', homeworkController.updateHomework);
router.delete('/:id/delete', homeworkController.deleteHomework);



module.exports = router;
