// using bcrypt to encrypt data
const bcrypt = require("bcrypt");
// jwt is for securely exchanging information
const jwt = require("jsonwebtoken");
// import User schema
const User = require("../models/User");
// dotenv is used to hide information
require("dotenv").config();

exports.signup = (req, res, next) => {
  // encrypt password with bcrypt
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      // Create User
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      // The save method saves the new user created in the "users" collection of the database
      user
        .save()
        .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
  // find user by email, witch is unique, in the body of the request
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: "Utilisateur non trouvé !" });
      }
      // compare password between request and the user found
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ error: "Mot de passe incorrect" });
          }
          // send response for userId and token to front
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              // encrypt token
              { userId: user._id },
              process.env.TOKEN_KEY,
              {
                expiresIn: "24h",
              }
            ),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
