const mongoose = require('mongoose');

const levelSchema = new mongoose.Schema({
    level: {
        type: String,
    },
    subjects: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject'
        }
    ],

})

const Level = mongoose.model('Level', levelSchema);
module.exports = Level;