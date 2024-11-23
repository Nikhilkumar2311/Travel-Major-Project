const express = require("express")
const app = express()
const mongoose = require("mongoose")
const Listing = require("../Travels/models/listing.js")
const path = require("path")

const MONGO_URL = "mongodb://localhost:27017/Travel"

main().then(()=>{
    console.log("Connected To DB");
}).catch((err)=>{
    console.log(err);
})

async function main(){
    await mongoose.connect(MONGO_URL)
}

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))
app.use(express.urlencoded({extended: true}))

app.get("/", (req,res)=>{
    res.send("Hi, I am root")
})

// Index Route
app.get("/listings", async(req, res) => {
    const allListings = await Listing.find({})
    res.render("./listings/index.ejs", {allListings})
})

// New Route
app.get("/listings/new", async(req, res) => {
    res.render("./listings/new.ejs")
})

// Show Route
app.get("/listings/:id", async(req, res) => {
    let {id} = req.params
    const listing = await Listing.findById(id)
    res.render("./listings/show.ejs", {listing})
})

// Create Route
app.post("/listings", async(req, res) => {
    const newListing = new Listing(req.body.listing)
    await newListing.save()
    res.redirect("/listings")
})


// app.get("/testListing", async(req, res)=>{
//     let sampleListing = new Listing({
//         title: "My New Villa",
//         description: "by the lake",
//         price: 1200,
//         location: "Deheradun, UK",
//         country: "India"
//     })

//     await sampleListing.save()
//     console.log("Sample was Saved");
//     res.send("Successful")
// })

app.listen(8080, (req,res)=>{
    console.log("App is listning")
})

