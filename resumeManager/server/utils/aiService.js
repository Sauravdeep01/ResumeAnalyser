const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
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
        const data = await pdf(dataBuffer);

        if (!data || !data.text) {
            return "Empty resume content.";
        }
        return data.text;
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        return "Error extracting text from PDF.";
    }
};

exports.analyzeResume = async (resumeText, jobDescription) => {
    const genAI = getAIInstance();
    if (!genAI) return getMockResponse();

    // List of models to try in order of preference
    const modelsToTry = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-pro"];
    let lastError = null;

    for (const modelName of modelsToTry) {
        try {
            console.log(`Attempting analysis with: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });

            const prompt = `
                You are an expert Resume Analyst and ATS simulator.
                Analyze the following resume against the job description.
                
                Resume: "${resumeText.substring(0, 15000)}" 
                JD: "${jobDescription}"
                
                Return ONLY raw JSON:
                {
                    "atsScore": (0-100),
                    "keywordMatch": (0-100),
                    "missingKeywords": [],
                    "formattingIssues": [],
                    "improvements": [],
                    "summary": ""
                }
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error("No valid JSON found");

            return JSON.parse(jsonMatch[0]);

        } catch (error) {
            lastError = error;
            console.warn(`${modelName} failed or rate limited: ${error.message}`);
            // If it's a 429 (Rate Limit), move to the next model immediately
            if (error.message.includes('429') || error.message.includes('quota')) {
                continue;
            }
            // For other errors, break and use mock
            break;
        }
    }

    return getMockResponse(`Analysis failed: ${lastError?.message || "Quota Exceeded"}`);
};

const getMockResponse = (errorMsg = "") => ({
    atsScore: 75,
    keywordMatch: 60,
    missingKeywords: ["React", "Node.js", "Docker", "AWS"],
    formattingIssues: [errorMsg || "Rate limit reached. Please try again in 1 minute."],
    improvements: ["Try again shortly - the AI is currently busy."],
    summary: "Note: We are seeing high demand on the AI service. Showing a sample report."
});
