const Reminder = require('../models/reminder')

exports.createReminder = async (req, res) => {
    try {
        const teacher = req.params.id
        const { title, dueDate, isDone } = req.body
        const reminder = await Reminder.findOne({ teacher })
        if (reminder) {
            reminder.reminders.push({
                title,
                dueDate,
                isDone
            })
            await reminder.save()
            return res.status(200).json({ message: "Reminder Created" })
        } else {
            const newReminder = new Reminder({
                teacher,
                reminders: [
                    {
                        title,
                        dueDate,
                        isDone
                    }
                ]
            })
            await newReminder.save()
            return res.status(200).json({ message: "Reminder Created" })
        }

    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

exports.getAllReminders = async (req, res) => {
    try {
        const teacher = req.params.id
        const reminders = await Reminder.findOne({ teacher })
        if (!reminders) {
            return res.status(404).json({ message: "Teacher Not found" })
        }
        return res.status(200).json(reminders)
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

exports.deleteReminder = async (req, res) => {
    try {
        const teacher = req.params.id
        const index = req.body.reminder;
        const reminder = await Reminder.findOneAndUpdate({ teacher }, { $pull: { reminders: { _id: index } } })
        if (!reminder) {
            return res.status(404).json({ message: "Teacher Not found" })
        } else {
            return res.status(200).json({ message: "Reminder Deleted" })
        }

    } catch (err) {
        return res.status(500).json({ message: err.message })
    }

}

exports.updateReminder = async (req, res) => {
    try {
        const teacher = req.params.id
        const { reminder } = req.body
        const data = await Reminder.findOne({ teacher })
        if (!data) {
            return res.status(404).json({ message: "Teacher Not found" })
        }
        const index = data.reminders.findIndex(rem => rem._id == reminder)
        data.reminders[index].isDone = !data.reminders[index].isDone
        await data.save()
        return res.status(200).json({ message: "Reminder Updated" })
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
}