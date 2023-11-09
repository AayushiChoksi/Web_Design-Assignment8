const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/usersdb');


const userSchema = new mongoose.Schema({
    fullName: {
      type: String,
      required: true,
      validate: {
        validator: (fullName) => /^[a-zA-Z\s]*$/.test(fullName),
        message: 'Invalid full name format. Full name should not contain digits or special characters.',
      },
    },
    email: {
      type: String,
      unique: true,
      required: true,
      validate: {
        validator: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
        message: 'Invalid email format. Please provide a valid email address (e.g., user@example.com).',
      },
    },
    password: {
        type: String,
        required: true,
        validate: {
          validator: (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password),
          message: 'Password must contain at least one lowercase letter, one uppercase letter, one digit, and be at least 8 characters long.',
        },
      },
    });
  

const User = mongoose.model('User', userSchema);

// User Creation Endpoint
app.post('/users/create', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Hash the password before saving to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).send('User created successfully');
  } catch (error) {
    res.status(400).send(error.message);
  }
});


app.put('/users/edit', async (req, res) => {
    try {
      const { email, fullName, password } = req.body;
  
      
      const existingUser = await User.findOne({ email });
  
      if (!existingUser) {
        return res.status(404).send('User not found');
      }
  
 
      existingUser.fullName = fullName;
  
      
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUser.password = hashedPassword;
      }
  
      await existingUser.save();
  
      res.status(200).send('User updated successfully');
    } catch (error) {
      res.status(400).send(error.message);
    }
  });
  
  app.delete('/users/delete', async (req, res) => {
    try {
      const { email } = req.body;
  
  
      const deletedUser = await User.findOneAndDelete({ email });
  
      if (!deletedUser) {
        return res.status(404).send('User not found');
      }
  
      res.status(200).send('User deleted successfully');
    } catch (error) {
      res.status(400).send(error.message);
    }
  });


app.get('/users/getAll', async (req, res) => {
  try {
    
    const allUsers = await User.find({}, 'fullName email password');

    res.status(200).json(allUsers);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
