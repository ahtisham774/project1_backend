const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');

// Route for registering a new student
router.post('/register',UserController.uploadImage, UserController.registerStudent);
// router.post('/register-teacher',UserController.uploadImage, UserController.registerTeacher);


router.get('/students',UserController.getStudents);
router.get('/student/:id',UserController.getStudentName);

// Route for logging in a student
router.post('/login', UserController.loginStudent);
// Route to get all students
// Route to Current User
router.get('/current', UserController.getCurrentUser);
router.get('/students-status', UserController.getStudentsStatus);
router.put('/assign-level', UserController.assignLevel);
router.put('/status/:id', UserController.updateStatus);
router.post('/:id/get-levels', UserController.getStudentLevels);
router.get('/all', UserController.getStudentDetails);
router.get('/:id', UserController.getStudentByLevel);
// Route to get student by id
router.get('/get-student/:id', UserController.getStudentById);
// Route to update a student
router.put('/:id', UserController.updateStudentDetails);
// Route to delete a student
router.delete('/:email', UserController.deleteStudent);

module.exports = router;

