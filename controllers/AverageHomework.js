const AverageHomework = require('../models/HomeworkAverage');

exports.assignHomeworkAverage = async (req, res) => {
    try {
        const { month, year, grammar, vocabulary, listening, reading } = req.body
        const student = req.params.id
        const level = await AverageHomework.findOne({ student })
        if (!level) {
            const newLevel = new AverageHomework({
                student,
                average: [
                    {
                        month,
                        year,
                        grammar,
                        vocabulary,
                        listening,
                        reading
                    }
                ]
            })
            await newLevel.save()
            return res.status(200).json({ message: "Homework Average Assigned" })
        } else {
            // check if month and year already exists
            const checkMonth = level.average.filter(data => data.month.toLowerCase() == month.toLowerCase() && data.year == year)
            if (checkMonth.length > 0) {
                // update the month and year data
                checkMonth[0].grammar = grammar || checkMonth[0].grammar;
                checkMonth[0].vocabulary = vocabulary || checkMonth[0].vocabulary;
                checkMonth[0].listening = listening || checkMonth[0].listening;
                checkMonth[0].reading = reading || checkMonth[0].reading;
                await AverageHomework.updateOne({ student }, { average: level.average })
                return res.status(201).json({ message: "Homework Average Updated" })
            } else {
                level.average.push({
                    month,
                    year,
                    grammar,
                    vocabulary,
                    listening,
                    reading
                })
                await level.save()
                return res.status(200).json({ message: "Homework Average Assigned" })
            }
        }
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}



exports.updateHomeworkAvg = async (req, res) => {
    try {
        const { month, year, type, percentage } = req.body
        const student = req.params.id
        const level = await AverageHomework.findOne({ student })
        if (!level) {
            //create new level
            const newLevel = new AverageHomework({
                student,
                average: [
                    {
                        month,
                        year,
                        grammar: type === 'grammar' ? percentage : 0,
                        vocabulary: type === 'vocabulary' ? percentage : 0,
                        listening: type === 'listening' ? percentage : 0,
                        reading: type === 'reading' ? percentage : 0
                    }
                ]
            })
            await newLevel.save()
            return res.status(201).json({ message: "Homework Average Assigned" })
        } else {
            const checkMonth = level.average.filter(data => data.month.toLowerCase() == month.toLowerCase() && data.year == year)
            if (checkMonth.length > 0) {
                checkMonth[0][type] = percentage || checkMonth[0][type]
                await AverageHomework.updateOne({ student }, { average: level.average })
                return res.status(201).json({ message: "Homework Average Updated" })
            } else {
                level.average.push({
                    month,
                    year,
                    grammar: type === 'grammar' ? percentage : 0,
                    vocabulary: type === 'vocabulary' ? percentage : 0,
                    listening: type === 'listening' ? percentage : 0,
                    reading: type === 'reading' ? percentage : 0
                })
                await level.save()
                return res.status(201).json({ message: "Homework Average Assigned" })
               
            }
        }

    } catch (err) {
        return res.status(500).json({ message: err.message })

    }
}

exports.getHomeworkAverages = async (req, res) => {
    try {
        const student = req.params.id
        const level = await AverageHomework.findOne({ student })
        if (!level) {
            return res.status(404).json({ message: "Student Not found" })
        } else {
            return res.status(200).json(level)
        }
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}