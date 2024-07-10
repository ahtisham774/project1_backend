const StudentHomework = require("../models/StudentHomework")

exports.assignHomework = async (req, res) => {
    try {
        const { month, year, title, link, description, dueDate, isDone, percentage } = req.body
        const student = req.params.id
        const level = await StudentHomework.findOne({ student })
        const document = req?.file ? req?.file?.filename : ""
        if (!level) {

            const newLevel = new StudentHomework({
                student,
                homeworks: [
                    {
                        month,
                        year,
                        homework: [
                            {
                                title,
                                link,
                                studentDownload: document,
                                description,
                                dueDate,
                                isDone,
                                percentage
                            }
                        ]
                    }
                ]
            })
            await newLevel.save()
            return res.status(200).json({ message: "Homework Assigned" })
        } else {
            // check if month and year already exists
            const checkMonth = level.homeworks.filter(data => data.month.toLowerCase() == month.toLowerCase() && data.year == year)
            if (checkMonth.length > 0) {
                // update the month and year data
                // let homework = checkMonth[0].homework.find(item => item.link === link && item.title === title)
                // if (homework) {
                //     homework.title = title || homework.title;
                //     homework.link = link || homework.link;
                //     homework.dueDate = dueDate || homework.dueDate;
                //     homework.isDone = isDone || homework.isDone;
                //     homework.percentage = percentage || homework.percentage;
                // }
                // else {
                checkMonth[0].homework.push({
                    title,
                    link,
                    dueDate,
                    isDone,
                    percentage
                })
                // }
                await StudentHomework.updateOne({
                    student
                }, {
                    homeworks: level.homeworks
                })
                return res.status(201).json({ message: "Homework Updated" })
            } else {
                level.homeworks.push({
                    month,
                    year,
                    homework: [{
                        title,
                        link,
                        dueDate,
                        isDone,
                        percentage
                    }]

                })
                await level.save()
                return res.status(200).json({ message: "Homework Assigned" })
            }
        }
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

exports.getHomeworks = async (req, res) => {
    try {
        const student = req.params.id
        const level = await StudentHomework.findOne({ student })
        console.log(level)
        if (!level) {
            return res.status(404).json({ message: "Student Not found" })
        }
        level.homeworks.forEach(hw => {
            hw.homework.sort((a, b) => a.isDone - b.isDone)
            // .sort((a, b) => new Date(b.date_created) - new Date(a.date_created))
            ;
        })

        return res.status(200).json(level)

    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}
exports.getHomeworkByMonth = async (req, res) => {
    try {
        const student = req.params.id;
        const { month, year } = req.body;

        const homework = await StudentHomework.findOne({ student });

        if (!homework) {
            return res.status(404).json({ message: "Homework not found for the given student" });
        }

        // Find homework for the specific month and year
        const filteredHomework = homework.homeworks.find(h => h.month.toLowerCase() === month.toLowerCase() && h.year == year);

        if (!filteredHomework) {
            return res.status(404).json({ message: `Homework not found for ${month}, ${year}` });
        }

        return res.status(200).json(filteredHomework);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};


//marks a homework as done or not done
exports.markHomework = async (req, res) => {
    try {
        let { hwId, month, year, condition } = req.body

        const student = req.params.id
        const level = await StudentHomework.findOne({ student })

        if (!level) {
            return res.status(404).json({ message: "Homework Not found" })
        } else {
            // check if homework already exists
            const checkHomework = level.homeworks.filter(data => data.month.toLowerCase() == month.toLowerCase() && data.year == year)[0].homework.filter(item => item._id == hwId)

            if (checkHomework.length > 0) {
                // update the homework data
                if (condition === "done") {
                    checkHomework[0].isDone = !checkHomework[0].isDone;
                    checkHomework[0].status = "approved";

                }
                else if (condition === "pending") {
                    checkHomework[0].status = "pending";
                    checkHomework[0].isDone = false;

                }
                else if (condition === "percentage") {
                    checkHomework[0].percentage = req.body.percentage - 0;
                }
                await StudentHomework.updateOne({ student }, { homeworks: level.homeworks })
            } else {
                return res.status(404).json({ message: "Homework Not found" })
            }
            return res.status(200).json({ message: "Homework Marked" })
        }
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

exports.updateHomework = async (req, res) => {
    try {
        let { hwId, month, year, title, link, description, dueDate, isDone, percentage } = req.body
        const student = req.params.id
        const level = await StudentHomework.findOne({ student })
        const document = req?.file ? req?.file?.filename : ""
        if (!level) {
            return res.status(404).json({ message: "Homework Not found" })

        } else {
            // check if homework already exists
            const checkHomework = level.homeworks.filter(data => data.month.toLowerCase() == month.toLowerCase() && data.year == year)[0].homework.filter(item => item._id == hwId)
            if (checkHomework.length > 0) {
                // update the homework data
                checkHomework[0].title = title || checkHomework[0].title;
                checkHomework[0].link = link || checkHomework[0].link;
                checkHomework[0].description = description || checkHomework[0].description;
                checkHomework[0].dueDate = dueDate || checkHomework[0].dueDate;
                checkHomework[0].isDone = isDone || checkHomework[0].isDone;
                checkHomework[0].percentage = percentage || checkHomework[0].percentage;
                checkHomework[0].studentDownload = document || checkHomework[0].studentDownload;
                await StudentHomework.updateOne({ student }, { homeworks: level.homeworks })
            } else {
                return res.status(404).json({ message: "Homework Not found" })
            }
            return res.status(200).json({ message: "Homework Updated", homework: checkHomework[0] })
        }
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}
exports.uploadDocument = async (req, res) => {
    try {
        let { hwId, month, year } = req.body
        const student = req.params.id
        const level = await StudentHomework.findOne({ student })
        const document = req?.file ? req?.file?.filename : ""
        if (!level) {
            return res.status(404).json({ message: "Homework Not found" })

        } else {
            // check if homework already exists
            const checkHomework = level.homeworks.filter(data => data.month.toLowerCase() == month.toLowerCase() && data.year == year)[0].homework.filter(item => item._id == hwId)
            if (checkHomework.length > 0) {
                // update the homework data
                checkHomework[0].teacherDownload = document || checkHomework[0].teacherDownload;
                await StudentHomework.updateOne({ student }, { homeworks: level.homeworks })
            } else {
                return res.status(404).json({ message: "Homework Not found" })
            }
            return res.status(200).json({ message: "Document Upload" })
        }
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

exports.deleteHomework = async (req, res) => {
    try {
        let { hwId, month, year } = req.body
        const student = req.params.id
        const level = await StudentHomework.findOne({ student })
        if (!level) {
            return res.status(404).json({ message: "Homework Not found" })
        }
        else {
            // check if homework already exists
            const checkHomework = level.homeworks.filter(data => data.month.toLowerCase() == month.toLowerCase() && data.year == year)[0].homework.filter(item => item._id == hwId)
            if (checkHomework.length > 0) {
                // update the homework data
                level.homeworks.filter(data => data.month.toLowerCase() == month.toLowerCase() && data.year == year)[0].homework = level.homeworks.filter(data => data.month.toLowerCase() == month.toLowerCase() && data.year == year)[0].homework.filter(item => item._id != hwId)
                await StudentHomework.updateOne({ student }, { homeworks: level.homeworks })
            } else {
                return res.status(404).json({ message: "Homework Not found" })
            }
            return res.status(200).json({ message: "Homework Deleted" })
        }
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}