
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const resumeController = require('../controllers/resumeController');
const { check } = require('express-validator');

// @route   POST api/resume/upload
// @desc    Upload and analyze resume
// @access  Private
router.post('/upload', auth, upload.single('resume'), resumeController.uploadResume);

// @route   POST api/resume
// @desc    Create a resume
// @access  Private
router.post(
    '/',
    [
        auth,
        [
            check('title', 'Title is required').not().isEmpty()
        ]
    ],
    resumeController.createResume
);

// @route   GET api/resume
// @desc    Get all users resumes
// @access  Private
router.get('/', auth, resumeController.getResumes);

// @route   GET api/resume/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/dashboard/stats', auth, resumeController.dashboardStats);

// @route   GET api/resume/:id
// @desc    Get resume by ID
// @access  Private
router.get('/:id', auth, resumeController.getResumeById);

// @route   DELETE api/resume/:id
// @desc    Delete resume
// @access  Private
router.delete('/:id', auth, resumeController.deleteResume);

// @route   PUT api/resume/:id
// @desc    Update resume
// @access  Private
router.put('/:id', auth, resumeController.updateResume);

module.exports = router;
