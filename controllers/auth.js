const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const bcrypt = require("bcrypt");

// Sign up view
router.get("/sign-up", (req, res) => {
  res.render("auth/sign-up.ejs");
});

// Post new user in database
router.post("/sign-up", async (req, res) =>
{
    const userInDatabase = await User.findOne({ username: req.body.username });
if (userInDatabase) {
  return res.send("Username already taken.");
}

    if (req.body.password !== req.body.confirmPassword) {
  return res.send("Passwords must match.");
}

const hashedPassword = bcrypt.hashSync(req.body.password, 10);
req.body.password = hashedPassword;

const user = await User.create(req.body);
res.send(`Thanks for signing up ${user.username}!`);

    res.send("Your form was submitted.");
} );

// Sign in view
router.get("/sign-in", (req, res) => {
  res.render("auth/sign-in.ejs");
});

// Get from database
router.post("/sign-in", async (req, res) => {
  const userInDatabase = await User.findOne({ username: req.body.username });
  if (!userInDatabase) {
    return res.send("Login failed. Please try again.");
  }

  const validPassword = bcrypt.compareSync(
    req.body.password,
    userInDatabase.password
  );
  if (!validPassword) {
    return res.send("Login failed. Please try again.");
  }

  req.session.user = {
    username: userInDatabase.username,
    _id: userInDatabase._id
  };

  res.redirect("/");
});

// Sign out view
router.get("/sign-out", (req, res) => {
  res.send("The user wants out!");
});

router.get("/sign-out", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

module.exports = router;