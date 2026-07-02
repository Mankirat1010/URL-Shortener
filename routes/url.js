const express = require('express');

const {
    handelGenerateNewShortURL,
    handleGetAnalytics,
    handleDeleteURL,
} = require('../controllers/url');

const router = express.Router();

router.post('/', handelGenerateNewShortURL);
router.get('/analytics/:shortId', handleGetAnalytics);
router.post('/delete/:id', handleDeleteURL);

module.exports = router;