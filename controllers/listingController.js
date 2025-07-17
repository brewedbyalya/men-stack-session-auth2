const express = require('express')
const router = express.Router()
const listings = require('../models/listing')
const isSignedIn = require('../middleware/is-signed-in')


// new - get
router.get('/new', isSignedIn, (req, res) => {
    res.render('listing/new.ejs')
})

// new - post
router.post('/', isSignedIn, async (req, res) => {
    try {
        req.body.seller = req.session.user._id
        await listings.create(req.body)
        res.redirect('/listing')
    } catch (error) {
        console.log(error)
        res.send('Something went wrong')
    }
})

// index
router.get('/', async (req, res) => {
    const foundListings = await listings.find()
    console.log(foundListings)
    res.render('listing/index.ejs', { foundListings: foundListings })
})

// show
router.get('/:listingsId', async (req, res) => {
    try {
        const foundListing = await listings.findById(req.params.listingsId).populate('seller').populate('comments.author')
        console.log(foundListing)
        res.render('listing/show.ejs', { foundListing: foundListing })
    } catch (error) {
        console.log(error)
        res.redirect('/')
    }
})

// delete
router.delete('/:listingId', isSignedIn, async (req, res) => {
    const foundListing = await listings.findById(req.params.listingsId).populate('seller')
    if (foundListing.seller._id.equals(req.session.user._id)) {
        await foundListing.deleteOne()
        return res.redirect('/listing')
    }
    return res.send('Not authorized')
})

// edit
router.get('/:listingsId/edit', isSignedIn, async (req, res) => {
    const foundListing = await listings.findById(req.params.listingsId).populate('seller')

    if (foundListing.seller._id.equals(req.session.user._id)) {
        return res.render('listing/edit.ejs', { foundListing: foundListing} )
    } 
        return res.send('Not authorized')
   

})

router.put('/:listingsId', isSignedIn, async (req, res) => {
    const foundListing = await listings.findById(req.params.listingsId).populate('seller')
    if (foundListing.seller._id.equals(req.session.user._id)) {
        await listings.findByIdAndUpdate(req.params.listingsId, req.body, { new: true })
        return res.redirect(`/listing/${req.params.listingsId}`)
    } 
        return res.send('Not authorized')
   
})

// comment
router.post('/:listingsId/comments', isSignedIn, async (req, res) => {
    const foundListing = await listings.findById(req.params.listingsId)
    req.body.author = req.session.user._id
    console.log(req.body)
    foundListing.comments.push(req.body)
    await foundListing.save()
    res.redirect(`/listing/${req.params.listingsId}`)
})

module.exports = router