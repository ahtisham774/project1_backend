const StudentGrammarResult = require("../models/StudentGrammarResult")


// Get all student grammar results


exports.getStudentGrammarResults = async (req, res) => {
    try {
        const studentId = req.params.id
        const studentGrammarResults = await StudentGrammarResult.findOne({ studentId })
        if (!studentGrammarResults) return res.status(404).json({ message: 'Student Grammar Results not found' })
        res.status(200).json(studentGrammarResults)
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
}

// Create or update student grammar results
exports.createOrUpdateStudentGrammarResults = async (req, res) => {
    try {
        const student = req.params.id
        const { grammarResults } = req.body
        let studentGrammarResults = await StudentGrammarResult
            .findOne({ student })
        if (!studentGrammarResults) {
            studentGrammarResults = new StudentGrammarResult({ student, grammarResults })
        }
        else {

            // check if grammarResults.quizId is already exist then update that otherwise push into grammarResults
            grammarResults.forEach((result) => {
                const index = studentGrammarResults.grammarResults.findIndex((data) => data.quizId == result.quizId)
                if (index >= 0) {
                    studentGrammarResults.grammarResults[index] = result
                }
                else {
                    studentGrammarResults.grammarResults.push(result)
                }
            })
        }
        await studentGrammarResults.save()
        res.status(200).json({ message: 'Student Grammar Results Updated' })
    }
    catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
}