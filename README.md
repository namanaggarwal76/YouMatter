# YouMatter - Wellness Gamification Platform

A comprehensive React-based wellness application that gamifies healthy habits through rewards, challenges, AI coaching, and social features. Built with modern web technologies and designed for engagement and behavioral change.

## �� Overview

YouMatter transforms personal wellness into an engaging, game-like experience where users earn rewards for healthy behaviors, participate in AI-generated challenges, connect with communities, and track their progress through a sophisticated tier-based system. The application integrates Supabase for authentication and data management, making it a full-stack wellness solution.

## ✨ Key Features

### 🏆 Gamification Engine
- **Tier Progression System**: Advance through Bronze, Silver, Gold, Platinum, and Diamond tiers.
- **Dynamic XP & Coin Rewards**: Earn experience points and coins for completing wellness activities.
- **Streak Tracking**: Maintain daily login streaks with bonus multipliers.
- **Achievement Badge System**: Unlock badges for milestones and challenge completions.
- **Real-time Progress Calculation**: Live tier advancement and reward distribution.

### 💪 Smart Challenge System
- **Static Wellness Challenges**: Pre-built challenges for meditation, walking, hydration, and sleep.
- **AI-Generated Personal Goals**: Gemini AI analyzes user data to create personalized daily challenges.
- **Progress Tracking**: Real-time monitoring of challenge completion and streaks.
- **Reward Distribution**: Automatic XP and coin rewards upon challenge completion.

### 👥 Social & Community Features
- **Community Groups**: Join local, corporate, global, or sponsored wellness communities.
- **Interactive Leaderboards**: Compete with friends and global users with live rankings.
- **Social Feed**: Share achievements, post updates, and motivate others.
- **Friend System**: Add friends, view profiles, and compare progress.

### 🤖 AI Wellness Coach
- **Gemini AI Integration**: Context-aware chatbot powered by Google's Gemini 2.5 Flash.
- **Personalized Coaching**: Provides advice on health and wellness.
- **24/7 Availability**: Always-on support for motivation and guidance.

### 📊 Advanced Health Tracking
- **Real-time Vital Monitoring**: Track heart rate, water intake, steps, and sleep hours.
- **Interactive Charts**: Detailed visualization using Recharts library.
- **Data Visualization**: Daily and weekly trend analysis with line and bar charts.
- **Supabase Integration**: Persistent health data storage and retrieval.

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Supabase (Auth, Database)
- **AI**: Google Gemini API
- **Visualization**: Recharts
- **Icons**: Lucide React

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18 or higher
- **npm** or **yarn** package manager
- **Supabase Account**
- **Google Gemini API Key**

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/namanaggarwal76/YouMatter.git
   cd YouMatter
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Fill in your API keys:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Database Setup**
   - Go to your Supabase project's SQL Editor.
   - Run the contents of `setup_users_table.sql` to create the necessary tables and policies.

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Open browser to `http://localhost:5173`