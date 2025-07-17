const express = require('express')
const router = express.Router()
const listings = require('../models/listing')
const isSignedIn = require('../middleware/is-signed-in')

// new - get
router.get('/new', isSignedIn, (req, res) => {
    res.render('listing/new.ejs', { user: req.session.user })
})

// new - post
router.post('/', isSignedIn, async (req, res) => {
    try {
        req.body.seller = req.session.user._id
        await listings.create(req.body)
        res.redirect('/listing')
    } catch (error) {
        console.error(error)
        res.status(500).render('error', { 
            message: 'Failed to create listing',
            user: req.session.user 
        })
    }
})

// index
router.get('/', async (req, res) => {
    try {
        const foundListings = await listings.find().populate('seller')
        res.render('listing/index.ejs', { 
            foundListings: foundListings,
            user: req.session.user 
        })
    } catch (error) {
        console.error(error)
        res.status(500).render('error', { 
            message: 'Failed to load listings',
            user: req.session.user 
        })
    }
})

// show
router.get('/:listingsId', async (req, res) => {
    try {
        const foundListing = await listings.findById(req.params.listingsId).populate('seller')
        if (!foundListing) {
            return res.status(404).render('error', { 
                message: 'Listing not found',
                user: req.session.user 
            })
        }
        res.render('listing/show.ejs', { 
            foundListing: foundListing,
            user: req.session.user 
        })
    } catch (error) {
        console.error(error)
        res.status(500).redirect('/listing')
    }
})

// delete
router.delete('/:listingsId', isSignedIn, async (req, res) => {
    try {
        const foundListing = await listings.findById(req.params.listingsId).populate('seller')
        if (!foundListing) {
            return res.status(404).render('error', { 
                message: 'Listing not found',
                user: req.session.user 
            })
        }
        if (!foundListing.seller._id.equals(req.session.user._id)) {
            return res.status(403).render('error', { 
                message: 'Not authorized',
                user: req.session.user 
            })
        }
        await foundListing.deleteOne()
        res.redirect('/listing')
    } catch (error) {
        console.error(error)
        res.status(500).render('error', { 
            message: 'Failed to delete listing',
            user: req.session.user 
        })
    }
})

// edit - get
router.get('/:listingsId/edit', isSignedIn, async (req, res) => {
    try {
        const foundListing = await listings.findById(req.params.listingsId).populate('seller')
        if (!foundListing) {
            return res.status(404).render('error', { 
                message: 'Listing not found',
                user: req.session.user 
            })
        }
        if (!foundListing.seller._id.equals(req.session.user._id)) {
            return res.status(403).render('error', { 
                message: 'Not authorized',
                user: req.session.user 
            })
        }
        res.render('listing/edit.ejs', { 
            foundListing: foundListing,
            user: req.session.user 
        })
    } catch (error) {
        console.error(error)
        res.status(500).redirect('/listing')
    }
})

// edit - put
router.put('/:listingsId', isSignedIn, async (req, res) => {
    try {
        const foundListing = await listings.findById(req.params.listingsId).populate('seller')
        if (!foundListing) {
            return res.status(404).render('error', { 
                message: 'Listing not found',
                user: req.session.user 
            })
        }
        if (!foundListing.seller._id.equals(req.session.user._id)) {
            return res.status(403).render('error', { 
                message: 'Not authorized',
                user: req.session.user 
            })
        }
        await listings.findByIdAndUpdate(req.params.listingsId, req.body, { new: true })
        res.redirect(`/listing/${req.params.listingsId}`)
    } catch (error) {
        console.error(error)
        res.status(500).render('error', { 
            message: 'Failed to update listing',
            user: req.session.user 
        })
    }
})

// comments
router.post('/:listingsId/comments', async (req,res) => {
    const foundListing = await listings.findById(req.params.listingsId);
    req.body.author = req.session.user._id;
    res.send(`Posting comment on listing: ${req.params.listingsId}`);
}
)

module.exports = router