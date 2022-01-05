// Import Sauce model
const Sauce = require("../models/Sauce");

// File system module
const fs = require("fs");

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  // Create new Sauce
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
  });
  // The save method saves the new sauce created in the "sauces" collection of the database
  sauce
    .save()
    .then(() => res.status(201).json({ message: "Objet enregistré !" }))
    .catch((error) => res.status(400).json({ error }));
};

// Likes
exports.likeSauce = (req, res, next) => {
  // Retrieving userID in the body of the request
  const userId = req.body.userId;
  // Retrieving like state in the body of the request
  const likeState = req.body.like;

  // Use findOne method to find the sauce which has the same ID as the request
  Sauce.findOne({ _id: req.params.id })
    .then((result) => {
      const sauce = result;
      // Const for store index of userId
      const indexLike = sauce.usersLiked.indexOf(userId);
      const indexDislike = sauce.usersDisliked.indexOf(userId);

      // if userId is already in array usersLiked or usersDisliked so userId is remove to avoid duplicates
      if (indexLike > -1) {
        sauce.usersLiked.splice(indexLike, 1);
      }
      if (indexDislike > -1) {
        sauce.usersDisliked.splice(indexDislike, 1);
      }

      // if like = 1 add userId in array usersLiked
      if (likeState === 1) {
        sauce.usersLiked.push(userId);
      }
      // if like = -1 add userId in array usersDisliked
      if (likeState === -1) {
        sauce.usersDisliked.push(userId);
      }

      // Number of likes or dislikes is equal to array usersLiked or usersDisliked length
      sauce.likes = sauce.usersLiked.length;
      sauce.dislikes = sauce.usersDisliked.length;

      // Update sauce with like
      Sauce.updateOne({ _id: req.params.id }, sauce)
        .then(() => res.status(200).json({ message: "Sauce modifiée !" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) => {
  // Check if file exist
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        // If needed, update image
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : // If needed, update the body of the request
      { ...req.body };

  // Remove the former image from the "images" directory
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (!sauce) {
        return res.status(404).json({
          error: new Error("Objet non trouvé !"),
        });
      }
      if (sauce.userId !== req.auth.userId) {
        return res.status(401).json({
          error: new Error("Requête non autorisée !"),
        });
      }
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        // Then update the sauce with the right content
        Sauce.updateOne(
          { _id: req.params.id },
          { ...sauceObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Objet modifié !" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
  // Find the sauce by Id
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (!sauce) {
        return res.status(404).json({
          error: new Error("Objet non trouvé !"),
        });
      }
      if (sauce.userId !== req.auth.userId) {
        return res.status(401).json({
          error: new Error("Requête non autorisée !"),
        });
      }
      // store image filename to delete
      const filename = sauce.imageUrl.split("/images/")[1];
      // remove image from the "images" directory
      fs.unlink(`images/${filename}`, () => {
        // Then delete the sauce in database
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Objet supprimé !" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  //Use findOne method to get one sauce which has the same ID as the request
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

exports.getAllSauce = (req, res, next) => {
  // Use find method to return an array of all the sauces in the database
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};
