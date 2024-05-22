
const StudentGoals = require('../models/StudentGoals');


exports.assignGoals = async (req, res) => {
    try {
        const { title, isDone } = req.body
        const student = req.params.id
        const level = await StudentGoals.findOne({ student })
        if (!level) {
            const newLevel = new StudentGoals({
                student,
                goals: [
                    {
                        title,
                        isDone,
                    }
                ]
            })
            await newLevel.save()
            return res.status(200).json({ message: "Goals Assigned" })
        } else {
            level.goals.push(
                {
                    title,
                    isDone
                }
            )
            await level.save()
            return res.status(200).json({ message: "Goals Assigned" })

        }
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

exports.getGoals = async (req, res) => {
    try {
        const student = req.params.id
        const level = await StudentGoals.findOne({ student });
        if (!level) {
            return res.status(404).json({ message: "Student Not found" })
        } else {
            return res.status(200).json(level)
        }
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
};


exports.deleteGoal = async (req, res) => {
    try {
        const student = req.params.id
        const index = req.body.goal;
        const level = await StudentGoals.updateOne({ student }, { $pull: { goals: { _id: index } } })
       
        if (!level) {

            return res.status(404).json({ message: "Student Not found" })
        }
        return res.status(200).json({ message: "Goal Deleted" })
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
};

exports.updateGoal = async (req, res) => {
    try {
        const student = req.params.id
        const id = req.body.goal;
        const level = await StudentGoals.findOne({ student})
        if (!level) {
            return res.status(404).json({ message: "Student Not found" })
        } else {
            const goal = level.goals.id(id)
            goal.isDone = !goal.isDone
            await level.save()
            return res.status(200).json({ message: "Goal Updated" })
        }
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}