import React from 'react';
import { Target, Clock, Coins, Award, CheckCircle, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CHALLENGES } from '../utils/mockData';

export const Challenges: React.FC = () => {
  const { user, startChallenge, updateChallengeProgress, addCoins, addXP } = useAuth();
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [newChallenge, setNewChallenge] = React.useState({ name: '', duration: 1, frequency: 'daily' });

  if (!user) return null;

  // Split challenges
  const acceptedChallenges = user.activeChallenges.map(ac => {
    return CHALLENGES.find(c => c.id === ac.challengeId);
  }).filter(Boolean);
  const acceptedIds = user.activeChallenges.map(ac => ac.challengeId);
  const otherChallenges = CHALLENGES.filter(c => !acceptedIds.includes(c.id));

  const getActiveChallenge = (challengeId: string) => {
    return user.activeChallenges.find(c => c.challengeId === challengeId);
  };

  const handleStartChallenge = (challengeId: string) => {
    startChallenge(challengeId);
  };

  const handleSimulateProgress = (challengeId: string) => {
    const challenge = CHALLENGES.find(c => c.id === challengeId);
    const activeChallenge = getActiveChallenge(challengeId);
    if (!challenge || !activeChallenge) return;
    const increment = Math.floor(challenge.targetValue * 0.15);
    const newProgress = Math.min(activeChallenge.progress + increment, challenge.targetValue);
    updateChallengeProgress(challengeId, newProgress);
    if (newProgress >= challenge.targetValue && !activeChallenge.completed) {
      addCoins(challenge.rewardCoins);
      addXP(challenge.rewardXp);
      const updatedChallenges = user.activeChallenges.map(c => {
        if (c.challengeId === challengeId) {
          return { ...c, completed: true, completedAt: new Date().toISOString() };
        }
        return c;
      });
      user.activeChallenges = updatedChallenges;
    }
  };

  const getChallengeIcon = (type: string) => {
    return Target;
  };

  const getChallengeColor = (type: string) => {
    switch (type) {
      case 'meditation': return 'from-purple-500 to-indigo-600';
      case 'walking': return 'from-green-500 to-emerald-600';
      case 'hydration': return 'from-cyan-500 to-blue-600';
      case 'sleep': return 'from-blue-500 to-indigo-600';
      case 'insurance': return 'from-amber-500 to-orange-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const formatProgress = (value: number, targetValue: number) => {
    if (targetValue >= 10000) {
      return `${(value / 1000).toFixed(1)}K / ${(targetValue / 1000).toFixed(0)}K steps`;
    }
    return `${value} / ${targetValue} days`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Challenges</h1>
          <p className="text-gray-600">Take on challenges to earn rewards and improve your wellness</p>
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          onClick={() => setShowAddModal(true)}
        >
          Add Challenge
        </button>
      </div>

      {/* Accepted Challenges */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Accepted Challenges</h2>
        <div className="grid gap-4">
          {acceptedChallenges.length === 0 && <p className="text-gray-500">No accepted challenges yet.</p>}
          {acceptedChallenges.map((challenge) => {
            if (!challenge) return null;
            const Icon = getChallengeIcon(challenge.type);
            const activeChallenge = getActiveChallenge(challenge.id);
            const isCompleted = activeChallenge?.completed || false;
            const progress = activeChallenge?.progress || 0;
            const progressPercent = (progress / challenge.targetValue) * 100;
            // Completion timing logic
            let canComplete = true;
            let nextAvailable = null;
            if (activeChallenge) {
              const lastCompleted = activeChallenge.completedAt ? new Date(activeChallenge.completedAt) : null;
              if (lastCompleted) {
                let now = new Date();
                if (challenge.type === 'daily') {
                  // Next available after 24 hours
                  let next = new Date(lastCompleted.getTime() + 24 * 60 * 60 * 1000);
                  if (now < next) {
                    canComplete = false;
                    nextAvailable = next;
                  }
                } else if (challenge.type === 'hourly') {
                  let next = new Date(lastCompleted.getTime() + 60 * 60 * 1000);
                  if (now < next) {
                    canComplete = false;
                    nextAvailable = next;
                  }
                } else if (challenge.type === 'weekly') {
                  let next = new Date(lastCompleted.getTime() + 7 * 24 * 60 * 60 * 1000);
                  if (now < next) {
                    canComplete = false;
                    nextAvailable = next;
                  }
                }
              }
            }
            return (
              <div key={challenge.id} className={`bg-white rounded-2xl shadow-lg p-6 transition-all ${isCompleted ? 'border-2 border-green-400' : ''}`}>
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${getChallengeColor(challenge.type)} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{challenge.name}</h3>
                        <p className="text-sm text-gray-500 capitalize">{challenge.type} Challenge</p>
                      </div>
                      {isCompleted && (
                        <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-semibold">Completed</span>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{challenge.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{challenge.durationDays} days</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-600">
                        <Coins className="w-4 h-4" />
                        <span className="font-semibold">+{challenge.rewardCoins}</span>
                      </div>
                      <div className="flex items-center gap-1 text-blue-600">
                        <Award className="w-4 h-4" />
                        <span className="font-semibold">+{challenge.rewardXp} XP</span>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-semibold text-gray-800">{formatProgress(progress, challenge.targetValue)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${getChallengeColor(challenge.type)} transition-all duration-500`} style={{ width: `${Math.min(progressPercent, 100)}%` }} />
                      </div>
                      <p className="text-right text-xs text-gray-500 mt-1">{Math.round(progressPercent)}%</p>
                    </div>
                    {!isCompleted ? (
                      <>
                        <button
                          onClick={() => {
                            if (canComplete) {
                              handleSimulateProgress(challenge.id);
                            } else {
                              // Show message
                              alert(`You can complete this challenge again at ${nextAvailable ? nextAvailable.toLocaleString() : ''}`);
                            }
                          }}
                          className={`flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${!canComplete ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={false}
                        >
                          <TrendingUp className="w-5 h-5" />
                          {canComplete ? 'Complete' : nextAvailable ? `Next: ${nextAvailable.toLocaleString()}` : 'Complete'}
                        </button>
                        {!canComplete && nextAvailable && (
                          <div className="mt-2 text-sm text-red-500">You can complete this challenge again at {nextAvailable.toLocaleString()}.</div>
                        )}
                      </>
                    ) : (
                      <button
                        disabled
                        className="flex-1 bg-gray-200 text-gray-500 py-3 rounded-xl font-semibold cursor-not-allowed"
                      >
                        Challenge Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Other Challenges */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Other Challenges</h2>
        <div className="grid gap-4">
          {otherChallenges.length === 0 && <p className="text-gray-500">No other challenges available.</p>}
          {otherChallenges.map((challenge) => {
            const Icon = getChallengeIcon(challenge.type);
            return (
              <div key={challenge.id} className="bg-white rounded-2xl shadow-lg p-6 transition-all">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${getChallengeColor(challenge.type)} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{challenge.name}</h3>
                        <p className="text-sm text-gray-500 capitalize">{challenge.type} Challenge</p>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{challenge.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{challenge.durationDays} days</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-600">
                        <Coins className="w-4 h-4" />
                        <span className="font-semibold">+{challenge.rewardCoins}</span>
                      </div>
                      <div className="flex items-center gap-1 text-blue-600">
                        <Award className="w-4 h-4" />
                        <span className="font-semibold">+{challenge.rewardXp} XP</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleStartChallenge(challenge.id)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
                    >
                      Accept Challenge
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Challenge Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Add Personal Challenge</h3>
            <form
              onSubmit={e => {
                e.preventDefault();
                const id = 'personal-' + Date.now();
                const challenge = {
                  id,
                  name: newChallenge.name,
                  description: newChallenge.name + ' (Personal challenge)',
                  type: newChallenge.frequency,
                  targetValue: newChallenge.duration,
                  rewardCoins: 50,
                  rewardXp: 25,
                  durationDays: newChallenge.duration,
                };
                // Add to CHALLENGES array if possible (for demo, use window.CHALLENGES)
                if (Array.isArray(window.CHALLENGES)) {
                  window.CHALLENGES.push(challenge);
                } else if (Array.isArray(CHALLENGES)) {
                  CHALLENGES.push(challenge);
                }
                startChallenge(id);
                setShowAddModal(false);
                setNewChallenge({ name: '', duration: 1, frequency: 'daily' });
              }}
              className="flex flex-col gap-4 items-stretch"
            >
              <div className="text-left">
                <label className="block text-sm font-medium text-gray-700 mb-1">Challenge Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter challenge name"
                  value={newChallenge.name}
                  onChange={e => setNewChallenge({ ...newChallenge, name: e.target.value })}
                  required
                />
              </div>
              <div className="text-left">
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Duration (days)"
                  min={1}
                  value={newChallenge.duration}
                  onChange={e => setNewChallenge({ ...newChallenge, duration: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="text-left">
                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newChallenge.frequency}
                  onChange={e => setNewChallenge({ ...newChallenge, frequency: e.target.value })}
                  required
                >
                  <option value="daily">Daily</option>
                  <option value="hourly">Hourly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              <div className="flex gap-2 justify-center mt-2">
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition">Add Challenge</button>
                <button type="button" className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold shadow hover:bg-gray-300 transition" onClick={() => setShowAddModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
