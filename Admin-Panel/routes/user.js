const express = require('express');
const router = express.Router();

router.get('/profile', isLoggedIn, (req, res, next) => {
    res.render('user/profile');
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
};

module.exports = router;