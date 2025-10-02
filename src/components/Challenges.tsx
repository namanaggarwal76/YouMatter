import React, { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';
import { Target, Clock, Coins, Award, CheckCircle, TrendingUp, Zap, X, AlertTriangle, RefreshCw } from 'lucide-react';

// --- API CONFIGURATION AND UTILITIES ---

// Hardcoded data values for the API payload
const HARDCODED_DATA = {
    daily_steps: 18000, // Example steps
    heart_rate_bpm: 75, // Example heart rate
    water_intake_oz: 20, // Example water intake
    daily_journal_entry: "I AM FEELING very very bad i have broken my leg i am lonely i feel sucidal please help me " // The required hardcoded text
};

// Placeholder for the Gemini API endpoint for text generation
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=';
const apiKey = "AIzaSyB7ur9J55WJGpNz1Ail-oiqlbYZ7-M9m_o"; // Leave as empty string for Canvas environment

/**
 * Utility function to perform fetch with exponential backoff for robustness.
 * This is now configured for the Gemini API format.
 */
const fetchWithRetry = async (url: string, options: RequestInit, retries = 3): Promise<any> => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url + apiKey, options); // Using apiKey here
            if (!response.ok) {
                // If API returns an error, throw it to trigger retry (for transient 5xx errors)
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        } catch (error) {
            console.error(`Attempt ${i + 1} failed:`, error);
            if (i < retries - 1) {
                // Exponential backoff wait time
                const delay = Math.pow(2, i) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw new Error("API call failed after multiple retries.");
            }
        }
    }
};

// --- TYPES AND INTERFACES ---

interface StaticChallenge {
    id: string;
    name: string;
    description: string;
    type: 'walking' | 'meditation' | 'hydration' | 'sleep' | 'daily' | 'hourly' | 'weekly' | string; 
    targetValue: number;
    rewardCoins: number;
    rewardXp: number;
    durationDays: number;
}

// Interface for the AI-generated challenges (same structure as StaticChallenge)
interface AiChallenge extends StaticChallenge {}

// Interface for challenges the user has accepted (in-progress)
interface ActiveChallenge extends StaticChallenge {
    startDate: number; // Unix timestamp
    progress: number; // Current progress value
    status: 'in-progress' | 'completed' | 'failed';
    isAiGenerated: boolean;
}

// Define the context structure
interface AuthContextType {
    isAuthenticated: boolean;
    userId: string;
}

interface ChallengesContextType {
    activeChallenges: ActiveChallenge[];
    staticChallenges: StaticChallenge[];
    aiChallenges: AiChallenge[];
    loadingAi: boolean;
    errorAi: string | null;
    startChallenge: (id: string, isAiGenerated: boolean) => void;
    completeChallenge: (id: string) => void;
    generateAiChallenges: () => void;
}

// --- MOCK DATA FOR SINGLE-FILE EXECUTION ---

const CHALLENGES_MOCK: StaticChallenge[] = [
    { id: 'walk-10k', name: 'Hit 10K Steps Daily', description: 'Walk 10,000 steps every day for the duration. (Repeatable Daily)', type: 'daily', targetValue: 70000, rewardCoins: 150, rewardXp: 50, durationDays: 7 },
    { id: 'meditate-5min', name: 'Meditate Daily', description: 'Complete a 5-minute meditation session daily. (Repeatable Daily)', type: 'daily', targetValue: 30, rewardCoins: 75, rewardXp: 20, durationDays: 30 },
    { id: 'drink-water', name: 'Drink 2L Water', description: 'Drink at least 68 ounces of water daily for a week. (Repeatable Daily)', type: 'daily', targetValue: 68 * 7, rewardCoins: 100, rewardXp: 30, durationDays: 7 },
    { id: 'early-bed', name: 'Early Bird', description: 'Go to bed before 11 PM for a whole week.', type: 'weekly', targetValue: 7, rewardCoins: 200, rewardXp: 80, durationDays: 7 },
];

// --- CONTEXT SETUP (MOCKING FIREBASE) ---

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const ChallengesContext = createContext<ChallengesContextType | undefined>(undefined);

const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

const useChallenges = () => {
    const context = useContext(ChallengesContext);
    if (!context) {
        throw new Error('useChallenges must be used within a ChallengesProvider');
    }
    return context;
};

// Mock Auth Provider (for single-file React component execution)
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // In a real app, this would handle Firebase auth state
    const authValue = useMemo(() => ({
        isAuthenticated: true,
        userId: 'mock-user-123',
    }), []);

    return (
        <AuthContext.Provider value={authValue}>
            {children}
        </AuthContext.Provider>
    );
};

// --- CHALLENGES PROVIDER (MOCKING STATE/FIRESTORE) ---

const ChallengesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { userId } = useAuth();
    const [activeChallenges, setActiveChallenges] = useState<ActiveChallenge[]>([]);
    const [aiChallenges, setAiChallenges] = useState<AiChallenge[]>([]);
    const [loadingAi, setLoadingAi] = useState(false);
    const [errorAi, setErrorAi] = useState<string | null>(null);
    
    // Static challenges are constant in this mock setup
    const staticChallenges = useMemo(() => CHALLENGES_MOCK, []);

    // Helper to find a challenge by ID
    const findChallenge = useCallback((id: string, isAi: boolean): StaticChallenge | AiChallenge | undefined => {
        if (isAi) {
            // Need to filter aiChallenges as well, since their IDs are dynamically generated
            return aiChallenges.find(c => c.id === id); 
        }
        return staticChallenges.find(c => c.id === id);
    }, [aiChallenges, staticChallenges]);

    const startChallenge = useCallback((id: string, isAiGenerated: boolean) => {
        const challengeToStart = findChallenge(id, isAiGenerated);
        if (challengeToStart) {
            // Check if already active (prevents duplicates in this mock)
            if (activeChallenges.some(c => c.id === id)) return;

            const newActiveChallenge: ActiveChallenge = {
                ...challengeToStart,
                startDate: Date.now(),
                progress: 0,
                status: 'in-progress',
                isAiGenerated: isAiGenerated,
            } as ActiveChallenge; // Cast to ActiveChallenge

            setActiveChallenges(prev => [...prev, newActiveChallenge]);
            console.log(`Challenge ${challengeToStart.name} started!`);
        }
    }, [activeChallenges, findChallenge]);

    // This is the core logic for completing a goal and "adding" the points/XP.
    const completeChallenge = useCallback((id: string) => {
        setActiveChallenges(prev => prev.map(c => {
            if (c.id === id) {
                // IMPORTANT: Logs the reward to the console, simulating the points being added.
                console.log(`Challenge ${c.name} completed! Awarding +${c.rewardCoins} Coins and +${c.rewardXp} XP.`);
                return { ...c, status: 'completed', progress: c.targetValue };
            }
            return c;
        }));
    }, []);

    // --- GEMINI API INTEGRATION ---
    const generateAiChallenges = useCallback(async () => {
        setLoadingAi(true);
        setErrorAi(null);

        const prompt = `
You are an expert, encouraging, and analytical Wellness Coach. Your task is to analyze the user's recent health metrics and generate exactly 3 diverse, actionable, and encouraging daily wellness goals to help them achieve better well-being.

1.  **Analyze the data** provided below to identify any metric that is below or significantly above optimal ranges (Optimal steps: 10,000; Optimal water: 80 oz; Optimal sleep: 7-9 hours; Typical resting heart rate: 60-100 bpm).
2.  **Generate a daily challenge** (Goal) for each of the 3 chosen areas. Ensure the 'targetValue' is the *increase or decrease* required to reach a better well-being state. If all metrics are optimal, generate diverse goals focusing on mental or social health (e.g., 'mindfulness', 'social').
3.  **Strictly adhere** to the required JSON schema for the output. Do not include any conversational text, explanations, or markdown outside of the JSON array.

Based on the following current user data:
Steps: ${HARDCODED_DATA.daily_steps}
Heart Rate: ${HARDCODED_DATA.heart_rate_bpm} BPM
Water Intake: ${HARDCODED_DATA.water_intake_oz} oz
Journal Mood: "${HARDCODED_DATA.daily_journal_entry}"

**REQUIRED JSON SCHEMA:**
[
  {
    "id": "goal-1",
    "name": "Goal Title (e.g., 'Boost Your Steps' or 'Hydration Hero')",
    "description": "Actionable, specific instruction for the daily challenge (e.g., 'Walk an additional 1500 steps today to hit the 10,000 step mark.')",
    "type": "walking" | "hydration" | "sleep" | "mindfulness" | "activity",
    "targetValue": 1500, // The specific numerical target for the challenge (e.g., extra steps, oz, minutes of sleep)
    "rewardCoins": 100,
    "rewardXp": 30,
    "durationDays": 1 // Keep this at 1 for a 'daily challenge'
  },
  // ... two more objects following this schema, totaling exactly 3.
]`;

        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            "id": { "type": "STRING", "description": "A unique, short identifier for the challenge, e.g., 'ai-1', 'ai-2'." },
                            "name": { "type": "STRING", "description": "A short, engaging name for the challenge." },
                            "description": { "type": "STRING", "description": "A detailed, encouraging, and specific description of the goal." },
                            "type": { "type": "STRING", "description": "The type of goal: 'walking', 'meditation', 'hydration', 'sleep', or 'daily'." },
                            "targetValue": { "type": "NUMBER", "description": "The numerical target required to complete the challenge (e.g., total steps, minutes, reps)." },
                            "rewardCoins": { "type": "NUMBER", "description": "The coin reward for completing this goal." },
                            "rewardXp": { "type": "NUMBER", "description": "The XP reward for completing this goal." },
                            "durationDays": { "type": "NUMBER", "description": "The duration of the challenge in days." }
                        },
                        required: ["id", "name", "description", "type", "targetValue", "rewardCoins", "rewardXp", "durationDays"]
                    }
                }
            },
        };

        try {
            // Updated call to use fetchWithRetry, which handles the apiKey logic
            const result = await fetchWithRetry(GEMINI_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const jsonString = result?.candidates?.[0]?.content?.parts?.[0]?.text;

            if (jsonString) {
                // --- FIX FOR AI RESPONSE FORMATTING (Cleaning up the string) ---
                let cleanedJsonString = jsonString.trim();
                
                // Remove leading markdown fence if present (e.g., ```json)
                if (cleanedJsonString.startsWith('```json')) {
                    cleanedJsonString = cleanedJsonString.substring(7).trim();
                }
                // Remove trailing markdown fence if present (e.g., ```)
                if (cleanedJsonString.endsWith('```')) {
                    cleanedJsonString = cleanedJsonString.substring(0, cleanedJsonString.length - 3).trim();
                }
                // Remove extraneous newline characters (the source of your formatting issue)
                cleanedJsonString = cleanedJsonString.replace(/[\r\n]+/g, ''); 
                
                // The API returns the JSON as a string, so we must parse it.
                const newChallenges: AiChallenge[] = JSON.parse(cleanedJsonString);
                
                // Ensure IDs are unique for the session
                const uniqueAiChallenges = newChallenges.map((c, index) => ({
                    ...c,
                    id: `ai-${userId}-${Date.now() + index}` 
                }));
                setAiChallenges(uniqueAiChallenges);
            } else {
                setErrorAi("API response was malformed or empty.");
                setAiChallenges([]); // Reset to empty array to prevent error
            }

        } catch (err) {
            console.error("Failed to generate AI challenges:", err);
            setErrorAi("Could not generate goals. Please try again.");
            setAiChallenges([]); // Reset to empty array to prevent error
        } finally {
            setLoadingAi(false);
        }
    }, [userId]);

    // Initial load of AI challenges (or trigger when component mounts)
    useEffect(() => {
        if (userId) {
            generateAiChallenges();
        }
    }, [userId, generateAiChallenges]);

    const contextValue = useMemo(() => ({
        activeChallenges,
        staticChallenges,
        aiChallenges,
        loadingAi,
        errorAi,
        startChallenge,
        completeChallenge,
        generateAiChallenges,
    }), [activeChallenges, staticChallenges, aiChallenges, loadingAi, errorAi, startChallenge, completeChallenge, generateAiChallenges]);

    return (
        <ChallengesContext.Provider value={contextValue}>
            {children}
        </ChallengesContext.Provider>
    );
};

// --- PRESENTATIONAL COMPONENTS ---

// Helper to get the icon for a challenge type
const getChallengeIcon = (type: string) => {
    switch (type.toLowerCase()) {
        case 'walking': return <Target className="w-5 h-5 text-indigo-500" />;
        case 'meditation': return <Clock className="w-5 h-5 text-purple-500" />;
        case 'hydration': return <Zap className="w-5 h-5 text-blue-500" />;
        case 'sleep': return <TrendingUp className="w-5 h-5 text-green-500" />;
        case 'daily': return <CheckCircle className="w-5 h-5 text-teal-500" />;
        default: return <Target className="w-5 h-5 text-gray-500" />;
    }
};

interface ChallengeCardProps {
    challenge: StaticChallenge | AiChallenge;
    onStart: (id: string) => void;
    isActive: boolean;
    isAiGenerated: boolean;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, onStart, isActive, isAiGenerated }) => (
    <div className={`p-6 rounded-xl shadow-lg transition-all w-full ${isActive ? 'bg-indigo-100/70 border-2 border-indigo-500' : 'bg-white hover:shadow-xl'}`}>
        <div className="flex items-center justify-between w-full">
            {/* Left section: Icon, title, description */}
            <div className="flex items-start flex-grow">
                <div className="flex-shrink-0 mr-4">
                    {getChallengeIcon(challenge.type)}
                </div>
                <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900">{challenge.name}</h3>
                        {isAiGenerated && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500 text-white">AI Goal</span>
                        )}
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{challenge.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs font-semibold">
                        <span className="flex items-center text-amber-600">
                            <Coins className="w-3 h-3 mr-1" /> +{challenge.rewardCoins}
                        </span>
                        <span className="flex items-center text-blue-600">
                            <Award className="w-3 h-3 mr-1" /> +{challenge.rewardXp} XP
                        </span>
                    </div>
                </div>
            </div>

            {/* Right section: Action button */}
            <div className="flex-shrink-0 ml-6">
                {isActive ? (
                    <button
                        disabled
                        className="px-6 py-2 bg-gray-400 text-white rounded-lg text-sm font-semibold cursor-not-allowed whitespace-nowrap"
                    >
                        Goal Active
                    </button>
                ) : (
                    <button
                        onClick={() => onStart(challenge.id)}
                        className="px-6 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors whitespace-nowrap"
                    >
                        Accept Goal
                    </button>
                )}
            </div>
        </div>
    </div>
);


// --- DAILY ACTIVITIES COMPONENT ---

const DailyActivities: React.FC = () => {
    const { activeChallenges, completeChallenge } = useChallenges();

    // Filters for challenges that are currently in progress
    const dailyActivities = useMemo(() => activeChallenges.filter(c => c.status === 'in-progress'), [activeChallenges]);

    return (
        <div className="mb-12 p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-indigo-700 mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-indigo-600" />
                Current Daily Activities ({dailyActivities.length})
            </h2>
            <div className="space-y-4">
                {dailyActivities.length > 0 ? (
                    dailyActivities.map(activity => (
                        <div 
                            key={activity.id} 
                            // Daily activity card styling
                            className="p-4 bg-indigo-50 rounded-xl shadow-inner flex flex-col sm:flex-row justify-between items-start sm:items-center transition-shadow hover:bg-indigo-100"
                        >
                            <div className="flex-grow mb-2 sm:mb-0">
                                <h3 className="text-lg font-semibold text-gray-800">{activity.name}</h3>
                                <p className="text-sm text-gray-500 mb-2 line-clamp-1">{activity.description}</p>
                                
                                {/* DISPLAY POINTS BELOW IT */}
                                <div className="flex items-center space-x-4 text-sm font-medium">
                                    <span className="flex items-center text-amber-600">
                                        <Coins className="w-4 h-4 mr-1" /> **+{activity.rewardCoins} Coins**
                                    </span>
                                    <span className="flex items-center text-blue-600">
                                        <Award className="w-4 h-4 mr-1" /> **+{activity.rewardXp} XP**
                                    </span>
                                </div>
                            </div>
                            
                            {/* CLICK TO COMPLETE CHALLENGE AND ADD POINTS */}
                            <button
                                onClick={() => completeChallenge(activity.id)}
                                className="w-full sm:w-auto ml-0 sm:ml-4 flex-shrink-0 bg-green-500 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors shadow-md"
                            >
                                Complete Goal
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="p-4 bg-gray-100 rounded-lg text-center text-gray-600 border border-gray-200">
                        <p className="font-medium">All clear! Accept a goal below to start tracking your activities.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- CHALLENGES LIST COMPONENT (FOR ACCEPTING NEW GOALS) ---

interface ChallengesListProps {
    staticChallenges: StaticChallenge[];
    aiChallenges: AiChallenge[];
    activeChallenges: ActiveChallenge[];
    loadingAi: boolean;
    errorAi: string | null;
    handleStartChallenge: (id: string, isAiGenerated: boolean) => void;
    handleGenerateAiChallenges: () => void;
}

const ChallengesList: React.FC<ChallengesListProps> = ({ 
    staticChallenges, 
    aiChallenges, 
    activeChallenges, 
    loadingAi, 
    errorAi,
    handleStartChallenge,
    handleGenerateAiChallenges
}) => {
    const activeIds = useMemo(() => new Set(activeChallenges.map(c => c.id)), [activeChallenges]);

    return (
        <>
            {/* AI-Generated Goals Section */}
            <div className="mb-10">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Personalized AI Goals</h2>
                    <button
                        onClick={handleGenerateAiChallenges}
                        disabled={loadingAi}
                        className="flex items-center text-sm font-semibold px-3 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loadingAi ? 'animate-spin' : ''}`} />
                        {loadingAi ? 'Generating...' : 'Regenerate Goals'}
                    </button>
                </div>

                {errorAi && (
                    <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-lg flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        {errorAi}
                    </div>
                )}
                
                {loadingAi && !aiChallenges.length && (
                    <div className="p-10 text-center text-gray-500 bg-white rounded-xl shadow-lg">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                        <p className='font-medium'>Crunching your data to find the best goals...</p>
                    </div>
                )}

                <div className="flex flex-col gap-4">
                    {Array.isArray(aiChallenges) && aiChallenges.map((challenge) => {
                        const isAiGenerated = true;
                        return (
                            <ChallengeCard
                                key={challenge.id}
                                challenge={challenge}
                                onStart={() => handleStartChallenge(challenge.id, isAiGenerated)}
                                isActive={activeIds.has(challenge.id)}
                                isAiGenerated={isAiGenerated}
                            />
                        )
                    })}
                </div>
                {!loadingAi && Array.isArray(aiChallenges) && aiChallenges.length === 0 && !errorAi && (
                    <p className="text-center text-gray-500 py-6">No AI goals available yet. Click 'Regenerate Goals' above.</p>
                )}
            </div>

            {/* Standard Challenges Section */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Standard & Repeatable Goals</h2>
                <div className="flex flex-col gap-4">
                    {Array.isArray(staticChallenges) && staticChallenges.map((challenge) => {
                        const isAiGenerated = false;
                        return (
                            <ChallengeCard
                                key={challenge.id}
                                challenge={challenge}
                                onStart={() => handleStartChallenge(challenge.id, isAiGenerated)}
                                isActive={activeIds.has(challenge.id)}
                                isAiGenerated={isAiGenerated}
                            />
                        )
                    })}
                </div>
            </div>
        </>
    );
};

// --- MAIN APPLICATION COMPONENT ---

const WellnessTrackerApp = () => {
    return (
        <ChallengesProvider>
            <ChallengesInner />
        </ChallengesProvider>
    );
};

const ChallengesInner = () => {
    const { 
        staticChallenges, 
        aiChallenges, 
        activeChallenges, 
        loadingAi, 
        errorAi,
        startChallenge, 
        generateAiChallenges,
    } = useChallenges();

    const handleStartChallenge = useCallback((id: string, isAiGenerated: boolean) => {
        // Simple log replacement for success message
        console.log(`Attempting to start challenge ${id}.`);
        startChallenge(id, isAiGenerated);
    }, [startChallenge]);

    return (
        <div className="min-h-screen bg-gray-50 font-sans p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-extrabold text-indigo-700 mb-10 text-center">Your Wellness Dashboard</h1>

                {/* New Daily Activities Section - where active goals are displayed */}
                <DailyActivities />
                
                <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-12 border-b-2 border-indigo-100 pb-3">New Goals To Accept</h2>

                {/* Challenges List - where new goals are presented */}
                <ChallengesList
                    staticChallenges={staticChallenges}
                    aiChallenges={aiChallenges}
                    activeChallenges={activeChallenges}
                    loadingAi={loadingAi}
                    errorAi={errorAi}
                    handleStartChallenge={handleStartChallenge}
                    handleGenerateAiChallenges={generateAiChallenges}
                />
            </div>
        </div>
    );
};

// Main App component wrapping with the mock context
const App = () => (
    <AuthProvider>
        <WellnessTrackerApp />
    </AuthProvider>
);

export default App;
