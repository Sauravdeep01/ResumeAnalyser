# 📄 Resume Manager - AI-Powered ATS Optimization Platform

A comprehensive full-stack web application that allows users to upload their resumes, analyze them using AI, and receive detailed ATS (Applicant Tracking System) scores with actionable improvement suggestions.

## ✨ Features

### 🤖 AI-Powered Resume Analysis
- **PDF Upload**: Upload resume PDFs for automatic text extraction
- **ATS Score Calculation**: Get a comprehensive 0-100 ATS compatibility score
- **Keyword Analysis**: Identify missing keywords based on target job role
- **Formatting Feedback**: Receive suggestions on resume structure and format
- **Role-Specific Suggestions**: Get tailored improvement recommendations for your target position

### 📊 Interactive Dashboard
- **Analytics Overview**: View total resumes, average ATS scores, and activity metrics
- **Visual Charts**: Pie charts showing resume status distribution (Draft, Polishing, Completed)
- **Recent Activity Feed**: Track all resume-related actions
- **Search & Filter**: Quickly find resumes by title, job role, or status
- **Expandable Analysis**: View detailed AI insights for each resume

### 🎨 Modern UI/UX
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Interactive Cards**: Hover effects and smooth animations
- **Color-Coded Scores**: Visual indicators for ATS score ranges (green/yellow/red)
- **Collapsible Forms**: Clean, organized interface with minimal clutter
- **Real-time Updates**: Instant feedback and loading states

### 🔐 User Authentication
- **Secure Login/Register**: JWT-based authentication
- **Protected Routes**: All resume data is user-specific and secure
- **Activity Logging**: Track all user actions for accountability

## 🛠️ Tech Stack

### Backend
- **Node.js** & **Express.js**: RESTful API server
- **MongoDB** & **Mongoose**: Database and ODM
- **Google Gemini AI**: Advanced resume analysis and scoring
- **Multer**: File upload handling
- **pdf-parse**: PDF text extraction
- **JWT**: Secure authentication
- **bcryptjs**: Password hashing

### Frontend
- **React**: Component-based UI
- **Axios**: HTTP client for API calls
- **Recharts**: Data visualization (charts)
- **Lucide React**: Modern icon library
- **Tailwind CSS v4**: Utility-first styling
- **Vite**: Fast development build tool

## 📁 Project Structure

```
resumeManager/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React Context (Auth)
│   │   ├── pages/         # Page components (Dashboard, Login, Register)
│   │   ├── App.jsx        # Main app component
│   │   └── index.css      # Tailwind CSS imports
│   ├── vite.config.js     # Vite configuration
│   └── package.json       # Frontend dependencies
│
├── server/                # Backend Node.js application
│   ├── config/           # Database configuration
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Auth & upload middleware
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes
│   ├── utils/            # AI service utilities
│   ├── uploads/          # Uploaded resume files
│   ├── server.js         # Express server entry point
│   ├── .env              # Environment variables
│   └── package.json      # Backend dependencies
│
└── README.md             # This file
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (local or Atlas cloud)
- **Google Gemini API Key** ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd resumeManager
   ```

2. **Install Backend Dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Configure Environment Variables**
   
   Create/update `server/.env`:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

   > **Important**: Replace `your_gemini_api_key_here` with your actual Gemini API key for AI analysis to work.

5. **Run the Application**

   **Terminal 1 - Backend:**
   ```bash
   cd server
   npm run dev
   # or
   nodemon server.js
   ```

   **Terminal 2 - Frontend:**
   ```bash
   cd client
   npm run dev
   ```

6. **Access the Application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Resume Management
- `POST /api/resume/upload` - Upload & analyze resume (PDF)
- `POST /api/resume` - Create resume manually
- `GET /api/resume` - Get all user resumes (supports search, filter, sort)
- `GET /api/resume/:id` - Get single resume
- `PUT /api/resume/:id` - Update resume
- `DELETE /api/resume/:id` - Delete resume
- `GET /api/resume/dashboard/stats` - Get dashboard analytics

## 🧠 AI Analysis Features

The AI service (`server/utils/aiService.js`) provides:

1. **Text Extraction**: Automatically extracts text from uploaded PDF resumes
2. **Contextual Analysis**: Analyzes resume against the specified job role
3. **Comprehensive Scoring**:
   - Overall ATS Score (0-100)
   - Keyword Match Score (0-100)
   - Missing Keywords identification
   - Formatting issues detection
   - Actionable improvement suggestions
   - Summary of resume strengths

### Mock Mode
If `GEMINI_API_KEY` is not configured, the system automatically uses mock data for testing purposes.

## 🎯 Usage Guide

### Uploading a Resume

1. Click **"Create / Upload Resume"** button
2. Fill in:
   - **Resume Title**: e.g., "Senior Frontend Developer Resume"
   - **Target Job Role**: e.g., "Full Stack Engineer" (crucial for AI analysis)
   - **Status**: Draft, Polishing, or Completed
3. Click **"Select PDF"** and choose your resume file
4. Click **"Analyze & Save"**
5. Wait for AI processing (shows loading spinner)
6. View your ATS score and detailed analysis!

### Viewing Analysis

- Each resume card shows:
  - ATS Score with color-coded progress bar
  - AI Insight snippet
  - Status badge
  - Last updated date
- Click **"View Analysis"** to expand and see:
  - Missing keywords
  - AI improvement suggestions
  - Detailed feedback

### Managing Resumes

- **Search**: Type in the search bar to filter by title or job role
- **Filter**: Click status buttons (All, Draft, Polishing, Completed)
- **Edit**: Click the Edit button on any resume card
- **Delete**: Click the trash icon to remove a resume

## 🔧 Configuration

### Tailwind CSS v4
The project uses Tailwind CSS v4 with the Vite plugin. Configuration is handled automatically through `@import "tailwindcss";` in `client/src/index.css`.

### File Upload
- **Accepted Format**: PDF only
- **Max Size**: 5MB
- **Storage**: Local filesystem (`server/uploads/`)
- **Production Note**: Consider using cloud storage (AWS S3, Cloudinary) for production

## 🐛 Troubleshooting

### AI Analysis Not Working
- Ensure `GEMINI_API_KEY` is set in `server/.env`
- Check API key validity at [Google AI Studio](https://makersuite.google.com/)
- Review server console for error messages

### PDF Upload Fails
- Verify file is a valid PDF
- Check file size is under 5MB
- Ensure `uploads/` directory exists in `server/`

### Database Connection Issues
- Verify `MONGO_URI` in `.env`
- Check MongoDB service is running
- Ensure network connectivity to MongoDB Atlas (if using cloud)

## 🚀 Deployment

### Backend (Heroku/Railway/Render)
1. Set environment variables in platform dashboard
2. Ensure `uploads/` directory is writable (or use cloud storage)
3. Deploy from Git repository

### Frontend (Vercel/Netlify)
1. Update API base URL in frontend code
2. Build: `npm run build`
3. Deploy `dist/` folder

## 📝 Future Enhancements

- [ ] Support for DOCX file uploads
- [ ] Multiple resume versions comparison
- [ ] Export optimized resume as PDF
- [ ] Job description paste/upload for better matching
- [ ] Resume templates library
- [ ] Cover letter generation
- [ ] LinkedIn profile integration
- [ ] Email notifications for analysis completion

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

Built with ❤️ for helping job seekers optimize their resumes for ATS systems.

---

**Note**: Remember to keep your `.env` file secure and never commit it to version control. Add it to `.gitignore`!
