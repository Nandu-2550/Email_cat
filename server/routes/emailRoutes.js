const express = require('express');
const router = express.Router();
const Email = require('../models/Email');

/**
 * GET /api/emails/test-broadcast
 * Test endpoint to trigger real-time broadcast
 * This is before /:id to avoid being captured as an ID
 */
router.get('/test-broadcast', async (req, res) => {
    try {
        const testEmailData = {
            gmailId: 'test_' + Date.now(),
            from: 'test-bot@livemail.com',
            to: 'nandunusgavai@gmail.com',
            subject: '🚀 Persistent Test SUCCESS!',
            content: 'This email is now saved in your database, so it will not disappear when you refresh!',
            snippet: 'This email is now saved in your database...',
            category: 'Business',
            confidence: 0.95,
            receivedAt: new Date(),
            processedAt: new Date()
        };
        
        // Save to Database
        const savedEmail = await Email.create(testEmailData);
        
        // Access io from the app instance
        const io = req.app.get('io');
        if (io) {
            io.emit('new-email', {
                ...savedEmail.toObject(),
                id: savedEmail._id,
                timestamp: savedEmail.receivedAt
            });
            res.json({ success: true, message: 'Test email saved and broadcasted!' });
        } else {
            res.status(500).json({ success: false, error: 'Socket.io not initialized' });
        }
    } catch (error) {
        console.error('Test broadcast error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/emails
 * Fetch recent emails with optional filters
 */
router.get('/', async (req, res) => {
    try {
        const { limit = 50, category, days = 7 } = req.query;

        const query = {};

        // Filter by category if provided
        if (category) {
            query.category = category;
        }

        // Filter by date range (default: last 7 days)
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
        query.receivedAt = { $gte: cutoffDate };

        const emails = await Email.find(query)
            .sort({ receivedAt: -1 })
            .limit(parseInt(limit))
            .select('-raw -html'); // Exclude large fields

        res.json({
            success: true,
            count: emails.length,
            data: emails
        });

    } catch (error) {
        console.error('Error fetching emails:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch emails'
        });
    }
});

/**
 * GET /api/emails/stats
 * Get category statistics
 */
router.get('/stats', async (req, res) => {
    try {
        const stats = await Email.getCategoryStats();

        // Ensure all categories are represented
        const allCategories = ['Personal', 'Business', 'Finance', 'Security', 'Work', 'College/School', 'Promotion'];
        const completeStats = {};

        allCategories.forEach(cat => {
            completeStats[cat] = stats[cat] || 0;
        });

        const totalEmails = Object.values(completeStats).reduce((sum, count) => sum + count, 0);

        res.json({
            success: true,
            data: {
                categories: completeStats,
                total: totalEmails
            }
        });

    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch statistics'
        });
    }
});

/**
 * GET /api/emails/:id
 * Get a single email by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const email = await Email.findOne({
            $or: [
                { _id: req.params.id },
                { gmailId: req.params.id }
            ]
        });

        if (!email) {
            return res.status(404).json({
                success: false,
                error: 'Email not found'
            });
        }

        res.json({
            success: true,
            data: email
        });

    } catch (error) {
        console.error('Error fetching email:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch email'
        });
    }
});

/**
 * GET /api/emails/category/:category
 * Get emails by category
 */
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const { limit = 50 } = req.query;

        const emails = await Email.find({ category })
            .sort({ receivedAt: -1 })
            .limit(parseInt(limit))
            .select('-raw -html');

        res.json({
            success: true,
            count: emails.length,
            data: emails
        });

    } catch (error) {
        console.error('Error fetching emails by category:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch emails'
        });
    }
});

/**
 * DELETE /api/emails/:id
 * Delete an email (for testing purposes)
 */
router.delete('/:id', async (req, res) => {
    try {
        const result = await Email.deleteOne({
            $or: [
                { _id: req.params.id },
                { gmailId: req.params.id }
            ]
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'Email not found'
            });
        }

        res.json({
            success: true,
            message: 'Email deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting email:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete email'
        });
    }
});

module.exports = router;