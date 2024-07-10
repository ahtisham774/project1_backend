const express = require("express")
const router = express.Router()
const StudentGrammarResult = require("../controllers/StudentGrammarResultController")


// Get all student grammar results
router.get("/:id/all", StudentGrammarResult.getStudentGrammarResults)

// Create or update student grammar results
router.post("/:id/add", StudentGrammarResult.createOrUpdateStudentGrammarResults)

module.exports = router