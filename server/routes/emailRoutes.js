const express = require('express');
const router = express.Router();
const Email = require('../models/Email');
const { sendEmail, replyToEmail } = require('../services/gmailService');

// Middleware to check if user is logged in
const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ success: false, error: 'Not authenticated' });
};

// Use middleware for all routes
router.use(isLoggedIn);

/**
 * GET /api/emails
 * Fetch recent emails for the logged-in user
 */
router.get('/', async (req, res) => {
    try {
        const { limit = 50, category, days = 7 } = req.query;
        const userEmail = req.user.email;

        const query = { userEmail };

        if (category && category !== 'All') {
            query.category = category;
        }

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
        query.receivedAt = { $gte: cutoffDate };

        const emails = await Email.find(query)
            .sort({ receivedAt: -1 })
            .limit(parseInt(limit))
            .select('-raw');

        res.json({
            success: true,
            count: emails.length,
            data: emails
        });
    } catch (error) {
        console.error('Error fetching emails:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch emails' });
    }
});

/**
 * GET /api/emails/stats
 * Get category statistics for the logged-in user
 */
router.get('/stats', async (req, res) => {
    try {
        const userEmail = req.user.email;
        
        const stats = await Email.aggregate([
            { $match: { userEmail } },
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);

        const allCategories = ['Personal', 'Business', 'Finance', 'Security', 'Work', 'College/School', 'Promotion', 'Uncategorized'];
        const completeStats = {};

        allCategories.forEach(cat => {
            const found = stats.find(s => s._id === cat);
            completeStats[cat] = found ? found.count : 0;
        });

        res.json({
            success: true,
            data: {
                categories: completeStats,
                total: Object.values(completeStats).reduce((a, b) => a + b, 0)
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch statistics' });
    }
});

/**
 * GET /api/emails/:id
 * Get a single email by ID (must belong to user)
 */
router.get('/:id', async (req, res) => {
    try {
        const email = await Email.findOne({
            _id: req.params.id,
            userEmail: req.user.email
        });

        if (!email) {
            return res.status(404).json({ success: false, error: 'Email not found' });
        }

        res.json({ success: true, data: email });
    } catch (error) {
        console.error('Error fetching email:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch email' });
    }
});

/**
 * POST /api/emails/send
 * Send a new email
 */
router.post('/send', async (req, res) => {
    try {
        const { to, subject, body } = req.body;
        if (!to || !subject || !body) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        const result = await sendEmail(req.user, { to, subject, body });
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/emails/reply
 * Reply to an email
 */
router.post('/reply', async (req, res) => {
    try {
        const { to, subject, body, threadId, messageId } = req.body;
        if (!to || !subject || !body || !threadId) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        const result = await replyToEmail(req.user, { to, subject, body, threadId, messageId });
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error replying to email:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;