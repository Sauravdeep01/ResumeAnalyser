
const mongoose = require('mongoose');
const Resume = require('../models/Resume');
const Activity = require('../models/Activity');
const aiService = require('../utils/aiService');
const { validationResult } = require('express-validator');
const connectDB = require('../config/db');

// Create a new resume
exports.createResume = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { title, jobRole, status, skills, content, atsScore, suggestions } = req.body;

    try {
        await connectDB();
        const newResume = new Resume({
            user: req.user.id,
            title,
            jobRole,
            status,
            skills,
            content,
            atsScore,
            suggestions
        });

        const resume = await newResume.save();

        // Log Activity
        await new Activity({
            user: req.user.id,
            entity: resume._id,
            action: 'Created Resume'
        }).save();

        res.json(resume);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get all resumes with filtering, sorting, and search
exports.getResumes = async (req, res) => {
    try {
        await connectDB();
        let query = { user: req.user.id };

        // Search by title or job role
        if (req.query.search) {
            query.$or = [
                { title: { $regex: req.query.search, $options: 'i' } },
                { jobRole: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        // Filter by status
        if (req.query.status) {
            query.status = req.query.status;
        }

        // Sorting
        let sortQuery = { updatedAt: -1 };
        if (req.query.sort) {
            const sortField = req.query.sort;
            const sortOrder = req.query.order === 'asc' ? 1 : -1;
            sortQuery = { [sortField]: sortOrder };
        }

        const resumes = await Resume.find(query).sort(sortQuery);
        res.json(resumes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get single resume by ID
exports.getResumeById = async (req, res) => {
    try {
        await connectDB();
        const resume = await Resume.findById(req.params.id);

        if (!resume) {
            return res.status(404).json({ msg: 'Resume not found' });
        }

        if (resume.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        res.json(resume);
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Resume not found' });
        }
        res.status(500).send('Server Error');
    }
};

// Update resume
exports.updateResume = async (req, res) => {
    const { title, jobRole, status, skills, content, atsScore, suggestions } = req.body;

    // Build resume object
    const resumeFields = { updatedAt: Date.now() };
    if (title) resumeFields.title = title;
    if (jobRole) resumeFields.jobRole = jobRole;
    if (status) resumeFields.status = status;
    if (skills) resumeFields.skills = skills;
    if (content) resumeFields.content = content;
    if (atsScore) resumeFields.atsScore = atsScore;
    if (suggestions) resumeFields.suggestions = suggestions;

    try {
        await connectDB();
        let resume = await Resume.findById(req.params.id);

        if (!resume) return res.status(404).json({ msg: 'Resume not found' });

        if (resume.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        resume = await Resume.findByIdAndUpdate(
            req.params.id,
            { $set: resumeFields },
            { new: true }
        );

        // Log Activity
        await new Activity({
            user: req.user.id,
            entity: resume._id,
            action: 'Updated Resume'
        }).save();

        res.json(resume);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Delete resume
exports.deleteResume = async (req, res) => {
    try {
        await connectDB();
        const resume = await Resume.findById(req.params.id);

        if (!resume) {
            return res.status(404).json({ msg: 'Resume not found' });
        }

        if (resume.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await resume.deleteOne();

        // Log Activity
        await new Activity({
            user: req.user.id,
            entity: resume._id, // Keep the ID reference even if deleted
            action: 'Deleted Resume'
        }).save();

        res.json({ msg: 'Resume removed' });
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Resume not found' });
        }
        res.status(500).send('Server Error');
    }
};

// Get dashboard stats
exports.dashboardStats = async (req, res) => {
    try {
        await connectDB();
        const totalResumes = await Resume.countDocuments({ user: req.user.id });

        const statusDistribution = await Resume.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        const formattedDistribution = [
            { name: 'Completed', value: 0 },
            { name: 'Polishing', value: 0 },
            { name: 'Draft', value: 0 }
        ];

        statusDistribution.forEach(item => {
            const status = formattedDistribution.find(d => d.name === item._id);
            if (status) status.value = item.count;
        });

        const resumes = await Resume.find({ user: req.user.id });
        const totalScore = resumes.reduce((acc, curr) => acc + (curr.atsScore || 0), 0);
        const avgAtsScore = totalResumes > 0 ? (totalScore / totalResumes).toFixed(1) : 0;

        const recentActivities = await Activity.find({ user: req.user.id })
            .sort({ timestamp: -1 })
            .limit(5)
            .populate('entity', 'title');

        res.json({
            totalResumes,
            avgAtsScore,
            statusDistribution: formattedDistribution,
            recentActivities
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Upload and analyze resume
exports.uploadResume = async (req, res) => {
    try {
        await connectDB();
        if (!req.file) {
            return res.status(400).json({ msg: 'No file uploaded' });
        }

        const { title, jobRole, status } = req.body;
        const filePath = req.file.path;

        // 1. Extract Text
        let resumeText = "";
        try {
            resumeText = await aiService.extractTextFromPDF(filePath);
        } catch (e) {
            console.error("Text extraction failed", e);
            resumeText = "Could not extract text from PDF.";
        }

        // 2. AI Analysis
        // Use jobRole as the context if no specific JD provided
        const analysisContext = jobRole || "General Professional Role";
        const analysisResult = await aiService.analyzeResume(resumeText, analysisContext);

        // 3. Create Resume Record
        const newResume = new Resume({
            user: req.user.id,
            title: title || req.file.originalname,
            jobRole: jobRole || 'General',
            status: status || 'Draft',
            fileUrl: filePath, // Storing local path for now, in prod use S3/Cloudinary
            content: resumeText,
            atsScore: analysisResult.atsScore || 0,
            keywordMatch: analysisResult.keywordMatch || 0,
            analysisResults: {
                missingKeywords: analysisResult.missingKeywords || [],
                formattingIssues: analysisResult.formattingIssues || [],
                improvements: analysisResult.improvements || [],
                summary: analysisResult.summary || "No analysis available."
            },
            suggestions: analysisResult.improvements || [], // Backwards compatibility
            jobDescription: analysisContext
        });

        const resume = await newResume.save();

        // Log Activity
        await new Activity({
            user: req.user.id,
            entity: resume._id,
            action: 'Uploaded & Analyzed Resume'
        }).save();

        res.json(resume);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
