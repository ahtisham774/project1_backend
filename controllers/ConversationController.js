
const multer = require('multer');
const ConversationItem = require('../models/ConversationItem');

// Multer configuration for audio file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/audio');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Middleware functions for CRUD operations on Conversation model

// Create a new conversation
const createConversation = (req, res) => {
    // Handle audio file upload and save conversation data to database
    // ...
};

// Get all conversations
const getAllConversations = (req, res) => {
    // Retrieve all conversations from database
    // ...
};

// Get a conversation by ID
const getConversationById = (req, res) => {
    // Retrieve a conversation by ID from database
    // ...
};

// Update a conversation by ID
const updateConversationById = async (req, res) => {
    const { id } = req.params;
    const { name, text, translation } = req.body;

    try {
        // Validate that the provided ID is a valid MongoDB ObjectId


        // Find the conversation item by ID and update its properties
        const updatedConversationItem = await ConversationItem.findByIdAndUpdate(
            id,
            { name, text, translation },
            { new: true } // Return the updated document
        );

        // Check if the item was found and updated
        if (!updatedConversationItem) {
            return res.status(404).json({ error: "Conversation item not found" });
        }

        // Respond with the updated conversation item
        res.json(updatedConversationItem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Delete a conversation by ID
const deleteConversationById = async (req, res) => {
    const { criteria } = req.body;

    try {
        // Use the deleteMany method to delete items based on the provided criteria
        const result = await ConversationItem.deleteMany(criteria);

        // Check if any items were deleted
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "No matching conversation items found" });
        }

        // Respond with a success message or any other relevant information
        res.json({ message: `${result.deletedCount} conversation items deleted successfully` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const audio = upload.single("audio")


module.exports = {
    createConversation,
    getAllConversations,
    getConversationById,
    updateConversationById,
    deleteConversationById,
    audio
};
