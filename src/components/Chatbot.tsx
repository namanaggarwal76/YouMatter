import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { ChatMessage } from '../types';
import { useAuth } from '../context/AuthContext';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addCoins, addXP } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = async (userMessage: string) => {
  const res = await fetch("http://localhost:3001/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userMessage }),
  });
  const data = await res.json();
  return data.reply;
};

const handleSend = async () => {
  if (!input.trim()) return;

  const userMessage: ChatMessage = {
    id: Date.now().toString(),
    text: input,
    sender: "user",
    timestamp: new Date().toISOString(),
  };

  setMessages(prev => [...prev, userMessage]);
  setInput("");

  addCoins(2);
  addXP(1);

  const botText = await getBotResponse(input);
  const botMessage: ChatMessage = {
    id: (Date.now() + 1).toString(),
    text: botText,
    sender: "bot",
    timestamp: new Date().toISOString(),
  };
  setMessages(prev => [...prev, botMessage]);
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
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white rounded-b-2xl shadow-lg p-6 border-t border-gray-200">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
