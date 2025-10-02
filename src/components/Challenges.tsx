import React from 'react';
import { Target, Clock, Coins, Award, CheckCircle, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CHALLENGES } from '../utils/mockData';

export const Challenges: React.FC = () => {
  const { user, startChallenge, updateChallengeProgress, addCoins, addXP } = useAuth();

  if (!user) return null;

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

  const getChallengeIcon = (_type: string) => {
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
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Challenges</h1>
        <p className="text-gray-600">Take on challenges to earn rewards and improve your wellness</p>
      </div>

      <div className="grid gap-4">
        {CHALLENGES.map((challenge) => {
          const Icon = getChallengeIcon(challenge.type);
          const activeChallenge = getActiveChallenge(challenge.id);
          const isActive = !!activeChallenge;
          const isCompleted = activeChallenge?.completed || false;
          const progress = activeChallenge?.progress || 0;
          const progressPercent = (progress / challenge.targetValue) * 100;

          return (
            <div
              key={challenge.id}
              className={`bg-white rounded-2xl shadow-lg p-6 transition-all ${
                isCompleted ? 'border-2 border-green-400' : ''
              }`}
            >
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

                  {isActive && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-semibold text-gray-800">
                          {formatProgress(progress, challenge.targetValue)}
                        </span>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getChallengeColor(challenge.type)} transition-all duration-500`}
                          style={{ width: `${Math.min(progressPercent, 100)}%` }}
                        />
                      </div>

                      <p className="text-right text-xs text-gray-500 mt-1">{Math.round(progressPercent)}%</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    {!isActive ? (
                      <button
                        onClick={() => handleStartChallenge(challenge.id)}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
                      >
                        Start Challenge
                      </button>
                    ) : !isCompleted ? (
                      <button
                        onClick={() => handleSimulateProgress(challenge.id)}
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        <TrendingUp className="w-5 h-5" />
                        Simulate Progress
                      </button>
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

              {challenge.type === 'insurance' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Award className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">Insurance Benefit</h4>
                        <p className="text-sm text-gray-600">
                          Complete this challenge to earn <span className="font-bold text-orange-600">2% off</span> your next insurance renewal
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
