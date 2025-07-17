const express = require('express');
const router = express.Router();
const Listing = require("../models/listing");

// New - get
router.get("/new", (req, res)=> {
    res.render('listing/new.ejs');
});

// New - post
router.post('/', async (req, res) => {
    try {
        req.body.seller = req.session.user._id;
        console.log(req.body);
        await Listing.create(req.body);
        res.redirect('/listing');
    } catch (error) {
        console.log(error);
        res.send('Something went wrong');
    }
});

// index 
router.get("/", async (req, res) => {
    const foundListings = await Listing.find();
    console.log(foundListings);
    res.render('listing/index.ejs', { foundListings: foundListings });
});

// show
router.get('/:listingId', async (req, res) => {
    const foundListing = await Listing.findById(req.params.listingId).populate("seller");
    res.render('listing/show.ejs', { foundListing: foundListing }); 
});

module.exports = router;