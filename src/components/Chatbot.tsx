import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, RefreshCw } from 'lucide-react'; // ADDED RefreshCw

// --- MOCKED EXTERNAL TYPES AND CONTEXT ---
// In a single-file environment, we must mock the imported types/contexts.

interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: string;
}

const useAuth = () => {
    // Mock the functions used in the component
    const addCoins = (amount: number) => console.log(`[Auth Mock] Rewarded ${amount} Coins for chat.`);
    const addXP = (amount: number) => console.log(`[Auth Mock] Rewarded ${amount} XP for chat.`);
    return { addCoins, addXP };
};
// --- END MOCKING ---


export const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hi! I'm your wellness assistant. I'm here to help with stress, sleep, motivation, and exercise tips. How can I support you today?",
      sender: 'bot',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false); // ADDED loading state
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addCoins, addXP } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]); // Added loading to dependency array

  const getBotResponse = async (userMessage: string) => {
    // This function relies on an external Node server at http://localhost:3001
    try {
        const res = await fetch("http://localhost:3001/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userMessage }),
        });

        if (!res.ok) {
             const errorData = await res.json().catch(() => ({ error: "Unknown backend error" }));
             throw new Error(`Backend Error: ${res.status} - ${errorData.error || res.statusText}`);
        }
        
        const data = await res.json();
        return data.reply;
    } catch (e) {
        console.error("Error communicating with backend:", e);
        // Fallback message for connection error
        return "I'm having trouble connecting to the server. Please ensure the backend is running at port 3001.";
    }
};

const handleSend = async () => {
  if (!input.trim() || loading) return; // Check if already loading

  const userMessage: ChatMessage = {
    id: Date.now().toString(),
    text: input,
    sender: "user",
    timestamp: new Date().toISOString(),
  };

  setMessages(prev => [...prev, userMessage]);
  setInput("");
  setLoading(true); // START loading indicator

  addCoins(2);
  addXP(1);

  try {
    const botText = await getBotResponse(userMessage.text); // Use userMessage.text for safety
    const botMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: botText,
      sender: "bot",
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, botMessage]);
  } catch (e) {
      console.error("Failed to process message:", e);
      // The error message is now handled inside getBotResponse, but we keep the outer catch for general failure
  } finally {
    setLoading(false); // END loading indicator
  }
};


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="bg-white rounded-t-2xl shadow-lg p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Wellness Assistant</h2>
            <p className="text-sm text-gray-500">Always here to help</p>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.sender === 'bot'
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                  : 'bg-gradient-to-br from-gray-600 to-gray-700'
              }`}
            >
              {message.sender === 'bot' ? (
                <Bot className="w-5 h-5 text-white" />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>

            <div
              className={`max-w-[75%] rounded-2xl p-4 ${
                message.sender === 'bot'
                  ? 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800'
                  : 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white'
              }`}
            >
              <p className="text-sm leading-relaxed">{message.text}</p>
            </div>
          </div>
        ))}

        {/* Loading Indicator for Assistant (Typing Side) */}
        {loading && (
            <div className="flex gap-3 flex-row">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600">
                    <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="max-w-[75%] rounded-2xl p-4 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800">
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

      <div className="bg-white rounded-b-2xl shadow-lg p-6 border-t border-gray-200">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={loading ? "Coach is typing..." : "Type your message..."} // Updated placeholder
            disabled={loading} // Disabled while loading
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading} // Disabled if input is empty OR loading
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

const App = () => <Chatbot />;
export default App;
