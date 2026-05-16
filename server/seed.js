/**
 * Seed Script for LiveMail Classifier
 * Trains the Bayes Classifier with keyword-rich datasets for all 7 categories
 * Run with: npm run seed
 */

require('dotenv').config({ path: '.env' });
const connectDB = require('./config/database');
const { initializeClassifier, trainClassifier, saveClassifier } = require('./services/classifier');

// Training data for all 7 categories
const trainingData = [
    // ==================== PERSONAL ====================
    {
        text: 'Hey, are you free this weekend? Want to grab lunch and catch up?',
        category: 'Personal'
    },
    {
        text: 'Happy birthday! Hope you have an amazing day filled with joy and laughter',
        category: 'Personal'
    },
    {
        text: 'Thanks for coming to the party last night, it was so much fun!',
        category: 'Personal'
    },
    {
        text: 'Mom called, she wants us to come over for dinner on Sunday',
        category: 'Personal'
    },
    {
        text: 'Let me know if you want to go to the movies tonight',
        category: 'Personal'
    },
    {
        text: 'I found some old photos from our vacation, sending them your way',
        category: 'Personal'
    },
    {
        text: 'Can you pick up some groceries on your way home?',
        category: 'Personal'
    },
    {
        text: 'Hope you feel better soon, let me know if you need anything',
        category: 'Personal'
    },
    {
        text: 'Wedding invitation - Sarah and John are getting married!',
        category: 'Personal'
    },
    {
        text: 'Family reunion next month, please RSVP by Friday',
        category: 'Personal'
    },
    {
        text: 'Miss you so much, when are you visiting?',
        category: 'Personal'
    },
    {
        text: 'Thanks for the lovely dinner invitation, we had a great time',
        category: 'Personal'
    },
    {
        text: 'Your friend request has been accepted on Facebook',
        category: 'Personal'
    },
    {
        text: 'Reminder: dentist appointment tomorrow at 3pm',
        category: 'Personal'
    },
    {
        text: 'Gym membership renewal notice - your monthly subscription',
        category: 'Personal'
    },

    // ==================== BUSINESS ====================
    {
        text: 'Quarterly business review meeting scheduled for next Tuesday at 10am',
        category: 'Business'
    },
    {
        text: 'Partnership proposal - exploring strategic collaboration opportunities',
        category: 'Business'
    },
    {
        text: 'Board meeting agenda and materials attached for review',
        category: 'Business'
    },
    {
        text: 'Client presentation feedback and next steps discussion',
        category: 'Business'
    },
    {
        text: 'Vendor contract renewal - please review the terms and conditions',
        category: 'Business'
    },
    {
        text: 'Business development opportunity in the Asian market',
        category: 'Business'
    },
    {
        text: 'Corporate strategy session - Q4 planning and objectives',
        category: 'Business'
    },
    {
        text: 'Stakeholder update on company performance and growth metrics',
        category: 'Business'
    },
    {
        text: 'Merger and acquisition discussion - confidential',
        category: 'Business'
    },
    {
        text: 'Investor relations - annual report and financial statements',
        category: 'Business'
    },
    {
        text: 'Business trip itinerary for the conference next week',
        category: 'Business'
    },
    {
        text: 'Company policy update - new HR guidelines effective immediately',
        category: 'Business'
    },
    {
        text: 'Team restructuring announcement and organizational changes',
        category: 'Business'
    },
    {
        text: 'Client onboarding process and welcome package',
        category: 'Business'
    },
    {
        text: 'Business intelligence report - market analysis and trends',
        category: 'Business'
    },

    // ==================== FINANCE ====================
    {
        text: 'Your monthly bank statement is now available for download',
        category: 'Finance'
    },
    {
        text: 'Tax return filing reminder - deadline approaching April 15th',
        category: 'Finance'
    },
    {
        text: 'Investment portfolio update - quarterly performance report',
        category: 'Finance'
    },
    {
        text: 'Credit card payment due - minimum payment required by due date',
        category: 'Finance'
    },
    {
        text: 'Mortgage statement - your monthly payment breakdown',
        category: 'Finance'
    },
    {
        text: 'Stock dividend notification - reinvestment options available',
        category: 'Finance'
    },
    {
        text: 'Insurance premium payment notice - auto renewal upcoming',
        category: 'Finance'
    },
    {
        text: 'Retirement account contribution limits for this year',
        category: 'Finance'
    },
    {
        text: 'Loan approval notification - terms and interest rate details',
        category: 'Finance'
    },
    {
        text: 'Budget planning spreadsheet for the upcoming fiscal year',
        category: 'Finance'
    },
    {
        text: 'Wire transfer confirmation - international payment processed',
        category: 'Finance'
    },
    {
        text: 'Account balance alert - low balance warning threshold reached',
        category: 'Finance'
    },
    {
        text: 'Financial advisor meeting scheduled - portfolio review session',
        category: 'Finance'
    },
    {
        text: 'Cryptocurrency transaction confirmation and wallet update',
        category: 'Finance'
    },
    {
        text: 'Expense report reimbursement - submit receipts by end of month',
        category: 'Finance'
    },

    // ==================== SECURITY ====================
    {
        text: 'Security alert: unusual login activity detected on your account',
        category: 'Security'
    },
    {
        text: 'Password reset required - your password has expired',
        category: 'Security'
    },
    {
        text: 'Two-factor authentication enabled successfully on your account',
        category: 'Security'
    },
    {
        text: 'Phishing attempt detected - do not click on suspicious links',
        category: 'Security'
    },
    {
        text: 'Account locked due to multiple failed login attempts',
        category: 'Security'
    },
    {
        text: 'Security update available - please install the latest patches',
        category: 'Security'
    },
    {
        text: 'Suspicious activity warning - verify recent transactions',
        category: 'Security'
    },
    {
        text: 'VPN connection established - secure tunnel active',
        category: 'Security'
    },
    {
        text: 'Firewall alert - blocked unauthorized access attempt',
        category: 'Security'
    },
    {
        text: 'Data breach notification - please change your password immediately',
        category: 'Security'
    },
    {
        text: 'SSL certificate expiring soon - renewal required',
        category: 'Security'
    },
    {
        text: 'Malware detected and quarantined by antivirus software',
        category: 'Security'
    },
    {
        text: 'Login verification code - do not share this code with anyone',
        category: 'Security'
    },
    {
        text: 'Privacy policy update - new data protection measures implemented',
        category: 'Security'
    },
    {
        text: 'Encryption key rotation scheduled - system maintenance window',
        category: 'Security'
    },

    // ==================== WORK ====================
    {
        text: 'Project deadline reminder - deliverables due by end of week',
        category: 'Work'
    },
    {
        text: 'Team standup meeting at 9am - please prepare your updates',
        category: 'Work'
    },
    {
        text: 'Performance review scheduled - self-assessment form attached',
        category: 'Work'
    },
    {
        text: 'Sprint planning session - backlog grooming and estimation',
        category: 'Work'
    },
    {
        text: 'Code review feedback - please address the comments and resubmit',
        category: 'Work'
    },
    {
        text: 'Training workshop registration - professional development opportunity',
        category: 'Work'
    },
    {
        text: 'Timesheet submission reminder - log your hours by Friday',
        category: 'Work'
    },
    {
        text: 'IT support ticket resolved - please verify the fix',
        category: 'Work'
    },
    {
        text: 'Office supply order confirmation - delivery scheduled for Monday',
        category: 'Work'
    },
    {
        text: 'Employee handbook update - please review the new policies',
        category: 'Work'
    },
    {
        text: 'PTO request approved - enjoy your time off',
        category: 'Work'
    },
    {
        text: 'Department all-hands meeting - quarterly updates and announcements',
        category: 'Work'
    },
    {
        text: 'Work from home policy guidelines and expectations',
        category: 'Work'
    },
    {
        text: 'Project kickoff meeting invite - new client onboarding',
        category: 'Work'
    },
    {
        text: 'HR benefits enrollment period - review your coverage options',
        category: 'Work'
    },

    // ==================== COLLEGE/SCHOOL ====================
    {
        text: 'Assignment due date reminder - submit your essay by midnight',
        category: 'College/School'
    },
    {
        text: 'Exam schedule released - check your testing times and locations',
        category: 'College/School'
    },
    {
        text: 'Grade report available - view your transcript online',
        category: 'College/School'
    },
    {
        text: 'Course registration opens next week - plan your schedule',
        category: 'College/School'
    },
    {
        text: 'Professor office hours changed to Wednesdays 2-4pm',
        category: 'College/School'
    },
    {
        text: 'Scholarship application deadline approaching - submit all documents',
        category: 'College/School'
    },
    {
        text: 'Campus event - guest lecture on artificial intelligence',
        category: 'College/School'
    },
    {
        text: 'Library fine notice - overdue books must be returned',
        category: 'College/School'
    },
    {
        text: 'Internship opportunity - apply through the career center',
        category: 'College/School'
    },
    {
        text: 'Student ID card renewal - visit the administrative office',
        category: 'College/School'
    },
    {
        text: 'Thesis proposal defense scheduled - committee feedback attached',
        category: 'College/School'
    },
    {
        text: 'Group project meeting - study room reserved in library',
        category: 'College/School'
    },
    {
        text: 'Financial aid disbursement notification - check your student account',
        category: 'College/School'
    },
    {
        text: 'Graduation application deadline - apply to graduate this semester',
        category: 'College/School'
    },
    {
        text: 'Research paper feedback - revisions needed before final submission',
        category: 'College/School'
    },

    // ==================== PROMOTION ====================
    {
        text: 'Limited time offer - 50% off all products this weekend only!',
        category: 'Promotion'
    },
    {
        text: 'Flash sale alert - grab your favorites before they sell out',
        category: 'Promotion'
    },
    {
        text: 'Exclusive member discount - use code SAVE20 at checkout',
        category: 'Promotion'
    },
    {
        text: 'Buy one get one free - special promotion for loyal customers',
        category: 'Promotion'
    },
    {
        text: 'New product launch - be the first to try our latest release',
        category: 'Promotion'
    },
    {
        text: 'Free shipping on orders over $50 - limited time only',
        category: 'Promotion'
    },
    {
        text: 'Subscribe and save - get 15% off your monthly subscription',
        category: 'Promotion'
    },
    {
        text: 'Refer a friend and earn rewards - share your unique link',
        category: 'Promotion'
    },
    {
        text: 'Seasonal clearance sale - up to 70% off selected items',
        category: 'Promotion'
    },
    {
        text: 'Loyalty points doubled - earn more rewards on every purchase',
        category: 'Promotion'
    },
    {
        text: 'Black Friday deals preview - early access for subscribers',
        category: 'Promotion'
    },
    {
        text: 'Holiday special - gift cards with every purchase over $100',
        category: 'Promotion'
    },
    {
        text: 'App download bonus - get $10 off your first mobile order',
        category: 'Promotion'
    },
    {
        text: 'Birthday reward - special discount just for you',
        category: 'Promotion'
    },
    {
        text: 'Unsubscribe from promotional emails - manage your preferences',
        category: 'Promotion'
    }
];

// Main seed function
const seed = async () => {
    console.log('🌱 Starting LiveMail Classifier seed...');

    try {
        // Connect to MongoDB
        await connectDB();
        console.log('✅ Database connected');

        // Initialize the classifier
        initializeClassifier();
        console.log('✅ Classifier initialized');

        // Train with all the data
        trainClassifier(trainingData);
        console.log('✅ Classifier trained with', trainingData.length, 'samples');

        // Save the classifier
        await saveClassifier();
        console.log('✅ Classifier saved to disk');

        // Print summary
        const categoryCount = {};
        trainingData.forEach(d => {
            categoryCount[d.category] = (categoryCount[d.category] || 0) + 1;
        });

        console.log('\n📊 Training Data Summary:');
        Object.entries(categoryCount).forEach(([category, count]) => {
            console.log(`   ${category}: ${count} samples`);
        });

        console.log('\n🎉 Seed completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    }
};

// Run the seed
seed();