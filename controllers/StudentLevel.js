const StudentLevel = require("../models/StudentLevel")


exports.assignLevel = async (req, res) => {
    //check if student already in Level then update the fields otherwise add new data
    try {
        const { grammar, vocabulary, listening, reading, writing, speaking, overall } = req.body
        const student = req.params.id
        const level = await StudentLevel.findOne({ student })

        if (level) {
            level.grammar = grammar || level.grammar
            level.vocabulary = vocabulary || level.vocabulary
            level.listening = listening || level.listening
            level.reading = reading || level.reading
            level.writing = writing || level.writing
            level.speaking = speaking || level.speaking
            level.overall = overall || level.overall
            await level.save()
            return res.status(200).json({ message: "Level Updated" })
        } else {
            const newLevel = new StudentLevel({
                student,
                grammar: grammar || "",
                vocabulary : vocabulary || "",
                listening : listening || "",
                reading : reading || "",
                writing : writing || "",
                speaking : speaking || "",
                overall : overall || ""
            })
            await newLevel.save()
            return res.status(200).json({ message: "Level Assigned" })
        }
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}



exports.getStudentLevel = async (req, res) => {
    try {
        const student = req.params.id
        const level = await StudentLevel.findOne({ student })
        if (!level) return res.status(404).json({ message: "Student Not found" })
        return res.status(200).json(level)
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}


