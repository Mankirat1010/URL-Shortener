const express = require('express');
const URL = require('../models/url');
const router = express.Router();

router.get('/', async (req, res) => {
    if (!req.user) return res.redirect('/login');

    try {
        const allurls = await URL.find({
            createdBy: req.user.id,
        });

        return res.render('home', {
            urls: allurls,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
    }
});

router.get('/signup', (req, res) => {
    return res.render('signup');
});

router.get('/login', (req, res) => {
    return res.render('login');
});

module.exports = router;