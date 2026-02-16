const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
// Standard pdf-parse import for better compatibility
const pdf = require('pdf-parse');

// Initialize AI
const getAIInstance = () => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.warn("GEMINI_API_KEY is missing in env!");
        return null;
    }
    return new GoogleGenerativeAI(key);
};

exports.extractTextFromPDF = async (filePath) => {
    try {
        console.log(`Extracting text from: ${filePath}`);
        const dataBuffer = fs.readFileSync(filePath);

        // Standard pdf-parse usage (works as a function)
        const data = await pdf(dataBuffer);

        if (!data || !data.text) {
            console.warn("PDF extraction returned no text.");
            return "Empty resume content.";
        }

        console.log(`Successfully extracted ${data.text.length} characters.`);
        return data.text;
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        return "Error extracting text from PDF.";
    }
};

exports.analyzeResume = async (resumeText, jobDescription) => {
    const genAI = getAIInstance();

    if (!genAI) {
        console.warn("Using mock response due to missing API Key.");
        return getMockResponse();
    }

    try {
        // Use gemini-2.0-flash as requested
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
            You are an expert Resume Analyst and ATS (Applicant Tracking System) simulator.
            
            Analyze the following resume against the provided job description (or general role if JD is vague).
            
            Resume Text:
            "${resumeText.substring(0, 15000)}" 
            
            Job Description:
            "${jobDescription}"
            
            Provide a detailed analysis in JSON format. Return ONLY the raw JSON string. Structure:
            {
                "atsScore": (0-100 score),
                "keywordMatch": (0-100 score),
                "missingKeywords": ["list"],
                "formattingIssues": ["list"],
                "improvements": ["list"],
                "summary": "Professional summary."
            }
        `;

        console.log("Sending prompt to Gemini (gemini-2.0-flash)...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No valid JSON found in AI response");
        }

        const analysis = JSON.parse(jsonMatch[0]);
        console.log("Analysis completed successfully.");
        return analysis;

    } catch (error) {
        console.error('Error analyzing resume with AI:', error);
        return getMockResponse("Analysis failed: " + (error.message || "Unknown error"));
    }
};

const getMockResponse = (errorMsg = "") => ({
    atsScore: 75,
    keywordMatch: 60,
    missingKeywords: ["React", "Node.js", "Docker", "AWS"],
    formattingIssues: [errorMsg || "Could not analyze resume."],
    improvements: ["Quantify achievements", "Update skills section"],
    summary: "Fallback analysis due to technical issue."
});
