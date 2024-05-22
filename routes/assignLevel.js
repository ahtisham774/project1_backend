
const express = require('express')
const router = express.Router()
const AssignStudentLevel = require('../controllers/StudentLevel')

router.post('/:id/assign-level', AssignStudentLevel.assignLevel)
router.get('/:id/level', AssignStudentLevel.getStudentLevel)

module.exports = router
