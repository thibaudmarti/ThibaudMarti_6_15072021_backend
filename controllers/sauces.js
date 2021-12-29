const Sauce = require("../models/Sauce");
const fs = require("fs");

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
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
  sauce
    .save()
    .then(() => res.status(201).json({ message: "Objet enregistré !" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.likeSauce = (req, res, next) => {
  //récupération de l userID ds le corps de la requête
  const userId = req.body.userId;

  //récupération de l'état du like (-1, 0, 1) ds le corps de la requête
  const likeState = req.body.like;

  //recherche de la Sauce concernée par l id du paramètre de la requête
  Sauce.findOne({ _id: req.params.id })
    .then((result) => {
      const sauce = result;

      //création de const pour stocker l'index de l'userId ds les tab(usersLiked ou usersDisliked)
      const indexLike = sauce.usersLiked.indexOf(userId);
      const indexDislike = sauce.usersDisliked.indexOf(userId);

      //si l'index est existant dans un des deux tableaux on supprime pour éviter les doublons
      if (indexLike > -1) {
        sauce.usersLiked.splice(indexLike, 1);
      }
      if (indexDislike > -1) {
        sauce.usersDisliked.splice(indexDislike, 1);
      }

      //si like = 1 on ajoute userID au tab usersLiked
      if (likeState === 1) {
        sauce.usersLiked.push(userId);
      }

      //si like = -1 on ajoute userID au tab usersDisliked
      if (likeState === -1) {
        sauce.usersDisliked.push(userId);
      }

      // le comptage des like et dislike est équivalent au nombre d'éléments du tab du même nom
      sauce.likes = sauce.usersLiked.length;
      sauce.dislikes = sauce.usersDisliked.length;

      //mise à jour de la Sauce avec modifications like
      Sauce.updateOne({ _id: req.params.id }, sauce)
        .then(() => res.status(200).json({ message: "likeSauce modifiée" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  Sauce.updateOne(
    { _id: req.params.id },
    { ...sauceObject, _id: req.params.id }
  )
    .then(() => res.status(200).json({ message: "Objet modifié !" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
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
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Objet supprimé !" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

exports.getAllSauce = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};
