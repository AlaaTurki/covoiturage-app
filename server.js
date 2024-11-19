// Importation des modules nécessaires
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes'); // Import the updated user routes
const User = require('./models/User');
const bcrypt = require('bcrypt');

// Charger les variables d'environnement
dotenv.config();

// Initialisation de l'application Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Activer CORS pour toutes les routes
app.use(bodyParser.json()); // Parser les requêtes JSON
app.use(bodyParser.urlencoded({ extended: true })); // Pour parser les données de formulaires HTML

// app.use(express.static(path.join(__dirname, 'public')));



// Configurer EJS comme moteur de vue
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Spécifier le répertoire des vues

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connecté'))
  .catch((err) => console.error('Erreur de connexion MongoDB :', err));

// Configuration des sessions
app.use(session({
  secret: process.env.JWT_SECRET, // Utiliser le secret JWT
  resave: false,
  saveUninitialized: true,
}));

// Routes
app.use('/api/users', userRoutes); // Updated user routes

// Route pour la page d'accueil
app.get('/', (req, res) => {
  res.render('index'); // Affiche la page d'accueil (index.ejs)
});

// Route pour la page d'inscription
app.get('/inscription', (req, res) => {
  res.render('inscription', { error: '', roles: ['conducteur', 'passager'] });
});

// Route POST pour gérer l'inscription via EJS
app.post('/inscription', (req, res) => {
  const { email, password, firstname, lastname, role, phone } = req.body;

  if (!email || !password || !firstname || !lastname || !role || !phone) {
    return res.render('inscription', { error: 'Tous les champs sont requis', roles: ['conducteur', 'passager'] });
  }

  User.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        return res.render('inscription', { error: 'Cet email est déjà utilisé', roles: ['conducteur', 'passager'] });
      }

      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
          console.error('Erreur de hachage du mot de passe :', err);
          return res.render('inscription', { error: 'Erreur de hachage du mot de passe', roles: ['conducteur', 'passager'] });
        }

        const newUser = new User({ email, password: hashedPassword, firstname, lastname, role, phone });

        newUser.save((err) => {
          if (err) {
            console.error('Erreur lors de l\'enregistrement de l\'utilisateur :', err);
            return res.render('inscription', { error: 'Erreur lors de l\'inscription', roles: ['conducteur', 'passager'] });
          }

          console.log('Utilisateur enregistré avec succès');
          res.redirect('/connexion');
        });
      });
    })
    .catch((err) => {
      console.error('Erreur lors de la vérification de l\'email :', err);
      res.status(500).send('Erreur serveur');
    });
});

// Route pour la page de connexion
app.get('/connexion', (req, res) => {
  res.render('connexion', { error: '' });
});

// Route POST pour gérer la connexion via EJS
app.post('/connexion', (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.render('connexion', { error: 'Email ou mot de passe incorrect' });
      }

      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          console.error('Erreur lors de la vérification du mot de passe :', err);
          return res.status(500).send('Erreur lors de la connexion');
        }

        if (!isMatch) {
          return res.render('connexion', { error: 'Email ou mot de passe incorrect' });
        }

        req.session.user = {
          id: user._id,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          role: user.role,
        };

        res.redirect('/home');
      });
    })
    .catch((err) => {
      console.error('Erreur lors de la connexion :', err);
      res.status(500).send('Erreur serveur');
    });
});

// Route pour la page d'accueil après connexion
app.get('/home', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/connexion');
  }

  res.render('home', { user: req.session.user });
});

// Route pour la déconnexion
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Erreur lors de la déconnexion');
    }

    res.redirect('/connexion');
  });
});

// Route pour la page à propos
app.get('/about', (req, res) => {
  res.render('about');
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).render('404');
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
