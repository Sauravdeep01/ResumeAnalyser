
const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    title: {
        type: String,
        required: true
    },
    jobRole: {
        type: String,
        default: 'General'
    },
    status: {
        type: String,
        enum: ['Draft', 'Polishing', 'Completed'],
        default: 'Draft'
    },
    skills: {
        type: [String],
        default: []
    },
    fileUrl: {
        type: String // URL or path to the stored resume file if uploaded
    },
    content: {
        type: String // Extracted text content for analysis
    },
    atsScore: {
        type: Number,
        default: 0
    },
    keywordMatch: {
        type: Number,
        default: 0
    },
    analysisResults: {
        missingKeywords: [String],
        formattingIssues: [String],
        improvements: [String],
        summary: String
    },
    jobDescription: {
        type: String // Optional: store the specific JD used for analysis
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Resume', ResumeSchema);
