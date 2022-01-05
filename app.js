// import express
const express = require("express");
// import mongoose
const mongoose = require("mongoose");

// path for routes
const saucesRoutes = require("./routes/sauces");
const userRoutes = require("./routes/user");
const path = require("path");
// import morgan
const morgan = require("morgan");
// import and config dotenv
require("dotenv").config();
// import helmet
const helmet = require("helmet");

// connection with database
mongoose
  .connect(process.env.CONNECT_MDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

const app = express();

app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

app.use(morgan("dev"));

// CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

// method to parse the request body as a JSON object (POST)
app.use(express.json());

// static image resource management
app.use("/images", express.static(path.join(__dirname, "images")));

// routes
app.use("/api/sauces", saucesRoutes);
app.use("/api/auth", userRoutes);

module.exports = app;
