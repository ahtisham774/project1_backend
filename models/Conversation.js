const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema({
    audio: {
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
});

const Conversation = mongoose.model("Conversation", ConversationSchema);

module.exports = Conversation;
