const natural = require('natural');
const path = require('path');

const CLASSIFIER_PATH = path.join(__dirname, '..', 'data', 'classifier.json');

// Bayes classifier instance
let classifier = null;

// Categories for email classification
const CATEGORIES = {
    PERSONAL: 'Personal',
    BUSINESS: 'Business',
    FINANCE: 'Finance',
    SECURITY: 'Security',
    WORK: 'Work',
    EDUCATION: 'College/School',
    PROMOTION: 'Promotion',
    UNCATEGORIZED: 'Uncategorized'
};

/**
 * Initialize and train the Bayes classifier with sample data
 */
const initializeClassifier = () => {
    classifier = new natural.BayesClassifier();
    return classifier;
};

/**
 * Train the classifier with sample data for all categories
 * @param {Array} trainingData - Array of { text, category } objects
 */
const trainClassifier = (trainingData) => {
    if (!classifier) {
        initializeClassifier();
    }

    trainingData.forEach(data => {
        classifier.addDocument(data.text, data.category);
    });

    classifier.train();
    console.log(`Classifier trained with ${trainingData.length} samples`);
};

/**
 * Classify email text and return the category with confidence score
 * @param {string} text - The email text to classify
 * @returns {Object} - { category, confidence, allClassifications }
 */
const classifyEmail = (text) => {
    if (!classifier) {
        console.warn('Classifier not initialized, returning default category');
        return {
            category: CATEGORIES.UNCATEGORIZED,
            confidence: 0,
            allClassifications: [{ label: CATEGORIES.UNCATEGORIZED, value: 1 }]
        };
    }

    // Clean and prepare text
    const cleanedText = cleanText(text);

    // Get classification
    const category = classifier.getClassifications(cleanedText);

    if (!category || category.length === 0) {
        return {
            category: CATEGORIES.UNCATEGORIZED,
            confidence: 0,
            allClassifications: [{ label: CATEGORIES.UNCATEGORIZED, value: 1 }]
        };
    }

    // The first classification is the best match
    const bestMatch = category[0];

    return {
        category: bestMatch.label,
        confidence: bestMatch.value,
        allClassifications: category
    };
};

/**
 * Clean text for better classification
 * @param {string} text - Raw text
 * @returns {string} - Cleaned text
 */
const cleanText = (text) => {
    if (!text) return '';

    // Convert to lowercase
    let cleaned = text.toLowerCase();

    // Remove special characters but keep spaces
    cleaned = cleaned.replace(/[^\w\s]/g, ' ');

    // Remove extra whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    return cleaned;
};

/**
 * Get the current classifier instance
 */
const getClassifier = () => classifier;

/**
 * Check if classifier is trained
 */
const isTrained = () => {
    return !!classifier && classifier.docs && classifier.docs.length > 0;
};

/**
 * Save classifier to a file (optional persistence)
 */
const saveClassifier = async (filename = CLASSIFIER_PATH) => {
    if (!classifier) return false;

    try {
        return new Promise((resolve, reject) => {
            classifier.save(filename, (err) => {
                if (err) {
                    console.error('Error saving classifier:', err);
                    resolve(false);
                    return;
                }
                console.log(`Classifier saved to ${filename}`);
                resolve(true);
            });
        });
    } catch (error) {
        console.error('Unexpected error saving classifier:', error);
        return false;
    }
};

/**
 * Load classifier from a file (optional persistence)
 */
const loadClassifier = async (filename = CLASSIFIER_PATH) => {
    try {
        return new Promise((resolve, reject) => {
            natural.BayesClassifier.load(filename, null, (err, loadedClassifier) => {
                if (err) {
                    console.log(`Could not load classifier from ${filename}: ${err.message}`);
                    resolve(false);
                    return;
                }
                classifier = loadedClassifier;
                console.log(`Classifier loaded from ${filename}`);
                resolve(true);
            });
        });
    } catch (error) {
        console.log(`Unexpected error loading classifier: ${error.message}`);
        return false;
    }
};

module.exports = {
    initializeClassifier,
    trainClassifier,
    classifyEmail,
    getClassifier,
    isTrained,
    saveClassifier,
    loadClassifier,
    CATEGORIES
};