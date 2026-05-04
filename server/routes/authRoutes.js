const express = require('express');
const passport = require('passport');
const router = express.Router();

// @desc    Auth with Google
// @route   GET /auth/google
router.get('/auth/google', passport.authenticate('google', {
    scope: [
        'profile', 
        'email', 
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.modify'
    ],
    accessType: 'offline',
    prompt: 'select_account consent' // Forces Google to show account picker and provide a refresh token
}));

// @desc    Google auth callback
// @route   GET /oauth2callback
router.get('/oauth2callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        // Successful authentication, redirect to dashboard.
        const redirectUrl = process.env.SOCKET_CORS_ORIGIN || 'http://localhost:3000';
        res.redirect(`${redirectUrl}/dashboard`);
    }
);

// @desc    Logout user
// @route   GET /auth/logout
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        const redirectUrl = process.env.SOCKET_CORS_ORIGIN || 'http://localhost:3000';
        res.redirect(redirectUrl);
    });
});

// @desc    Get current user
// @route   GET /auth/user
router.get('/user', (req, res) => {
    if (req.user) {
        res.json({
            success: true,
            user: {
                id: req.user._id,
                email: req.user.email,
                displayName: req.user.displayName,
                profilePicture: req.user.profilePicture
            }
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Not authenticated'
        });
    }
});

module.exports = router;
