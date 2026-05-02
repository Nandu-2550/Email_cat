import React from 'react';

const EmailCard = ({ email, categoryColor }) => {
    const formatTime = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const truncateText = (text, maxLength = 100) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    const getCategoryBadgeClass = (category) => {
        const classes = {
            'Personal': 'category-personal',
            'Business': 'category-business',
            'Finance': 'category-finance',
            'Security': 'category-security',
            'Work': 'category-work',
            'College/School': 'category-education',
            'Promotion': 'category-promotion'
        };
        return classes[category] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className={`email-card bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 ${categoryColor} p-4`}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`category-badge ${getCategoryBadgeClass(email.category)}`}>
                            {email.category}
                        </span>
                        {email.confidence && (
                            <span className="text-xs text-gray-400">
                                ({Math.round(email.confidence * 100)}% confidence)
                            </span>
                        )}
                    </div>

                    <h3 className="text-base font-semibold text-gray-900 truncate mb-1">
                        {email.subject || 'No Subject'}
                    </h3>

                    <p className="text-sm text-gray-500 mb-2">
                        From: <span className="font-medium text-gray-700">{email.from || 'Unknown'}</span>
                    </p>

                    <p className="text-sm text-gray-600">
                        {truncateText(email.content || email.snippet || '', 150)}
                    </p>
                </div>

                <div className="flex-shrink-0 text-right">
                    <p className="text-xs text-gray-400">
                        {formatTime(email.timestamp)}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EmailCard;