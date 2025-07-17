const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const MongoStore = require("connect-mongo");

const authController = require('./controllers/auth.js');
const listingController = require ("./controllers/listingController.js");
const isSignedIn = require("./middleware/is-signed-in.js");
const passUserToView = require("./middleware/pass-user-to-view.js");

app.use(express.static(path.join(__dirname, 'public')))

const port = process.env.PORT ? process.env.PORT : '3000';

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(morgan('dev'));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
  })
);
app.use(passUserToView);

app.get('/', (req, res) => {
  res.render('index.ejs', {
    user: req.session.user,
  });
});

app.use(
  "/vip-lounge",
  (req, res, next) => {
    if (req.session.user) {
      res.locals.user = req.session.user; 
      next(); 
    } else {
      res.redirect("/");
    }
  },
);

app.get("/vip-lounge", isSignedIn, (req, res) => {
  res.send(`Welcome to the party ${req.session.user.username}.`);
});

app.use('/auth', authController);
app.use('/listing', listingController)

app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
});