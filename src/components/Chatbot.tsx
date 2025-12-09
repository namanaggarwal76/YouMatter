import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, RefreshCw, AlertTriangle } from 'lucide-react';

// --- GEMINI API CONFIGURATION AND HELPERS ---

// The model and base URL for the Gemini API
const GEMINI_MODEL = "gemini-2.5-flash-preview-05-20";
const API_URL_BASE = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=`;
// NOTE: Must be empty string for the Canvas environment to inject the key at runtime
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ""; 

/**
 * Utility function to perform fetch with retry (exponential backoff).
 */
const fetchWithRetry = async (url, options, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                // Throw an error to trigger retry (for transient errors or server errors)
                const errorBody = await response.json().catch(() => ({}));
                // Check if the API returned an explicit error message (e.g., API key issue, 400 bad request)
                const apiErrorMessage = errorBody.error?.message || response.statusText;
                throw new Error(`Server error: ${response.status} - ${apiErrorMessage}`);
            }
            return response;
        } catch (error) {
            if (i < retries - 1) {
                const delay = Math.pow(2, i) * 1000 + Math.random() * 500;
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                // On final failure, re-throw the original error
                throw error;
            }
        }
    }
    throw new Error("Exited fetch loop without success or failure.");
};


// --- CHAT LOGIC ---

/**
 * Handles chat interactions with the specialized YouMatter Wellness Coach persona.
 * This function integrates the prompt logic directly with the Gemini API.
 */
const chat = async (message) => {
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

    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000, // INCREASED TOKEN LIMIT TO PREVENT TRUNCATION
        }
    };

    const url = `${API_URL_BASE}${apiKey}`;

    const response = await fetchWithRetry(
        url,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }
    );
    
    const result = await response.json();

    // 1. CHECK FOR PROMPT FEEDBACK (Safety/Pacing) - NEW ROBUSTNESS
    const promptFeedback = result.promptFeedback;
    if (promptFeedback && promptFeedback.blockReason) {
        const safetyRatings = promptFeedback.safetyRatings || [];
        const blockReason = promptFeedback.blockReason;
        const blockedCategories = safetyRatings.map(r => `${r.category} (P: ${r.probability})`).join(', ');
        throw new Error(`Content Blocked: The model was unable to generate a response for this input (Reason: ${blockReason}). Please try rephrasing your message. Categories: [${blockedCategories}]`);
    }

    // 2. Extract reply
    const reply = result?.candidates?.[0]?.content?.parts?.[0]?.text;

    // 3. CHECK FOR EMPTY REPLY - FIX for "API returned an empty or malformed response."
    if (!reply) {
        console.error("API response missing text part:", JSON.stringify(result, null, 2));
        throw new Error("API returned an empty response. The model may have failed to generate content or the structure was unexpected.");
    }

    return reply;
};


// --- MOCKED EXTERNAL CONTEXT (Simplified for JSX) ---
const useAuth = () => {
    const addCoins = (amount) => {};
    const addXP = (amount) => {};
    return { addCoins, addXP };
};
// --- END MOCKING ---


const WellnessChatAssistant = () => {
    const [messages, setMessages] = useState([
        {
            id: '1',
            text: "Hi! I'm your Wellness Coach, focused on your Health, Wealth, and overall stability. How can I support you today?",
            sender: 'bot',
            timestamp: new Date().toISOString(),
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState(null);
    const messagesEndRef = useRef(null);
    const { addCoins, addXP } = useAuth();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]); 

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        setApiError(null); 
        
        const userMessage = {
            id: Date.now().toString(),
            text: input,
            sender: "user",
            timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        addCoins(2);
        addXP(1);

        try {
            const botText = await chat(userMessage.text);
            const botMessage = {
                id: (Date.now() + 1).toString(),
                text: botText,
                sender: "bot",
                timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (e) {
            console.error("Failed to process message:", e);
            setApiError(e.message || "An unexpected error occurred during API communication.");
            // Send a fallback message in the chat
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                text: "My apologies, I seem to be having trouble connecting to my service brain right now. Please try again in a moment, or check the error message above for details.",
                sender: "bot",
                timestamp: new Date().toISOString(),
            }]);
        } finally {
            setLoading(false);
        }
    };


    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };
    
    // Inline Tailwind configuration and global styles
    const tailwindConfig = `
        <script src="https://cdn.tailwindcss.com"></script>
        <script>
            tailwind.config = {
                theme: {
                    extend: {
                        fontFamily: {
                            sans: ['Inter', 'sans-serif'],
                        },
                    }
                }
            }
        </script>
        <style>
            body { 
                font-family: 'Inter', sans-serif; 
                background-color: #f4f7fa; 
                padding: 1rem;
            }
        </style>
    `;

    return (
        <>
            <div dangerouslySetInnerHTML={{ __html: tailwindConfig }} />
            <div className="max-w-lg mx-auto mt-4 bg-gray-50 rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex flex-col h-[600px]">
                    <div className="bg-white rounded-t-2xl shadow-lg p-4 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">Wellness Coach</h2>
                                <p className="text-xs text-gray-500">Holistic Wellness & Motivation</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 bg-gray-50 overflow-y-auto p-4 space-y-4">
                        {/* API Error Message Box */}
                        {apiError && (
                            <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-xl flex items-start space-x-2 text-sm font-medium">
                                <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                <p>{apiError}</p>
                            </div>
                        )}
                        
                        {/* Message Bubbles */}
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                        message.sender === 'bot' ? 'bg-indigo-600' : 'bg-gray-700'
                                    }`}
                                >
                                    {message.sender === 'bot' ? (
                                        <Bot className="w-4 h-4 text-white" />
                                    ) : (
                                        <User className="w-4 h-4 text-white" />
                                    )}
                                </div>

                                <div
                                    className={`max-w-[75%] rounded-xl p-3 shadow-md ${
                                        message.sender === 'bot'
                                            ? 'bg-white text-gray-800 border border-gray-200'
                                            : 'bg-indigo-500 text-white'
                                    }`}
                                >
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                                </div>
                            </div>
                        ))}

                        {/* Loading Indicator for Assistant */}
                        {loading && (
                            <div className="flex gap-3 flex-row">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-indigo-600">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                                <div className="max-w-[75%] rounded-xl p-3 bg-white border border-gray-200 shadow-md">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-150"></div>
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-300"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="bg-white rounded-b-2xl shadow-lg p-4 border-t border-gray-200">
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={loading ? "Coach is typing..." : "Ask me about health, wealth, or motivation..."}
                                disabled={loading}
                                className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || loading}
                                className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-indigo-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center w-12"
                                aria-label="Send Message"
                            >
                                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const App = () => <WellnessChatAssistant />;
export default App;
