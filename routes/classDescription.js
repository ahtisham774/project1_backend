const express = require('express');
const router = express.Router();

const ClassDescriptionController = require('../controllers/ClassDescriptionController');

router.get('/:id/get', ClassDescriptionController.getClassDescription);
router.post('/:id/assign', ClassDescriptionController.assignClassDescription);
router.put('/:id/delete', ClassDescriptionController.deleteClass);
router.put('/:id/update', ClassDescriptionController.updateClass);

module.exports = router;