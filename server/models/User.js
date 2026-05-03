const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    googleId: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    displayName: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String
    },
    refreshToken: {
        type: String,
        required: true
    },
    accessToken: {
        type: String
    },
    tokenExpiry: {
        type: Date
    },
    lastLogin: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
