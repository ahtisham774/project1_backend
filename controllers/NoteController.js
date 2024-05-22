// Import necessary dependencies and your model
const express = require('express');
const router = express.Router();
const Note = require('../models/Notes'); // Replace with your actual model import
const multer = require('multer');
const path = require('path');
// Set up multer storage for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/notes');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });
// Create a new note
router.post('/create',upload.array('content') , async (req, res) => {
  try {
    const { title } = req.body;
    
    //get files
    let filePaths = [];
    req.files.forEach((file) => {
      filePaths.push(file.filename);
    });
    
    const newNote = new Note({ title, content:filePaths });
    await newNote.save();

    return res.status(201).json({message:"Create Successfully!"});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get all notes
router.get('/all', async (req, res) => {
  try {
    const notes = await Note.find();
    return res.status(200).json(notes);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific note by ID
router.get('/:id', async (req, res) => {
  try {
    const noteId = req.params.id;
    const note = await Note.findById(noteId);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    return res.status(200).json(note);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Update a note by ID
router.put('/:id', async (req, res) => {
  try {
    const noteId = req.params.id;
    const { title, content } = req.body;
    const updatedNote = await Note.findByIdAndUpdate(
      noteId,
      { title, content },
      { new: true }
    );

    if (!updatedNote) {
      return res.status(404).json({ message: 'Note not found' });
    }

    return res.status(200).json(updatedNote);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Delete a note by ID
router.delete('/:id', async (req, res) => {
  try {
    const noteId = req.params.id;
    const deletedNote = await Note.findByIdAndDelete(noteId);

    if (!deletedNote) {
      return res.status(404).json({ message: 'Note not found' });
    }

    return res.status(200).json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
