const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js")
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js")
const listingController = require("../controllers/listings.js")

const multer = require("multer")
const { storage } = require("../cloudConfig.js")
const upload = multer({storage})

// Index and Create Routes
router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn, upload.single('listing[image]'), validateListing, wrapAsync(listingController.createListing))

// New Route
router.get("/new",isLoggedIn, wrapAsync(listingController.renderNewForm))

// Search Route
router.get('/listings/search', async (req, res) => {
    const locationQuery = req.query.location || '';

    const results = await Listing.find({
        location: { $regex: locationQuery, $options: 'i' }
    }).limit(5);

    res.json(results);
});

// Show and Update and Delete Routes
router
    .route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(isOwner, isLoggedIn, upload.single('listing[image]'), validateListing, wrapAsync(listingController.updateListing))
    .delete(isOwner, isLoggedIn, wrapAsync(listingController.deleteListing))

// Edit Route
router.get("/:id/edit", isOwner, isLoggedIn, wrapAsync(listingController.renderEditForm))

module.exports = router;

