import React from 'react';

const CategoryStats = ({ stats }) => {
    const categories = [
        { name: 'Personal', color: 'bg-green-500', lightColor: 'bg-green-100', textColor: 'text-green-700' },
        { name: 'Business', color: 'bg-indigo-500', lightColor: 'bg-indigo-100', textColor: 'text-indigo-700' },
        { name: 'Finance', color: 'bg-amber-500', lightColor: 'bg-amber-100', textColor: 'text-amber-700' },
        { name: 'Security', color: 'bg-red-500', lightColor: 'bg-red-100', textColor: 'text-red-700' },
        { name: 'Work', color: 'bg-purple-500', lightColor: 'bg-purple-100', textColor: 'text-purple-700' },
        { name: 'College/School', color: 'bg-cyan-500', lightColor: 'bg-cyan-100', textColor: 'text-cyan-700' },
        { name: 'Promotion', color: 'bg-pink-500', lightColor: 'bg-pink-100', textColor: 'text-pink-700' }
    ];

    const totalEmails = Object.values(stats).reduce((sum, count) => sum + count, 0);

    const getPercentage = (count) => {
        if (totalEmails === 0) return 0;
        return Math.round((count / totalEmails) * 100);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Category Distribution
            </h2>

            <div className="space-y-3">
                {categories.map((category) => {
                    const count = stats[category.name] || 0;
                    const percentage = getPercentage(count);

                    return (
                        <div key={category.name} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${category.color}`} />
                                    <span className="text-gray-700 font-medium">{category.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-900 font-semibold">{count}</span>
                                    <span className="text-gray-400 text-xs">({percentage}%)</span>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className={`w-full h-2 ${category.lightColor} rounded-full overflow-hidden`}>
                                <div
                                    className={`h-full ${category.color} rounded-full transition-all duration-500 ease-out`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Total count summary */}
            <div className="mt-5 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Total Emails</span>
                    <span className="text-lg font-bold text-gray-900">{totalEmails}</span>
                </div>
            </div>
        </div>
    );
};

export default CategoryStats;