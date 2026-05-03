const { google } = require('googleapis');
require('dotenv').config({ path: 'server/.env' });

async function checkConnectedAccount() {
    const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN } = process.env;

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) {
        console.error('Missing Gmail API credentials in .env file.');
        return;
    }

    const oauth2Client = new google.auth.OAuth2(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        'http://localhost:5000/oauth2callback'
    );

    oauth2Client.setCredentials({
        refresh_token: GOOGLE_REFRESH_TOKEN
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    try {
        const response = await gmail.users.getProfile({ userId: 'me' });
        console.log('\n╔══════════════════════════════════════════════════════════╗');
        console.log('║           📧 Connected Gmail Account Info               ║');
        console.log('╚══════════════════════════════════════════════════════════╝');
        console.log(`\n   Email Address: ${response.data.emailAddress}`);
        console.log(`   Total Messages: ${response.data.messagesTotal}`);
        console.log(`   Total Threads: ${response.data.threadsTotal}`);
        console.log('\n═══════════════════════════════════════════════════════════\n');
    } catch (error) {
        console.error('Error fetching profile:', error.message);
    }
}

checkConnectedAccount();
