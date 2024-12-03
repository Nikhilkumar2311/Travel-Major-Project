const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js")
const Listing = require("../models/listing.js")
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js")
const listingController = require("../controllers/listings.js")


// Index Route
router.get("/", wrapAsync(listingController.index))

// New Route
router.get("/new",isLoggedIn, wrapAsync(listingController.renderNewForm))

// Show Route
router.get("/:id", wrapAsync(listingController.showListing))

// Create Route
router.post("/", isLoggedIn, validateListing, wrapAsync(listingController.createListing))

// Edit Route
router.get("/:id/edit", isOwner, isLoggedIn, wrapAsync(listingController.renderEditForm))

// Update Route
router.put("/:id", isOwner, isLoggedIn, validateListing, wrapAsync(listingController.updateListing))

// Delete Route
router.delete("/:id", isOwner, isLoggedIn, wrapAsync(listingController.deleteListing))

module.exports = router;

