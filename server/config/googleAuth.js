const { google } = require('googleapis');

const getOAuth2Client = () => {
    const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, GOOGLE_REFRESH_TOKEN } = process.env;

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) {
        return null;
    }

    const oauth2Client = new google.auth.OAuth2(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        GOOGLE_REDIRECT_URI || 'http://localhost:5000/oauth2callback'
    );

    oauth2Client.setCredentials({
        refresh_token: GOOGLE_REFRESH_TOKEN
    });

    return oauth2Client;
};

module.exports = { getOAuth2Client };
