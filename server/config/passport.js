const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_REDIRECT_URI || "http://localhost:5000/auth/google/callback",
    passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
    try {
        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });

        const userData = {
            googleId: profile.id,
            email: profile.emails[0].value,
            displayName: profile.displayName,
            profilePicture: profile.photos[0].value,
            accessToken: accessToken,
            lastLogin: new Date()
        };

        // Only update refresh token if we got a new one
        if (refreshToken) {
            userData.refreshToken = refreshToken;
        }

        if (user) {
            // Update existing user
            user = await User.findByIdAndUpdate(user._id, userData, { new: true });
            return done(null, user);
        } else {
            // Create new user
            if (!refreshToken) {
                console.warn('No refresh token received for new user. Polling may not work offline.');
            }
            user = await User.create(userData);
            return done(null, user);
        }
    } catch (err) {
        return done(err, null);
    }
}));

module.exports = passport;
