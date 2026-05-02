import React from 'react';
import EmailCard from './EmailCard';

const EmailList = ({ emails }) => {
    const getCategoryColor = (category) => {
        const colors = {
            'Personal': 'border-l-green-500',
            'Business': 'border-l-indigo-500',
            'Finance': 'border-l-amber-500',
            'Security': 'border-l-red-500',
            'Work': 'border-l-purple-500',
            'College/School': 'border-l-cyan-500',
            'Promotion': 'border-l-pink-500'
        };
        return colors[category] || 'border-l-gray-500';
    };

    if (emails.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No emails yet</h3>
                <p className="text-gray-500 text-sm">
                    Waiting for incoming emails. The system will automatically categorize them.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                    Recent Emails
                </h2>
                <span className="text-sm text-gray-500">
                    Showing {emails.length} most recent
                </span>
            </div>

            <div className="space-y-3">
                {emails.slice(0, 20).map((email, index) => (
                    <EmailCard
                        key={email.id || index}
                        email={email}
                        categoryColor={getCategoryColor(email.category)}
                    />
                ))}
            </div>
        </div>
    );
};

export default EmailList;