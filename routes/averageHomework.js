
const express = require('express');
const router = express.Router();
const AverageHomework = require('../controllers/AverageHomework');

router.post('/:id/assign', AverageHomework.assignHomeworkAverage);
router.put('/:id/update', AverageHomework.updateHomeworkAvg);
router.get('/:id/get', AverageHomework.getHomeworkAverages);


module.exports = router;