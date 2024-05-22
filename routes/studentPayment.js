const express = require('express');
const router = express.Router();
const StudentPaymentController = require('../controllers/StudentPaymentController');

router.post('/:student/create-card', StudentPaymentController.createPaymentCard);
router.get('/:student/get-cards', StudentPaymentController.getPaymentCards);
router.put('/:student/update-payment', StudentPaymentController.updatePaymentCard);
// router.put('/:student/update-payment-date', StudentPaymentController.updatePaymentCardDate);
router.put('/:student/delete-payment', StudentPaymentController.deletePaymentCard);

router.post('/:student/create-class', StudentPaymentController.createPaymentClass);
router.put('/:student/update-class', StudentPaymentController.updatePaymentClass);
router.put('/:student/update-class-date', StudentPaymentController.updatePaymentClassDate);
router.put('/:student/delete-class', StudentPaymentController.deletePaymentClass);
router.put('/:student/cancel-classes', StudentPaymentController.addCancelClasses);



module.exports = router;