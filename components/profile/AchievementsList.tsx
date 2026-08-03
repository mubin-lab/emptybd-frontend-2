"use client";

import { Trophy, Medal, Award, Star } from "lucide-react";
import { useUserAchievements } from "@/lib/hooks/useOnboarding";

export default function AchievementsList() {
  const { data: achievements, isLoading } = useUserAchievements();

  if (isLoading) {
    return (
      <div className="bg-gray-950/60 border border-gray-900 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider font-parkinsans mb-4">Milestones</h4>
        <div className="flex gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-16 h-16 bg-gray-800 rounded-full animate-pulse border border-gray-700"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!achievements || achievements.length === 0) {
    return (
      <div className="bg-gray-950/60 border border-gray-900 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider font-parkinsans mb-4">Milestones</h4>
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center mb-3">
            <Trophy className="text-gray-600" size={24} />
          </div>
          <p className="text-gray-500 text-sm font-parkinsans max-w-xs">Complete onboarding tasks and platform activities to unlock achievements!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-950/60 border border-gray-900 rounded-2xl p-6 shadow-xl backdrop-blur-md overflow-hidden relative">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
      
      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider font-parkinsans mb-4 flex items-center gap-2">
        <Medal size={16} className="text-amber-500" />
        Milestones & Achievements
      </h4>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
        {achievements.map((achievement: any) => (
          <div key={achievement.achievementId} className="flex flex-col items-center group cursor-default">
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/10 to-orange-500/20 border border-amber-500/30 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(245,158,11,0.1)] group-hover:shadow-[0_0_25px_rgba(245,158,11,0.3)] group-hover:border-amber-400">
              
              {achievement.achievementId.includes('bid') ? (
                <Award className="text-amber-400" size={28} />
              ) : achievement.achievementId.includes('news') ? (
                <Star className="text-orange-400" size={28} />
              ) : (
                <Trophy className="text-yellow-400" size={28} />
              )}
              
            </div>
            <span className="text-[10px] text-center font-semibold text-gray-300 leading-tight group-hover:text-amber-400 transition-colors max-w-[80px]">
              {achievement.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
