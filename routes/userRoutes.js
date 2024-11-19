const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User'); // Ensure the User model is correctly imported

const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
});

// Create a new user (registration)
router.post('/register', async (req, res) => {
  const { email, password, firstname, lastname, role, phone } = req.body;

  // Validate required fields
  if (!email || !password || !firstname || !lastname || !role || !phone) {
    return res.status(400).json({ message: 'Tous les champs sont requis' });
  }

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      email,
      password: hashedPassword,
      firstname,
      lastname,
      role,
      phone,
    });

    // Save the user
    const savedUser = await newUser.save();
    res.status(201).json({ message: 'Utilisateur enregistré avec succès', user: savedUser });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de l\'utilisateur :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
});

// Login a user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe requis' });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Return user details (excluding the password)
    res.status(200).json({
      message: 'Connexion réussie',
      user: {
        id: user._id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la connexion :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
});

module.exports = router;
