
const express = require('express');
const router = express.Router();
const StudentHomework = require('../controllers/StudentHomeworkController');

router.post('/:id/assign', StudentHomework.assignHomework);
router.get('/:id/get', StudentHomework.getHomeworks);
router.post('/:id/homework', StudentHomework.getHomeworkByMonth);
router.put('/mark/:id', StudentHomework.markHomework);
router.put('/delete/:id', StudentHomework.deleteHomework);



module.exports = router;