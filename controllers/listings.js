const Listing = require("../models/listing")
const axios = require('axios');
const User = require("../models/user")

// Index
module.exports.index = async (req, res) => {
    const { category } = req.query;
    const filter = category ? { category } : {};

    const listings = await Listing.find(filter);

    // Detect AJAX requests via headers
    if (req.xhr) {
        return res.render("./listings/index.ejs", { allListings: listings, layout: false }); 
    }

    // Standard page rendering for normal requests
    res.render("./listings/index.ejs", { allListings: listings });
};


// search
module.exports.search = async (req, res) => {
    const { query } = req.query;
    const filter = query
        ? { $or: [
                { location: { $regex: query, $options: 'i' } },
                { country: { $regex: query, $options: 'i' } }
            ] }
        : {};

    const searchedListings = await Listing.find(filter);
    res.render('./listings/search.ejs', { searchedListings, query });
};


// New
module.exports.renderNewForm = async(req, res) => {
    res.render("./listings/new.ejs")
}

// show
module.exports.showListing = async(req, res) => {
    let {id} = req.params
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews", 
            populate:{
                path: "author"
            },
        })
        .populate("owner")
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist!!")
        res.redirect("/listings")
    }

    const { coordinates } = listing.geometry;
    const lat = coordinates[1];
    const lon = coordinates[0];

    res.render("./listings/show.ejs", {listing, lat, lon})
}

// Create
module.exports.createListing = async (req, res, next) => {
    const { location } = req.body.listing;

    const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;

    try {
        const response = await axios.get(geocodeUrl);

        if (response.data && response.data.length > 0) {
            const { lat, lon } = response.data[0];

            console.log(`Latitude: ${lat}, Longitude: ${lon}`);

            const newListing = new Listing(req.body.listing);
            newListing.owner = req.user._id;

            if (req.file) {
                newListing.image = {
                    url: req.file.path,
                    filename: req.file.filename
                };
            }

            newListing.geometry = {
                type: "Point",
                coordinates: [lon, lat]
            };

            let saved = await newListing.save();
            console.log(saved);

            req.flash("success", "New Listing Created!!");
            return res.redirect("/listings");

        } else {
            console.log("Geocoding failed.");
            req.flash("error", "Could not retrieve coordinates.");
            return res.redirect("/listings");
        }

    } catch (error) {
        console.error("Error during geocoding:", error);
        req.flash("error", "Error retrieving coordinates.");
        return res.redirect("/listings");
    }
};

// Edit
module.exports.renderEditForm = async(req, res) => {
    let {id} = req.params
    const listing = await Listing.findById(id)
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist!!")
        res.redirect("/listings")
    }

    let originalImageUrl = listing.image.url
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_300")
    res.render("./listings/edit.ejs", {listing, originalImageUrl})
}

// Update
module.exports.updateListing = async(req,res) => {
    let {id} = req.params
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing})

    if(typeof req.file !== "undefined"){
        let url = req.file.path
        let filename = req.file.filename
        listing.image = { url, filename }
        await listing.save()
    }

    req.flash("success", "Listing Updated!!")
    res.redirect(`/listings/${id}`)
}

// Email verification
module.exports.emailVerification = async (req, res) => {
    const { token } = req.query;

    if (!token) {
        req.flash("error", "Invalid verification link.");
        return res.redirect("/signup");
    }

    try {
        // Find user by verification token
        const user = await User.findOne({ verificationToken: token });
        if (!user) {
            req.flash("error", "Invalid or expired verification token.");
            return res.redirect("/signup");
        }

        // Mark user as verified
        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        req.flash("success", "Your email has been verified. You can now log in.");
        res.redirect("/login");
    } catch (e) {
        req.flash("error", "An error occurred during email verification.");
        res.redirect("/signup");
    }
}

// delete
module.exports.deleteListing = async(req, res) => {
    let {id} = req.params
    let deletedListing = await Listing.findByIdAndDelete(id)
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!!")
    res.redirect("/listings")
}
