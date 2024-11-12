const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const { GridFsStorage } = require('multer-gridfs-storage');
const Grid = require('gridfs-stream'); // Import Grid here

// MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.3.3", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
    // Initialize GridFS Stream *after* successful connection
    gfs = Grid(mongoose.connection.db, mongoose.mongo);
    gfs.collection('uploads'); // Set the GridFS bucket name
  })
  .catch(err => console.error('Error connecting to MongoDB:', err));


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Store uploaded images in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Unique filename
  }
});

const upload = multer({ storage: storage });
const app = express();
const port = 3000;
// Define your Mongoose schema (example)
const imageSchema = new mongoose.Schema({
  name: String,
  imagePath: String // Store the path to the image
});

const Image = mongoose.model('Image', imageSchema);

// Route to handle image upload
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const newImage = new Image({
      name: req.body.name, // Assuming you send an 'name' field
      imagePath: '/uploads/' + req.file.filename // Store the relative path
    });

    await newImage.save();
    res.json({ message: 'Image uploaded successfully', image: newImage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Image upload failed' });
  }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
