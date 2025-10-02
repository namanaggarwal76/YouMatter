# YouMatter - Wellness Gamification Platform

YouMatter is a comprehensive wellness gamification application that motivates users to maintain healthy habits through an engaging rewards system and social features.
## 🌟 Overview

YouMatter transforms personal wellness into an engaging, game-like experience where users earn rewards for healthy behaviors, participate in challenges, connect with communities, and track their progress through a sophisticated tier-based system.

## 🎯 Key Features

### 🏆 Gamification System
- **Tier-based Progression**: Advance through Bronze, Silver, Gold, Platinum, and Diamond tiers
- **XP & Coins**: Earn experience points and coins for completing wellness activities
- **Streak Tracking**: Maintain daily login streaks for bonus rewards
- **Badge System**: Unlock achievements for reaching milestones and completing challenges

### 💪 Wellness Challenges
- **7-Day Meditation Streak**: Build mindfulness habits with daily meditation
- **30-Day Walking Challenge**: Reach daily step goals for a full month
- **Hydration Hero**: Maintain proper water intake for 14 consecutive days
- **Sleep Master**: Achieve consistent 8-hour sleep schedules
- **Insurance Saver**: Special challenge offering real insurance discounts

### 👥 Social Features
- **Community Groups**: Join local, corporate, global, or sponsored wellness communities
- **Leaderboards**: Compete with friends, groups, or globally
- **Social Feed**: Share achievements and motivate others
- **Friend Invites**: Earn bonuses for bringing friends to the platform

### 🤖 AI Wellness Assistant
- **24/7 Support**: Get personalized wellness advice and motivation
- **Contextual Responses**: AI understands topics like stress, sleep, motivation, and exercise
- **Reward Integration**: Earn coins and XP for engaging with the chatbot

### 📊 Progress Tracking
- **Visual Dashboard**: Beautiful charts showing weekly activity patterns
- **Tier Progress**: Visual indicators of advancement toward next tier
- **Achievement Gallery**: Display earned badges and completed challenges

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd YouMatter
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173` to access the application

### Building for Production

```bash
npm run build
npm run preview
```

## 🎮 How to Use

### First Time Setup
1. **Create Account**: Enter your name and email to get started
2. **Receive Welcome Rewards**: Earn your first coins and XP
3. **Explore Dashboard**: Familiarize yourself with the interface

### Daily Activities
1. **Login Daily**: Maintain your streak for bonus rewards
2. **Complete Challenges**: Start and progress through wellness challenges
3. **Engage with Communities**: Join groups and participate in discussions
4. **Chat with AI**: Get personalized wellness advice
5. **Track Progress**: Monitor your advancement through tiers

### Earning Rewards
- **Daily Login**: +10 coins, +5 XP
- **Challenge Completion**: Variable rewards based on difficulty
- **Community Participation**: +20 coins, +10 XP for joining groups
- **Chatbot Interaction**: +2 coins, +1 XP per message
- **Friend Invites**: +20 coins bonus

## 🏗️ Technical Architecture

### Frontend Stack
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development environment
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Vite**: Fast build tool and development server
- **Lucide React**: Beautiful, consistent icon library

### Key Components
- **Authentication System**: Persistent login with local storage
- **Gamification Engine**: XP calculation, tier progression, and badge management
- **Challenge System**: Progress tracking and reward distribution
- **Social Features**: Group management and leaderboards
- **AI Chatbot**: Context-aware response system

### Data Management
- **Local Storage**: User data persistence between sessions
- **Context API**: Global state management for user and app state
- **Mock Data**: Comprehensive simulation of backend data

## 📱 User Interface

### Navigation Structure
- **Dashboard**: Overview of progress, stats, and recent activity
- **Groups**: Browse and join wellness communities
- **Challenges**: View available and active challenges
- **Leaderboards**: Compare progress with friends and global users
- **Chat**: Interact with AI wellness assistant

### Responsive Design
- **Mobile-First**: Optimized for mobile devices with touch-friendly interfaces
- **Progressive Enhancement**: Scales beautifully to larger screens
- **Accessibility**: ARIA labels and keyboard navigation support

## 🎯 Target Use Cases

### Individual Users
- Track personal wellness goals and habits
- Earn rewards for healthy behaviors
- Connect with like-minded individuals
- Receive personalized wellness guidance

### Corporate Wellness Programs
- Engage employees in health initiatives
- Create company-wide challenges and competitions
- Track organizational wellness metrics
- Reduce healthcare costs through prevention

### Insurance Companies
- Offer premium discounts for healthy behaviors
- Gamify preventive care activities
- Collect wellness data (with consent)
- Improve customer engagement and retention

### Healthcare Providers
- Supplement treatment with behavioral incentives
- Monitor patient progress between appointments
- Provide engaging health education
- Improve treatment adherence

## 🔧 Development

### Available Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run lint`: Run ESLint for code quality
- `npm run preview`: Preview production build
- `npm run typecheck`: Run TypeScript type checking

### Code Structure
```
src/
├── components/          # React components
├── context/            # React Context providers
├── utils/              # Utility functions and mock data
├── types.ts           # TypeScript type definitions
├── App.tsx            # Main application component
└── main.tsx          # Application entry point
```

## 🌟 Future Enhancements

### Planned Features
- **Real Blockchain Integration**: Actual cryptocurrency rewards
- **Wearable Device Sync**: Apple Health, Google Fit, Fitbit integration
- **Video Challenges**: Guided meditation and exercise videos
- **Telemedicine Integration**: Connect with healthcare providers
- **Advanced Analytics**: Detailed health insights and trends
- **AR/VR Experiences**: Immersive wellness activities

### Technical Improvements
- **Backend API**: Replace mock data with real backend services
- **Push Notifications**: Real-time engagement reminders
- **Offline Support**: Progressive Web App capabilities
- **Advanced Security**: OAuth, encryption, and privacy controls

## 📄 License

This project is part of the StarHack hackathon and is available for educational and demonstration purposes.

## 🤝 Contributing

This is a hackathon project, but contributions and feedback are welcome! Please feel free to:
- Report bugs or suggest features
- Submit pull requests for improvements
- Share ideas for wellness gamification

## 📞 Contact

For questions about this project or collaboration opportunities, please reach out through the hackathon platform.

---

**YouMatter** - Because your wellness journey matters, and we're here to make it engaging, rewarding, and fun! 🌟
