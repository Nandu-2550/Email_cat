/**
 * OAuth2 Refresh Token Generator for Gmail API
 * 
 * This script helps you generate a refresh token for Gmail API access.
 * 
 * Usage:
 * 1. Run: node server/scripts/getRefreshToken.js
 * 2. Open the generated URL in your browser
 * 3. Authorize the application
 * 4. Copy the code from the redirect URL
 * 5. Paste the code when prompted
 * 6. Your refresh token will be displayed
 */

require('dotenv').config({ path: '.env' });
const { google } = require('googleapis');
const readline = require('readline');

// OAuth2 configuration
const OAUTH2_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const OAUTH2_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const OAUTH2_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/oauth2callback';

// Gmail API scopes
const SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify'
];

if (!OAUTH2_CLIENT_ID || !OAUTH2_CLIENT_SECRET) {
    console.error('Error: Missing OAuth credentials.');
    console.error('Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file.');
    console.error('\nSteps to get credentials:');
    console.error('1. Go to https://console.cloud.google.com/');
    console.error('2. Create a new project or select existing');
    console.error('3. Enable Gmail API');
    console.error('4. Create OAuth 2.0 Client ID credentials');
    console.error('5. Copy Client ID and Client Secret to .env file');
    process.exit(1);
}

// Create OAuth2 client
const oauth2Client = new google.auth.OAuth2(
    OAUTH2_CLIENT_ID,
    OAUTH2_CLIENT_SECRET,
    OAUTH2_REDIRECT_URI
);

// Generate authorization URL
function generateAuthUrl() {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent'
    });
    return authUrl;
}

// Exchange authorization code for tokens
async function getTokenFromCode(code) {
    try {
        const { tokens } = await oauth2Client.getToken(code);
        return tokens;
    } catch (error) {
        console.error('Error exchanging code for token:', error.message);
        if (error.response && error.response.data) {
            console.error('Details:', JSON.parse(error.response.data));
        }
        return null;
    }
}

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Main function
async function main() {
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║     Gmail API OAuth2 Refresh Token Generator            ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('Redirect URI:', OAUTH2_REDIRECT_URI);
    console.log('');

    // Step 1: Generate authorization URL
    const authUrl = generateAuthUrl();

    console.log('Step 1: Open the following URL in your browser:');
    console.log('');
    console.log('🔗', authUrl);
    console.log('');
    console.log('Step 2: Sign in with your Google account and grant permission.');
    console.log('Step 3: You will be redirected to a page with a code in the URL.');
    console.log('        (The page may show an error - this is expected. Copy the code from the URL bar.)');
    console.log('');

    // Step 2: Prompt for authorization code
    rl.question('Enter the authorization code: ', async (code) => {
        console.log('');
        console.log('Exchanging code for tokens...');

        // Exchange code for tokens
        const tokens = await getTokenFromCode(code.trim());

        if (tokens && tokens.refresh_token) {
            console.log('');
            console.log('╔══════════════════════════════════════════════════════════╗');
            console.log('║              ✅ Refresh Token Generated!                 ║');
            console.log('╚══════════════════════════════════════════════════════════╝');
            console.log('');
            console.log('Your Refresh Token:');
            console.log('═══════════════════════════════════════════════════════════');
            console.log('');
            console.log(tokens.refresh_token);
            console.log('');
            console.log('═══════════════════════════════════════════════════════════');
            console.log('');
            console.log('Next steps:');
            console.log('1. Copy this refresh token');
            console.log('2. Add it to your .env file as GOOGLE_REFRESH_TOKEN');
            console.log('3. Run: npm run server:seed (to train the classifier)');
            console.log('4. Run: npm run dev (to start the application)');
            console.log('');
        } else if (tokens && tokens.access_token && !tokens.refresh_token) {
            console.log('');
            console.log('⚠️  Warning: No refresh token received.');
            console.log('This may happen if you have already authorized this app before.');
            console.log('');
            console.log('Access Token (temporary):', tokens.access_token);
            console.log('');
            console.log('To get a refresh token:');
            console.log('1. Go to your Google Account security settings');
            console.log('2. Find "Third-party apps with account access"');
            console.log('3. Remove this app');
            console.log('4. Run this script again');
            console.log('');
        } else {
            console.log('');
            console.log('❌ Failed to get tokens. Please try again.');
            console.log('Make sure you copied the correct authorization code.');
            console.log('');
        }

        rl.close();
    });
}

// Run the script
main();