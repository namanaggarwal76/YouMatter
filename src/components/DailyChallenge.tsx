import React, { useState } from "react";
import api from "../utils/api";

interface DailyChallengeProps {
  challenges?: string[];
}

// Helper function to parse the AI-generated string into an array of challenges
const parseChallenges = (challengeString: string): string[] => {
    if (!challengeString) return [];
    
    // Split the string by newlines or list markers (like 1., 2., 3.)
    // This regex looks for: 1. or 2. or 3. followed by a space, and splits the string.
    // We filter out empty strings and trim whitespace.
    const challenges = challengeString.split(/\d+\.\s+/)
        .map(c => c.trim())
        .filter(c => c.length > 0 && c !== 'Task: Generate today\'s challenges.');
        
    // If splitting didn't work well (e.g., if the AI returned pure blocks of text), 
    // fall back to splitting by double newlines.
    return challenges.length > 1 ? challenges : challengeString.split(/\n\s*\n/).map(c => c.trim()).filter(c => c.length > 0);
};

export const DailyChallenge: React.FC<DailyChallengeProps> = ({ challenges: initialChallenges = [] }) => {
  const [challenges, setChallenges] = useState<string[]>(initialChallenges);
  const [loading, setLoading] = useState(false);

  const generateChallenges = async () => {
    setLoading(true);
    try {
        // The API call is correct, passing a query to trigger the backend logic
      const data = await api.generateChallenges("Generate today's personalized challenges");
      
      // The API response comes back as a single string (data.challenges)
      if (typeof data.challenges === 'string') {
          // Parse the single string into an array of challenges
          const parsed = parseChallenges(data.challenges);
          setChallenges(parsed);
      } else if (Array.isArray(data.challenges)) {
          // Fallback just in case the backend format changes to an array
          setChallenges(data.challenges);
      } else {
          setChallenges(["Error: Invalid challenge format received."]);
      }
      
    } catch (err) {
      console.error("Error generating challenges:", err);
      setChallenges(["Failed to generate challenges."]);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Today's Personalized Challenges</h2>
      <button
        onClick={generateChallenges}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Generating Challenges..." : "Start My Daily Challenges"}
      </button>

      <div className="space-y-3 pt-2">
        {challenges.length === 0 && !loading ? (
          <p className="text-gray-500 text-center">Press the button above to generate your first set of personalized wellness challenges!</p>
        ) : (
          challenges.map((challenge, idx) => (
            <div
              key={idx}
              className="bg-gray-50 p-4 rounded-lg shadow-inner border border-gray-200 text-sm"
            >
              <span className="font-semibold text-blue-600 mr-2">Challenge {idx + 1}:</span>
              {challenge}
            </div>
          ))
        )}
      </div>
    </div>
  );
};