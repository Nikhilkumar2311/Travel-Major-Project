const mongoose = require("mongoose")
const initData = require("./data.js")
const Listing = require("../models/listing.js")

const MONGO_URL = "mongodb://localhost:27017/Travel"

main().then(()=>{
    console.log("Connected To DB");
}).catch((err)=>{
    console.log(err);
})

async function main(){
    await mongoose.connect(MONGO_URL)
}

const initDB = async() => {
    await Listing.deleteMany({})
    await Listing.insertMany(initData.data)
    console.log("Data was initilized")
}

initDB()
