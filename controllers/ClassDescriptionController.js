const ClassDescription = require("../models/classDescription")

exports.assignClassDescription = async (req, res) => {
    try {
        const { month, year, date, topic, dueDate, isDone, isCancel } = req.body
        const student = req.params.id
        const level = await ClassDescription.findOne({ student })

        if (!level) {
            const newLevel = new ClassDescription({
                student,
                classes: [
                    {
                        month,
                        year,
                        class: [
                            {
                                date,
                                topic,
                                dueDate,
                                isDone,
                                isCancel
                            }
                        ]
                    }
                ]
            })
            await newLevel.save()
            return res.status(200).json({ message: "Class Description Assigned" })
        } else {
            // check if month and year already exists
            const checkMonth = level.classes.filter(data => data.month.toLowerCase() == month.toLowerCase() && data.year == year)
            if (checkMonth.length > 0) {
                // update the month and year data
                // let classData = checkMonth[0].class.find(item => item.date === date && item.topic === topic)
                // if (classData) {
                //     classData.date = date || classData.date;
                //     classData.topic = topic || classData.topic;
                //     classData.dueDate = dueDate || classData.dueDate;
                //     classData.isDone = isDone || classData.isDone;
                //     classData.isCancel = isCancel || classData.isCancel;
                // } else {
                checkMonth[0].class.push({
                    date,
                    topic,
                    dueDate,
                    isDone,
                    isCancel
                })
                // }
                await ClassDescription.updateOne({
                    student
                }, {
                    classes: level.classes
                })
                return res.status(201).json({ message: "Class Description Updated" })
            } else {
                level.classes.push({
                    month,
                    year,
                    class: [
                        {
                            date,
                            topic,
                            dueDate,
                            isDone,
                            isCancel
                        }
                    ]
                })
                await level.save()
                return res.status(200).json({ message: "Class Description Assigned" })
            }
        }
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }

}

exports.getClassDescription = async (req, res) => {
    try {
        const student = req.params.id
        const level = await ClassDescription.findOne({ student })
        if (!level) {
            return res.status(404).json({ message: "Student Not found" })
        } else {
            return res.status(200).json(level)
        }
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

//marks a class as done or not done
exports.markClass = async (req, res) => {
    try {
        const student = req.params.id
        const { month, year, date, topic, isDone } = req.body
        const level = await ClassDescription.findOne({ student })
        if (!level) {
            return res.status(404).json({ message: "Student Not found" })
        } else {
            const checkMonth = level.classes.filter(data => data.month == month && data.year == year)
            if (checkMonth.length > 0) {
                let classData = checkMonth[0].class.find(item => item.date == date && item.topic == topic)
                if (classData) {
                    classData.isDone = isDone || classData.isDone;
                    await ClassDescription.updateOne({ student }, { classes: level.classes })
                    return res.status(201).json({ message: "Class Updated" })
                } else {
                    return res.status(404).json({ message: "Class Not found" })
                }
            } else {
                return res.status(404).json({ message: "Month and Year Not found" })
            }
        }
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

//marks a class as cancelled or not cancelled
exports.cancelClass = async (req, res) => {
    try {
        const student = req.params.id
        const { month, year, date, topic, isCancel } = req.body
        const level = await ClassDescription.findOne({ student })
        if (!level) {
            return res.status(404).json({ message: "Student Not found" })
        } else {
            const checkMonth = level.classes.filter(data => data.month == month && data.year == year)
            if (checkMonth.length > 0) {
                let classData = checkMonth[0].class.find(item => item.date == date && item.topic == topic)
                if (classData) {
                    classData.isCancel = isCancel || classData.isCancel;
                    await ClassDescription.updateOne({ student }, { classes: level.classes })
                    return res.status(201).json({ message: "Class Updated" })
                } else {
                    return res.status(404).json({ message: "Class Not found" })
                }
            } else {
                return res.status(404).json({ message: "Month and Year Not found" })
            }
        }
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}


exports.deleteClass = async (req, res) => {
    try {
        const student = req.params.id
        const { month, year, date, id } = req.body
        console.log(month,year,date,id)
        const level = await ClassDescription.findOne({ student })
        if (!level) {
            return res.status(404).json({ message: "Student Not found" })
        } else {
            const checkMonth = level.classes.filter(data => data.month == month && data.year == year)
            if (checkMonth.length > 0) {
                let classData = checkMonth[0].class.find(item => item.date == date && item._id == id)
                if (classData) {
                    checkMonth[0].class = checkMonth[0].class.filter(item => item._id != id)
                    await ClassDescription.updateOne({ student }, { classes: level.classes })
                    return res.status(201).json({ message: "Class Deleted" })
                } else {
                    return res.status(404).json({ message: "Class Not found" })
                }
            } else {
                return res.status(404).json({ message: "Month and Year Not found" })
            }
        }
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }


}