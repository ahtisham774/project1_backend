const mongoose = require("mongoose")

const ReadingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    paragraph: {
        type: String,

    },
    order: {
        type: Number,
        default: 99999
    },
    audio: {
        type: String,

    },
    readingGame: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz'
    },
    listeningGame: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz'
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
})
module.exports = mongoose.model("Reading", ReadingSchema)
