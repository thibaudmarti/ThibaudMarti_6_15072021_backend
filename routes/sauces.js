// create router
const express = require("express");
const router = express.Router();

// import routes for sauces
const saucesCtrl = require("../controllers/sauces");
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

// path for authentication, management of incoming files and associated processing
router.post("/", auth, multer, saucesCtrl.createSauce);
router.put("/:id", auth, multer, saucesCtrl.modifySauce);
router.post("/:id/like", auth, saucesCtrl.likeSauce);
router.delete("/:id", auth, saucesCtrl.deleteSauce);
router.get("/:id", auth, saucesCtrl.getOneSauce);
router.get("/", auth, saucesCtrl.getAllSauce);

module.exports = router;
