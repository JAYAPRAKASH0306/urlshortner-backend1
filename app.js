const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const shortid = require('shortid');
const cors = require('cors');
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors()); 


mongoose.connect(process.env.Db, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(()=>{
    console.log("db connected")
});

// Define the ShortURL schema
const shortURLSchema = new mongoose.Schema({
  shortCode: {
    type: String,
    required: true,
    default: shortid.generate,
  },
  longURL: {
    type: String,
    required: true,
  },
});

// Define the ShortURL model
const ShortURL = mongoose.model('ShortURL', shortURLSchema);

// API route to create a short URL
app.post('/shorturl', async (req, res) => {
  const { url } = req.body;

  try {
    const newURL = new ShortURL({
      longURL: url,
    });

    await newURL.save();
    
    res.json({ shortURL: `https://urlshortnerbackend-87il.onrender.com/shorturl${newURL.shortCode}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API route to redirect to original URL
app.get('/:shortCode', async (req, res) => {
  const shortCode = req.params.shortCode;

  try {
    const url = await ShortURL.findOne({ shortCode });

    if (url) {
      res.redirect(url.longURL);
    } else {
      res.status(404).json({ error: 'URL not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});