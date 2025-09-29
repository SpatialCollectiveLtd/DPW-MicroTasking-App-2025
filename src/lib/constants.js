"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SAMPLE_IMAGE_URLS = exports.SAMPLE_QUESTIONS = exports.SAMPLE_SETTLEMENTS = exports.APP_CONFIG = void 0;
// App constants
exports.APP_CONFIG = {
    WORK_HOURS: {
        START: 6, // 6 AM
        END: 18, // 6 PM
    },
    DAILY_TASK_TARGET: 300,
    PAYMENT: {
        BASE_PAY_KES: 760,
        TIERS: [
            { minAccuracy: 90, maxAccuracy: 100, bonusPercentage: 30, bonusAmount: 228 },
            { minAccuracy: 80, maxAccuracy: 89, bonusPercentage: 20, bonusAmount: 152 },
            { minAccuracy: 70, maxAccuracy: 79, bonusPercentage: 10, bonusAmount: 76 },
            { minAccuracy: 0, maxAccuracy: 69, bonusPercentage: 0, bonusAmount: 0 },
        ],
    },
    CONSENSUS: {
        MIN_RESPONSES: 5, // Minimum responses needed for consensus
        MIN_CONSENSUS_THRESHOLD: 0.6, // 60% agreement required
    },
};
// Sample data for development
exports.SAMPLE_SETTLEMENTS = [
    { id: '1', name: 'Mji wa Huruma', location: 'Nairobi' },
    { id: '2', name: 'Kayole Soweto', location: 'Nairobi' },
    { id: '3', name: 'Kariobangi', location: 'Machakos' },
];
exports.SAMPLE_QUESTIONS = [
    'Do you see a public waste bin?',
    'Is there visible street lighting in this image?',
    'Is there evidence of informal dumping or uncollected trash?',
];
exports.SAMPLE_IMAGE_URLS = [
    'https://upload.wikimedia.org/wikipedia/commons/a/a4/Warren_Street_tube_station_360_panorama.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/d/d4/Zurich_2015_view_from_Grossm%C3%BCnster_- panorama_view_2.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/8/87/Panoramica_Cattedrale_di_Siena.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/e/e6/Schloss_Nymphenburg_Steinerner_Saal_360-Grad-Panorama.jpg',
];
