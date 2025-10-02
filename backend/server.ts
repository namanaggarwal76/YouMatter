import express, { Request, Response } from "express";
import 'dotenv/config';
import bodyParser from "body-parser";
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- Express Setup ---
const app = express();
app.use(bodyParser.json());
app.use((req, res, next) => {
    // Allows CORS from any origin for development purposes
    const origin = req.headers.origin as string | undefined;
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// --- Gemini Setup ---
if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY not set. Add it to your .env file.");
}
// Initialize the client using the API key from environment variables
const geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
// Get the model instance once for efficiency
const geminiModel = geminiClient.getGenerativeModel({ model: "gemini-2.5-flash" });

// --- JSON Schema for Structured Challenges ---
const challengeSchema = {
    type: "ARRAY",
    description: "An array of 3 personalized daily challenges.",
    items: {
        type: "OBJECT",
        properties: {
            action: { type: "STRING", description: "A clear, actionable daily task, e.g., 'Take a 15-minute walk.'" },
            points: { type: "INTEGER", description: "Dynamic points awarded (5-50). Harder tasks should have more points." },
            motto: { type: "STRING", description: "A short, encouraging, and motivational message." }
        },
        required: ["action", "points", "motto"]
    }
};


// --- Data Store ---
const logs: Record<number, string> = {};
let idCounter = 0;

// --- Types ---
interface AddLogRequest extends Request { body: { text: string } }
// Removed 'query' since it wasn't used in the original logic, but kept the interface for clarity if needed later
interface GenerateChallengesRequest extends Request { body: { userContext?: string } } 
interface ChatRequest extends Request { body: { message: string } }

// --- Endpoints ---

// Store logs
app.post("/add-log", async (req: AddLogRequest, res: Response) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });
    logs[idCounter] = text;
    console.log(`Log added: ID ${idCounter}, Text: "${text}"`);
    res.json({ message: "Log stored", id: idCounter++ });
});

/**
 * Generates structured challenges based on accumulated user logs.
 */
app.post("/generate-challenges", async (req: GenerateChallengesRequest, res: Response) => {
    // The query is optional, as the main context comes from stored logs.
    
    try {
        const retrievedLogs = Object.values(logs).join("\n") || "No previous logs.";

        const prompt = `
You are a gamified wellness coach.
Based on the following user logs, generate 3 personalized daily challenges.
The output MUST be a strict JSON array following the provided schema.

User logs:
${retrievedLogs}

Task: Generate today's challenges.
        `;

        const response = await geminiModel.generateContent(
            [prompt], 
            {
                config: {
                    temperature: 0.7,
                    maxOutputTokens: 500,
                    // *** CRITICAL for structured output ***
                    responseMimeType: "application/json", 
                    responseSchema: challengeSchema,
                }
            } as any 
        );

        // The response text is guaranteed to be a JSON string due to the schema
        const challengesJsonString = response.response.text();
        
        try {
            const challenges = JSON.parse(challengesJsonString);
            console.log("Successfully generated and parsed challenges.");
            res.json({ challenges });
        } catch (e) {
            console.error("Failed to parse JSON response from Gemini:", e);
            res.status(500).json({ error: "Failed to parse AI response into structured data." });
        }

    } catch (err) {
        console.error("Error generating challenges:", err);
        res.status(500).json({ error: "Failed to generate challenges" });
    }
});

/**
 * Handles chat interactions with the specialized YouMatter Wellness Coach persona.
 */
app.post("/chat", async (req: ChatRequest, res: Response) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    try {
        const prompt = `
You are the **YouMatter Wellness Coach**, a friendly, motivating, and specialized AI assistant for a comprehensive mobile wellness platform focused on **Health, Wealth, and Financial Wellness**.

Your goal is to **drive user engagement, encourage feature discovery, and reinforce healthy habits** by giving short, actionable, and positive advice related to the user's overall wellness.

**Platform Context:**
1. **Focus:** Holistic wellness (Health, Financial stability, Wealth growth).
2. **Strategy:** The app uses **gamification, challenges, and rewards** to encourage daily active use.
3. **Problem:** Users struggle with motivation and discovering all features (like Policy Servicing and Aktivo).
4. **Goal:** **Increase daily feature usage and habit formation.**

**Instructions for Generating a Reply:**
1. **Persona:** Be friendly, encouraging, and highly positive.
2. **Actionable Advice:** Every piece of advice must be simple, clear, and immediately actionable.
3. **Contextual Hint:** Whenever possible, subtly hint at a related **YouMatter feature, challenge, or benefit** (e.g., "Check your next daily challenge," "Log this in your Aktivo tracker," or "Review your budget"). Do not invent features; use the *concept* of tracking, challenges, rewards, and policy review.
4. **Length:** Keep the response **brief and direct** (3-4 sentences max).

**User message:**
${message}
`;

        const response = await geminiModel.generateContent(
            [prompt], 
            {
                config: {
                    temperature: 0.7,
                    maxOutputTokens: 200,
                }
            } as any 
        );
        
        const reply = response.response.text();
        
        res.json({ reply });
    } catch (err) {
        console.error("Error generating chat reply:", err);
        res.status(500).json({ error: "Failed to get chatbot reply" });
    }
});

// --- Start server ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
