const { google } = require('googleapis');
const { simpleParser } = require('mailparser');
const Email = require('../models/Email');
const { classifyEmail } = require('../classifier/classifier');

// Gmail API scopes
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

// OAuth2 client
let oauth2Client = null;
let gmail = null;

/**
 * Initialize the Gmail API client
 */
const initializeGmailClient = () => {
    const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN } = process.env;

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) {
        console.warn('Gmail API credentials not configured. Running in demo mode.');
        return false;
    }

    oauth2Client = new google.auth.OAuth2(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        'postmessage'
    );

    oauth2Client.setCredentials({
        refresh_token: GOOGLE_REFRESH_TOKEN
    });

    gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    console.log('Gmail API client initialized');
    return true;
};

/**
 * Fetch recent emails from Gmail
 * @param {number} maxResults - Maximum number of emails to fetch
 * @param {number} afterTimestamp - Unix timestamp to fetch emails after
 * @returns {Array} - Array of processed email objects
 */
const fetchEmails = async (maxResults = 10, afterTimestamp = null) => {
    if (!gmail) {
        console.warn('Gmail client not initialized');
        return [];
    }

    try {
        // Build query
        let query = '';
        if (afterTimestamp) {
            query = `after:${afterTimestamp}`;
        }

        // Fetch message list
        const response = await gmail.users.messages.list({
            userId: 'me',
            maxResults: maxResults,
            q: query
        });

        const messages = response.data.messages || [];
        console.log(`Fetched ${messages.length} messages from Gmail`);

        // Fetch full message details
        const emailPromises = messages.map(msg => fetchMessageDetails(msg.id));
        const emailDetails = await Promise.all(emailPromises);

        return emailDetails.filter(email => email !== null);

    } catch (error) {
        console.error('Error fetching emails from Gmail:', error.message);
        return [];
    }
};

/**
 * Fetch full message details and parse content
 * @param {string} messageId - Gmail message ID
 * @returns {Object|null} - Processed email object or null if error
 */
const fetchMessageDetails = async (messageId) => {
    try {
        const response = await gmail.users.messages.get({
            userId: 'me',
            id: messageId,
            format: 'raw'
        });

        const rawMessage = response.data.raw;

        // Decode the base64url encoded message
        const messageBuffer = Buffer.from(rawMessage, 'base64url');

        // Parse the MIME message
        const parsed = await simpleParser(messageBuffer);

        // Extract email content for classification
        const emailContent = [
            parsed.subject || '',
            parsed.text || '',
            parsed.from?.text || ''
        ].join(' ').substring(0, 5000); // Limit length for classification

        // Classify the email
        const classification = classifyEmail(emailContent);

        // Extract sender email address
        const fromEmail = parsed.from?.value?.[0]?.address || parsed.from?.text || 'Unknown';

        return {
            gmailId: messageId,
            from: fromEmail,
            to: parsed.to?.text || '',
            subject: parsed.subject || 'No Subject',
            content: emailContent,
            snippet: (parsed.text || '').substring(0, 200),
            text: parsed.text || '',
            html: parsed.html || '',
            category: classification.category,
            confidence: classification.confidence,
            receivedAt: parsed.date || new Date(),
            processedAt: new Date(),
            raw: rawMessage,
            labels: response.data.labelIds || [],
            hasAttachments: parsed.attachments && parsed.attachments.length > 0,
            threadId: response.data.threadId || ''
        };

    } catch (error) {
        console.error(`Error processing message ${messageId}:`, error.message);
        return null;
    }
};

/**
 * Get the last processed timestamp from the database
 * @returns {number} - Unix timestamp
 */
const getLastProcessedTimestamp = async () => {
    try {
        const lastEmail = await Email.findOne().sort({ receivedAt: -1 });
        if (lastEmail) {
            return Math.floor(lastEmail.receivedAt.getTime() / 1000);
        }

        // If no emails processed yet, get emails from last 24 hours
        const yesterday = new Date();
        yesterday.setHours(yesterday.getHours() - 24);
        return Math.floor(yesterday.getTime() / 1000);
    } catch (error) {
        console.error('Error getting last processed timestamp:', error.message);
        // Default to 1 hour ago
        const oneHourAgo = new Date();
        oneHourAgo.setHours(oneHourAgo.getHours() - 1);
        return Math.floor(oneHourAgo.getTime() / 1000);
    }
};

/**
 * Process and save emails to the database
 * @param {Array} emails - Array of email objects
 * @returns {Array} - Array of newly saved emails
 */
const processAndSaveEmails = async (emails) => {
    const savedEmails = [];

    for (const email of emails) {
        try {
            // Check if email already exists
            const existing = await Email.findOne({ gmailId: email.gmailId });
            if (existing) {
                console.log(`Email ${email.gmailId} already exists, skipping`);
                continue;
            }

            // Save new email
            const saved = await Email.create(email);
            savedEmails.push(saved);
            console.log(`Saved email: ${email.subject}`);
        } catch (error) {
            console.error(`Error saving email ${email.gmailId}:`, error.message);
        }
    }

    return savedEmails;
};

/**
 * Main polling function - fetches, processes, and returns new emails
 */
const pollAndProcessEmails = async () => {
    // Check if Gmail is initialized
    const isInitialized = initializeGmailClient();

    if (!isInitialized) {
        // Return demo data for testing
        return generateDemoEmails();
    }

    try {
        // Get last processed timestamp
        const lastTimestamp = await getLastProcessedTimestamp();

        // Fetch new emails
        const emails = await fetchEmails(10, lastTimestamp);

        if (emails.length === 0) {
            console.log('No new emails found');
            return [];
        }

        // Process and save emails
        const savedEmails = await processAndSaveEmails(emails);

        console.log(`Processed ${savedEmails.length} new emails`);
        return savedEmails;

    } catch (error) {
        console.error('Error in poll and process:', error.message);
        return [];
    }
};

/**
 * Generate demo emails for testing without Gmail API
 */
const generateDemoEmails = () => {
    const demoEmails = [
        {
            gmailId: `demo_${Date.now()}_1`,
            from: 'boss@company.com',
            subject: 'Project Update - Q4 Goals',
            content: 'Team, we need to finalize the Q4 goals by end of week. Please review the attached document and provide feedback.',
            snippet: 'Team, we need to finalize the Q4 goals...',
            category: 'Work',
            confidence: 0.85,
            receivedAt: new Date(),
            processedAt: new Date()
        },
        {
            gmailId: `demo_${Date.now()}_2`,
            from: 'bank@notifications.com',
            subject: 'Your Monthly Statement is Ready',
            content: 'Your monthly bank statement for October is now available. Login to view your account details and recent transactions.',
            snippet: 'Your monthly bank statement for October...',
            category: 'Finance',
            confidence: 0.92,
            receivedAt: new Date(Date.now() - 60000),
            processedAt: new Date()
        },
        {
            gmailId: `demo_${Date.now()}_3`,
            from: 'deals@shopping.com',
            subject: 'Flash Sale - 50% Off Everything!',
            content: 'Limited time offer! Get 50% off all products this weekend only. Use code FLASH50 at checkout. Free shipping on orders over $50.',
            snippet: 'Limited time offer! Get 50% off all products...',
            category: 'Promotion',
            confidence: 0.95,
            receivedAt: new Date(Date.now() - 120000),
            processedAt: new Date()
        }
    ];

    console.log(`Generated ${demoEmails.length} demo emails`);
    return demoEmails;
};

module.exports = {
    initializeGmailClient,
    fetchEmails,
    fetchMessageDetails,
    getLastProcessedTimestamp,
    processAndSaveEmails,
    pollAndProcessEmails,
    generateDemoEmails
};