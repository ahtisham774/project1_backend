
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
router.get('/activity/:id/homework/all', homeworkController.getAllHomework);
router.put('/:id/update', homeworkController.updateHomework);


module.exports = router;
