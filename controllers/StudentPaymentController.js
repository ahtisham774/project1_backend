const StudentPayment = require('../models/studentPayment')


exports.createPaymentCard = async (req, res) => {
    try {
        const { student } = req.params

        const checkStudent = await StudentPayment.findOne({ student })

        if (checkStudent) {
            checkStudent.payments.push({
                classes: [],
                status: 'inprogress'
            })
            await checkStudent.save()
            return res.status(201).json({ message: 'Payment Card Created' })
        }

        const payment = new StudentPayment({
            student,
            payments: [
                {
                    classes: [],
                    status: 'inprogress'
                }
            ]
        })
        await payment.save()
        res.status(201).json({ message: 'Payment Card Created' })
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
}

exports.getPaymentCards = async (req, res) => {
    try {
        const { student } = req.params;
        const payments = await StudentPayment.findOne({ student: student });

        if (!payments) {
            return res.status(404).json({ message: "No payments found for this student" });
        }

        // Calculate total number of classes, total completed classes, and total cancelled classes for each payment card
        const newPaymentCards = payments.payments.map((card, index) => {
            const totalClasses = card.classes.length;
            const completedClasses = card.classes.filter(cl => cl.status === 'done').length;
            const cancelledClasses = card.classes.filter(cl => cl.status === 'cancel').length;

            if (card.classes.every(cl => cl.status !== 'await') && card.status === 'inprogress') {
                card.status = 'pending'
            }
            return { ...card.toObject(), name: `Payment # ${index + 1}`, totalClasses, completedClasses, cancelledClasses };
        });

        res.status(200).json({
            cancelClasses: payments.cancelClasses,
            payments:
                newPaymentCards
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.createPaymentClass = async (req, res) => {
    try {
        const { student } = req.params
        const { paymentId } = req.body
        const payment = await StudentPayment.findOne({ student })
        if (!payment) return res.status(404).json({ message: 'Payment not found' })
        let cls = payment.payments.find(cls => cls._id == paymentId)
        if (!cls) {
            cls = payment.payments.push({
                classes: [
                    {
                        status: 'await'
                    }
                ],
                status: 'inprogress'
            })
        }

        cls.classes.push({
            status: 'await'
        })
        await payment.save()
        res.status(201).json({ message: 'Payment Class Created' })
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
}

exports.updatePaymentCard = async (req, res) => {
    try {
        const { student } = req.params
        const { paymentId, status, date } = req.body
        const payment = await StudentPayment.findOne({ student })
        if (!payment) return res.status(404).json({ message: 'Payment not found' })
        let cls = payment.payments.find(cls => cls._id == paymentId)
        if (!cls) return res.status(404).json({ message: 'Payment Card not found' })
        cls.status = status
        cls.date = date
        await payment.save()
        res.status(200).json({ message: 'Payment Card Updated' })
    }
    catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
}

exports.updatePaymentClass = async (req, res) => {
    try {
        const { student } = req.params
        const { paymentId, classId, status } = req.body
        const payment = await StudentPayment.findOne({ student })
        if (!payment) return res.status(404).json({ message: 'Payment not found' })
        let cls = payment.payments.find(cls => cls._id == paymentId)
        if (!cls) return res.status(404).json({ message: 'Payment Class not found' })
        let cl = cls.classes.find(cl => cl._id == classId)
        if (!cl) return res.status(404).json({ message: 'Class not found' })
        cl.status = status
        await payment.save()
        res.status(200).json({ message: 'Payment Class Updated' })
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
}

exports.deletePaymentCard = async (req, res) => {
    try {
        const { student } = req.params
        const { paymentId } = req.body
        console.log(paymentId)
        const payment = await StudentPayment.findOne({ student })
        if (!payment) return res.status(404).json({ message: 'Payment not found' })
        payment.payments = payment.payments.filter(cls => cls._id != paymentId)
        await payment.save()
        res.status(200).json({ message: 'Payment Card Deleted' })
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
}

exports.deletePaymentClass = async (req, res) => {
    try {
        const { student } = req.params
        const { paymentId, classId } = req.body
        const payment = await StudentPayment.findOne({ student })
        if (!payment) return res.status(404).json({ message: 'Payment not found' })
        let cls = payment.payments.find(cls => cls._id == paymentId)
        if (!cls) return res.status(404).json({ message: 'Payment Card not found' })
        cls.classes = cls.classes.filter(cl => cl._id != classId)
        await payment.save()
        res.status(200).json({ message: 'Payment Class Deleted' })
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
}

exports.updatePaymentCardDate = async (req, res) => {
    try {
        const { student } = req.params
        const { paymentId, date } = req.body
        const payment = await StudentPayment.findOne({ student })
        const card = payment.payments.find(card => card._id == paymentId)
        if (!date || !isValidDate(date)) return res.status(400).json({ message: 'Invalid Date' })
        card.due_date = new Date(date)
        await payment.save()
        res.status(201).json({ message: 'Payment Card Date Updated' })
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
}

function isValidDate(d) {
    return d instanceof Date && !isNaN(d);
}

exports.updatePaymentClassDate = async (req, res) => {
    try {
        const { student } = req.params
        const { paymentId, classId, date } = req.body
        const payment = await StudentPayment.findOne({ student })
        const card = payment.payments.find(card => card._id == paymentId)
        if (!card) return res.status(404).json({ message: 'Payment Card not found' })
        const cls = card.classes.find(cls => cls._id == classId)
        cls.date = new Date(date)
        card.classes = card.classes.map(cl => cl._id == classId ? cls : cl)
        await payment.save()
        res.status(201).json({ message: 'Payment Class Date Updated' })
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
}


exports.addCancelClasses = async (req, res) => {
    try {
        const { student } = req.params
        const { cancelClasses } = req.body
        const payment = await StudentPayment
            .findOne({ student })
        if (!payment) return res.status(404).json({ message: 'Payment not found' })
        payment.cancelClasses = cancelClasses
        await payment.save()
        res.status(200).json({ message: 'Cancel Classes Added' })
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }

}