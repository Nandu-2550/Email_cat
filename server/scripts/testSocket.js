/**
 * Socket.io Test Script
 * Sends dummy email data to verify real-time updates are working
 * 
 * Usage: node server/scripts/testSocket.js
 */

const io = require('socket.io-client');

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

// Dummy email data for testing
const dummyEmails = [
    {
        id: 'test_1',
        gmailId: 'test_gmail_1',
        from: 'boss@company.com',
        subject: 'Q4 Project Deadline',
        content: 'Team, we need to finalize the Q4 project deliverables by end of next week. Please review the attached document and provide your feedback.',
        snippet: 'Team, we need to finalize the Q4 project...',
        category: 'Work',
        confidence: 0.92,
        timestamp: new Date().toISOString()
    },
    {
        id: 'test_2',
        gmailId: 'test_gmail_2',
        from: 'bank@notifications.com',
        subject: 'Your Monthly Statement is Ready',
        content: 'Your monthly bank statement for October is now available. Login to view your account details, recent transactions, and current balance.',
        snippet: 'Your monthly bank statement for October...',
        category: 'Finance',
        confidence: 0.95,
        timestamp: new Date(Date.now() - 60000).toISOString()
    },
    {
        id: 'test_3',
        gmailId: 'test_gmail_3',
        from: 'deals@shopping.com',
        subject: 'Flash Sale - 70% Off Everything!',
        content: 'Limited time offer! Get 70% off all products this weekend only. Use code FLASH70 at checkout. Free shipping on orders over $50.',
        snippet: 'Limited time offer! Get 70% off all products...',
        category: 'Promotion',
        confidence: 0.98,
        timestamp: new Date(Date.now() - 120000).toISOString()
    },
    {
        id: 'test_4',
        gmailId: 'test_gmail_4',
        from: 'mom@family.com',
        subject: 'Sunday Dinner',
        content: 'Hey sweetie, dont forget we are having family dinner this Sunday at 2pm. Your favorite lasagna will be ready! Bring your appetite.',
        snippet: 'Hey sweetie, dont forget we are having family...',
        category: 'Personal',
        confidence: 0.89,
        timestamp: new Date(Date.now() - 180000).toISOString()
    },
    {
        id: 'test_5',
        gmailId: 'test_gmail_5',
        from: 'security@university.edu',
        subject: 'Security Alert: Password Expiration',
        content: 'Your university account password will expire in 3 days. Please reset your password to maintain access to campus systems and email.',
        snippet: 'Your university account password will expire...',
        category: 'Security',
        confidence: 0.94,
        timestamp: new Date(Date.now() - 240000).toISOString()
    },
    {
        id: 'test_6',
        gmailId: 'test_gmail_6',
        from: 'professor@university.edu',
        subject: 'Assignment 3 Grade Posted',
        content: 'Your grade for Assignment 3 has been posted. You scored 95/100. Great work on the machine learning implementation! See me during office hours if you have questions.',
        snippet: 'Your grade for Assignment 3 has been posted...',
        category: 'College/School',
        confidence: 0.96,
        timestamp: new Date(Date.now() - 300000).toISOString()
    }
];

async function testSocketConnection() {
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║        Socket.io Real-time Test Script                   ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('Connecting to:', SOCKET_URL);
    console.log('');

    const socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
    });

    socket.on('connect', () => {
        console.log('✅ Connected to Socket.io server!');
        console.log('Socket ID:', socket.id);
        console.log('');
        console.log('Sending test emails...');
        console.log('');

        // Send dummy emails one by one with delays
        dummyEmails.forEach((email, index) => {
            setTimeout(() => {
                console.log(`📧 Sending test email ${index + 1}/${dummyEmails.length}: ${email.subject}`);
                socket.emit('new-email', email);
            }, index * 2000);
        });

        // Disconnect after sending all emails
        setTimeout(() => {
            console.log('');
            console.log('✅ All test emails sent!');
            console.log('Check your React dashboard to see if the emails appear in real-time.');
            socket.disconnect();
            process.exit(0);
        }, dummyEmails.length * 2000 + 1000);
    });

    socket.on('connect_error', (error) => {
        console.error('❌ Connection error:', error.message);
        console.error('');
        console.error('Make sure the server is running: npm run server:dev');
        process.exit(1);
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from server');
    });
}

// Run the test
testSocketConnection();