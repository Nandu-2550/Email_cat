import React from 'react';
import EmailList from './EmailList';
import CategoryStats from './CategoryStats';
import Header from './Header';

const Dashboard = ({ emails, isConnected, categoryStats }) => {
    const totalEmails = emails.length;
    const lastUpdated = emails.length > 0 ? emails[0].timestamp : null;

    return (
        <div className="container mx-auto px-4 py-6 max-w-7xl">
            <Header
                isConnected={isConnected}
                totalEmails={totalEmails}
                lastUpdated={lastUpdated}
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
                {/* Category Statistics - Left Sidebar */}
                <div className="lg:col-span-1">
                    <CategoryStats stats={categoryStats} />
                </div>

                {/* Email List - Main Content */}
                <div className="lg:col-span-3">
                    <EmailList emails={emails} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;