const express = require('express');
const { resolve } = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv').config();
const schema = require('./schema'); // Assuming schema.js is in the same directory

const app = express();
const port = 3010;

// Middleware
app.use(express.static('static'));
app.use(express.json()); // For parsing JSON bodies

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  app.listen(port, () => {
    console.log(`MongoDB connected and server running at http://localhost:${port}`);
  });
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Serve index page
app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/index.html'));
});

// Register endpoint
app.post('/register', async (req, res) => {
  const { username, mail, password } = req.body;

  if (!username || !mail || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new schema({
      username,
      mail,
      password: hashedPassword
    });

    await newUser.save();
    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint
app.post('/login', async(req,res) => {
  const { mail, password } = req.body;
  if(!mail || !password){
    return res.status(400).send({ message:"All fields are required" });
  }
  try {
    const user = await schema.findOne({mail});
    if(!user){
      return res.status(404).send({ message:"Register first "});
    }
    const correctPassword = bcrypt.compareSync(password, user.password);
    if(!correctPassword){
      return res.status(404).send({ message:"Password is incorrect" });
    }

    return res.status(201).send({ message:"Successfully logged in "});

  } catch (error) {
    console.log(error);
    return res.status(500).send({ message:"Something went wrong "});
  }
});