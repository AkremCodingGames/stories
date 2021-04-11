const express = require('express')
const router = express.Router()
const { ensureAuth, ensureGuest} = require('../middleware/auth')

const Story = require('../models/Story')

// @desc    Login/Landing page
// @route   GET /
router.get('/', ensureGuest, (req, res) => {
    // res.send('Login')
    res.render('login', {
        layout: 'login'
    })
})

// @desc    Deshboard
// @route   GET /dashboard
router.get('/dashboard', ensureAuth, async (req, res) => {
    // res.send('Dashboard')
    try { // similar code in passport.js
        const stories = await Story.find({ user: req.user.id }).lean();
        // lean: mongoosejs.com/docs/tutorials/lean.html
        res.render('dashboard', {
            name: req.user.firstName,
            stories
        }) // auto use of main layout.
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})

module.exports = router