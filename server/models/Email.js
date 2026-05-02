const mongoose = require('mongoose');

const EmailSchema = new mongoose.Schema({
    // Gmail message ID
    gmailId: {
        type: String,
        required: true,
        unique: true
    },

    // Email headers
    from: {
        type: String,
        required: true
    },
    to: {
        type: String,
        default: ''
    },
    subject: {
        type: String,
        default: 'No Subject'
    },

    // Email content
    content: {
        type: String,
        default: ''
    },
    snippet: {
        type: String,
        default: ''
    },
    html: {
        type: String,
        default: ''
    },
    text: {
        type: String,
        default: ''
    },

    // Classification results
    category: {
        type: String,
        enum: ['Personal', 'Business', 'Finance', 'Security', 'Work', 'College/School', 'Promotion'],
        required: true
    },
    confidence: {
        type: Number,
        default: 0,
        min: 0,
        max: 1
    },

    // Timestamps
    receivedAt: {
        type: Date,
        default: Date.now
    },
    processedAt: {
        type: Date,
        default: Date.now
    },

    // Raw Gmail data (optional, for debugging)
    raw: {
        type: String,
        default: ''
    },

    // Labels from Gmail
    labels: [{
        type: String
    }],

    // Attachments info
    hasAttachments: {
        type: Boolean,
        default: false
    },

    // Thread ID
    threadId: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Index for efficient querying by received date
EmailSchema.index({ receivedAt: -1 });
EmailSchema.index({ category: 1 });
EmailSchema.index({ gmailId: 1 });

// Static method to find recent emails
EmailSchema.statics.findRecent = function (limit = 20) {
    return this.find().sort({ receivedAt: -1 }).limit(limit);
};

// Static method to get category statistics
EmailSchema.statics.getCategoryStats = async function () {
    const stats = await this.aggregate([
        {
            $group: {
                _id: '$category',
                count: { $sum: 1 }
            }
        },
        {
            $project: {
                category: '$_id',
                count: 1,
                _id: 0
            }
        }
    ]);

    // Convert to a key-value object
    const result = {};
    stats.forEach(stat => {
        result[stat.category] = stat.count;
    });

    return result;
};

module.exports = mongoose.model('Email', EmailSchema);