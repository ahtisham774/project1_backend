const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema({
    audio: {
        type: String,
    },
    fastAudio: {
        type: String,
    },
    title: {
        type: String,
    },
    conversations: [
        {
            person1: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "ConversationItem",
            },
            person2: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "ConversationItem",
            },
        },
    ],
    records: [
        {
            studentId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Student",
                index:true,
            },
            studentName: {
                type: String,
            },
            start_time: {
                type: Date,

            },
            end_time: {
                type: Date,
            },
            audio: {
                type: String,
            },
            score: {
                type: Number,
                default: 0,
            },
            
        }
    ],
    progress: [
        {
            studentId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Student',
                index:true,
            },
            status: {
                type: String,
                default: "Not Started"
            },
            progress: {
                type: Number,
                default: 0
            },
            avg: {
                type: Number,
                default: 0
            }

        }
    ]
,
    type: {
        type: String,
        default: "simple"
    },
    order: {
        type: Number,
        default: 0
    },
});

const Conversation = mongoose.model("Conversation", ConversationSchema);

module.exports = Conversation;
