
const mongoose = require('mongoose');

const trackingSchema = new mongoose.Schema({

    name: {
        type: String,
    }
    , dueDate: {
        type: Date,
    },
    isDone: {
        type: Boolean,
        default: false
    },
    isCancel:{
        type:Boolean,
        default:false
    }


});

const Tracking = mongoose.model('Tracking', trackingSchema);

module.exports = Tracking;
