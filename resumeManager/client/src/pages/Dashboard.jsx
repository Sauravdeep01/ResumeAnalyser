
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit, FileText, Search, Filter, TrendingUp, Clock, CheckCircle, Upload, X, ChevronDown, ChevronUp, AlertCircle, Sparkles, Zap, Award, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001';

const Dashboard = () => {
    // Custom Animations
    const animationStyles = `
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fadeInUp 0.6s ease-out forwards;
        }
    `;
    // State for data
    const [resumes, setResumes] = useState([]);
    const [stats, setStats] = useState({
        totalResumes: 0,
        avgAtsScore: 0,
        statusDistribution: [],
        recentActivities: []
    });

    // State for UI/UX
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [expandedResume, setExpandedResume] = useState(null);

    // Form state
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [showForm, setShowForm] = useState(true); // Default to true since it's the main action now
    const [isSubmitting, setIsSubmitting] = useState(false);

    // New state for analysis results
    const [currentAnalysis, setCurrentAnalysis] = useState(null);
    const [showResults, setShowResults] = useState(false);

    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [paramsRes, statsRes] = await Promise.all([
                axios.get(`${API_URL}/api/resume`, {
                    params: { search: searchTerm, status: filterStatus === 'All' ? '' : filterStatus }
                }),
                axios.get(`${API_URL}/api/resume/dashboard/stats`)
            ]);

            setResumes(paramsRes.data);
            setStats(statsRes.data);
        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    };

    // Re-fetch when filters change
    useEffect(() => {
        const fetchFiltered = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/resume`, {
                    params: { search: searchTerm, status: filterStatus === 'All' ? '' : filterStatus }
                });
                setResumes(res.data);
            } catch (err) {
                console.error(err);
            }
        }
        // Debounce search
        const timeoutId = setTimeout(() => fetchFiltered(), 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, filterStatus]);


    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!file) {
            alert("Please select a file first");
            return;
        }

        setIsSubmitting(true);
        setCurrentAnalysis(null);
        setShowResults(false);

        try {
            const formData = new FormData();
            formData.append('resume', file);
            // Default values since user doesn't want to provide them
            formData.append('title', file.name.replace('.pdf', ''));
            formData.append('jobRole', 'Software Engineer'); // Default role
            formData.append('status', 'Draft');

            const response = await axios.post(`${API_URL}/api/resume/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Set the analysis result to show immediately
            setCurrentAnalysis(response.data);
            setShowResults(true);

            // Re-fetch to update the grid
            fetchDashboardData();

            // Reset file input
            setFile(null);

            // Scroll to results
            setTimeout(() => {
                const resultsElement = document.getElementById('analysis-results');
                if (resultsElement) {
                    resultsElement.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);

        } catch (err) {
            console.error(err);
            alert("Error analyzing resume. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this resume?')) {
            try {
                await axios.delete(`${API_URL}/api/resume/${id}`);
                fetchDashboardData();
            } catch (err) {
                console.error(err);
            }
        }
    };

    const toggleExpand = (id) => {
        if (expandedResume === id) {
            setExpandedResume(null);
        } else {
            setExpandedResume(id);
        }
    };

    // Drag and drop handlers
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type === 'application/pdf') {
            setFile(droppedFile);
        } else {
            alert("Please upload a PDF file.");
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
        } else if (selectedFile) {
            alert("Please upload a PDF file.");
        }
    };

    // Colors for charts
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    if (loading && resumes.length === 0) return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
                <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-500" size={20} />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <style>{animationStyles}</style>
            <div className="max-w-7xl mx-auto space-y-10">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                            <Zap className="text-yellow-500 fill-yellow-500" /> AI Resume Scanner
                        </h1>
                        <p className="text-slate-500 mt-2 text-lg">Get instant ATS feedback and keyword optimization</p>
                    </div>
                </div>

                {/* Upload Section (Main Focus) */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl transition-all duration-300">
                    <div className="p-8">
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`relative border-2 border-dashed rounded-xl p-12 transition-all duration-300 flex flex-col items-center justify-center text-center
                                ${isDragging ? 'border-blue-500 bg-blue-50 scale-[0.99] shadow-inner' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400'}
                                ${file ? 'border-green-500 bg-green-50' : ''}`}
                        >
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                className="hidden"
                                id="file-upload"
                                ref={fileInputRef}
                            />

                            {!file ? (
                                <>
                                    <div className={`p-4 rounded-full mb-4 transition-transform duration-300 ${isDragging ? 'scale-110 bg-blue-100 text-blue-600' : 'bg-white text-slate-400 shadow-sm'}`}>
                                        <Upload size={48} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-2">Drag and drop your resume here</h3>
                                    <p className="text-slate-500 mb-6 max-w-xs">Supports PDF files for instant AI analysis and ATS scoring</p>
                                    <button
                                        onClick={() => fileInputRef.current.click()}
                                        className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg hover:shadow-blue-200 transform hover:-translate-y-0.5 active:translate-y-0"
                                    >
                                        Select File
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="p-4 rounded-full bg-green-100 text-green-600 mb-4 animate-bounce">
                                        <CheckCircle size={48} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-2">{file.name}</h3>
                                    <p className="text-green-600 font-medium mb-6">File ready for analysis</p>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setFile(null)}
                                            className="px-6 py-2 text-slate-600 font-medium hover:text-slate-800 transition"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            disabled={isSubmitting}
                                            className={`bg-blue-600 text-white px-8 py-2 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg flex items-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                    Analyzing...
                                                </>
                                            ) : (
                                                <>Scan Now <Sparkles size={18} /></>
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Analysis Results Display */}
                {showResults && currentAnalysis && (
                    <div id="analysis-results" className="bg-white border-2 border-blue-200 rounded-3xl overflow-hidden shadow-2xl animate-fade-in-up">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                <div>
                                    <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                                        <Award className="text-yellow-400" size={32} /> Analysis Complete
                                    </h2>
                                    <p className="text-blue-100 text-lg">Detailed feedback for your {currentAnalysis.title}</p>
                                </div>
                                <div className="relative">
                                    <div className="w-32 h-32 rounded-full border-8 border-white/20 flex items-center justify-center">
                                        <div className="text-center">
                                            <span className="text-4xl font-black">{currentAnalysis.atsScore}%</span>
                                            <p className="text-[10px] uppercase font-bold tracking-widest opacity-80">ATS Score</p>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-green-500 p-2 rounded-full shadow-lg border-2 border-white">
                                        <Zap size={20} className="fill-white text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Required Keywords */}
                            <div className="lg:col-span-1 space-y-6">
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <Target className="text-red-500" size={20} /> Missing Keywords
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {currentAnalysis.analysisResults?.missingKeywords?.length > 0 ? (
                                            currentAnalysis.analysisResults.missingKeywords.map((keyword, i) => (
                                                <span key={i} className="bg-red-50 text-red-700 px-3 py-1.5 rounded-lg text-sm font-semibold border border-red-100">
                                                    {keyword}
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-slate-500 italic">No missing keywords found!</p>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <CheckCircle className="text-green-500" size={20} /> Formatting Status
                                    </h3>
                                    <ul className="space-y-3">
                                        {currentAnalysis.analysisResults?.formattingIssues?.length > 0 ? (
                                            currentAnalysis.analysisResults.formattingIssues.map((issue, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                                    <AlertCircle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                                                    {issue}
                                                </li>
                                            ))
                                        ) : (
                                            <li className="flex items-center gap-2 text-sm text-green-600 font-medium">
                                                <CheckCircle size={16} /> Great formatting!
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </div>

                            {/* Detailed Analysis & Improvements */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                                    <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                                        <Sparkles className="text-blue-600" size={20} /> AI Summary
                                    </h3>
                                    <p className="text-slate-700 leading-relaxed italic text-lg">
                                        "{currentAnalysis.analysisResults?.summary || 'No summary available.'}"
                                    </p>
                                </div>

                                <div className="bg-white p-6 rounded-2xl border border-slate-200">
                                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <TrendingUp className="text-indigo-600" size={20} /> Actionable Improvements
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {currentAnalysis.analysisResults?.improvements?.length > 0 ? (
                                            currentAnalysis.analysisResults.improvements.map((improvement, i) => (
                                                <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                    <div className="bg-indigo-100 text-indigo-600 p-1.5 rounded-lg shrink-0">
                                                        <Plus size={16} />
                                                    </div>
                                                    <p className="text-sm text-slate-700">{improvement}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-slate-500 col-span-2 italic">No specific improvements suggested.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                {/* Analytics Cards (Optional, move down) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 opacity-80 hover:opacity-100 transition-opacity">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                            <FileText size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Scans</p>
                            <h3 className="text-2xl font-black text-slate-900">{stats.totalResumes}</h3>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Lifetime Avg</p>
                            <h3 className="text-2xl font-black text-slate-900">{stats.avgAtsScore}%</h3>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Optimizations</p>
                            <h3 className="text-2xl font-black text-slate-900">{stats.recentActivities.length}</h3>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                        <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Last Activity</p>
                            <p className="text-xs font-bold text-slate-600 line-clamp-1">
                                {stats.recentActivities[0] ? `${new Date(stats.recentActivities[0].timestamp).toLocaleDateString()}` : "None"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Resumes History */}
                <div className="pt-6">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Recent Scans</h2>
                        <div className="flex items-center gap-4">
                            <div className="relative hidden sm:block">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search history..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition w-64"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {resumes.map(resume => (
                            <div key={resume._id} className="group bg-white rounded-2xl shadow-md border border-slate-200 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 flex flex-col h-full overflow-hidden">
                                <div className="p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="bg-slate-900 p-4 rounded-xl text-white shadow-xl group-hover:bg-blue-600 transition-colors">
                                            <FileText size={24} />
                                        </div>
                                        <div className="text-right">
                                            <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${resume.atsScore >= 80 ? 'bg-green-100 text-green-700' :
                                                resume.atsScore >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                                {resume.atsScore >= 80 ? 'Strong' : resume.atsScore >= 60 ? 'Good' : 'Needs Work'}
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-1 font-bold">{new Date(resume.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition truncate mb-2">{resume.title}</h3>

                                    <div className="mt-6 flex items-end gap-3">
                                        <span className={`text-4xl font-black ${resume.atsScore >= 80 ? 'text-green-600' :
                                            resume.atsScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                            {resume.atsScore}%
                                        </span>
                                        <span className="text-slate-400 text-sm font-bold pb-1 uppercase tracking-widest">Score</span>
                                    </div>

                                    <div className="mt-4 w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
                                        <div
                                            className={`h-full transition-all duration-1000 ease-out ${resume.atsScore >= 80 ? 'bg-green-500' :
                                                resume.atsScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                            style={{ width: `${resume.atsScore}%` }}
                                        ></div>
                                    </div>

                                    {resume.analysisResults && resume.analysisResults.summary && (
                                        <p className="mt-6 text-sm text-slate-600 line-clamp-2 italic font-medium">"{resume.analysisResults.summary}"</p>
                                    )}
                                </div>

                                <div className="mt-auto bg-slate-50 px-8 py-4 flex justify-between items-center border-t border-slate-100">
                                    <button
                                        onClick={() => toggleExpand(resume._id)}
                                        className="text-slate-900 font-black text-xs uppercase tracking-widest hover:text-blue-600 transition flex items-center gap-1"
                                    >
                                        {expandedResume === resume._id ? 'Close' : 'View Analysis'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(resume._id)}
                                        className="text-slate-300 hover:text-red-600 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                {expandedResume === resume._id && (
                                    <div className="bg-slate-50 p-8 border-t border-slate-200 animate-fade-in text-sm space-y-6">
                                        <div>
                                            <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                                                <Target size={14} className="text-red-500" /> Missing
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {resume.analysisResults.missingKeywords.slice(0, 8).map(k => (
                                                    <span key={k} className="bg-white border border-slate-200 text-slate-700 px-2 py-1 rounded text-[10px] font-bold">{k}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                                                <TrendingUp size={14} className="text-blue-500" /> Suggestions
                                            </h4>
                                            <ul className="space-y-2">
                                                {resume.analysisResults.improvements.slice(0, 3).map((imp, i) => (
                                                    <li key={i} className="text-slate-600 flex items-start gap-2">
                                                        <span className="text-blue-500 font-bold">•</span> {imp}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {resumes.length === 0 && !loading && (
                        <div className="text-center py-24 bg-white rounded-3xl border-4 border-dashed border-slate-100">
                            <FileText className="mx-auto h-20 w-20 text-slate-200 mb-6" />
                            <h3 className="text-2xl font-black text-slate-900">No resumes scanned yet</h3>
                            <p className="mt-2 text-slate-500">Upload your first resume above to get started.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
