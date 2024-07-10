
const express = require('express');
const router = express.Router();
const StudentHomework = require('../controllers/StudentHomeworkController');
const multer = require("multer")
const path = require("path")
const fs = require("fs")

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/homework')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})
const upload = multer({ storage: storage })





router.post('/:id/assign', upload.single("document"), StudentHomework.assignHomework);
router.post('/upload-document/:id', upload.single("document"), StudentHomework.uploadDocument);
router.put('/:id/update', upload.single("document"), StudentHomework.updateHomework);
router.get('/:id/get', StudentHomework.getHomeworks);
router.post('/:id/homework', StudentHomework.getHomeworkByMonth);
router.put('/mark/:id', StudentHomework.markHomework);
router.put('/delete/:id', StudentHomework.deleteHomework);



module.exports = router;