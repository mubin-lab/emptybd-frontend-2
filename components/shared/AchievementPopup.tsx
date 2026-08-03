"use client";

import { useEffect, useState } from "react";
import { Trophy, X } from "lucide-react";
import { useUserAchievements } from "@/lib/hooks/useOnboarding";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005";

export default function AchievementPopup() {
  const { data: achievements } = useUserAchievements();
  const [currentAchievement, setCurrentAchievement] = useState<any>(null);

  useEffect(() => {
    if (achievements && achievements.length > 0) {
      const newAchievement = achievements.find((a: any) => a.isNew);
      if (newAchievement) {
        setCurrentAchievement(newAchievement);
      }
    }
  }, [achievements]);

  const handleClose = async () => {
    if (!currentAchievement) return;
    
    // Optimistically hide
    const achievementId = currentAchievement.achievementId;
    setCurrentAchievement(null);

    // Mark as seen on backend
    try {
      await axios.patch(
        `${API_URL}/onboarding/achievements/mark-seen`,
        { achievementIds: [achievementId] },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
    } catch (err) {
      console.error("Failed to mark achievement as seen", err);
    }
  };

  if (!currentAchievement) return null;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] max-w-sm w-[calc(100%-2rem)] animate-in slide-in-from-top-10 fade-in duration-500">
      <div className="relative bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/50 rounded-2xl p-5 shadow-[0_0_40px_rgba(245,158,11,0.3)] overflow-hidden backdrop-blur-xl">
        
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 -translate-x-full animate-[shimmer_2s_infinite]" />

        <button 
          onClick={handleClose}
          className="absolute top-2 right-2 text-amber-200/60 hover:text-white p-1 transition-colors z-10"
        >
          <X size={16} />
        </button>

        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30 mb-1 ring-4 ring-amber-500/20 animate-bounce">
            <Trophy className="text-white fill-white/20" size={28} />
          </div>
          
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest font-orbitron">Achievement Unlocked!</span>
          <h4 className="text-white font-bold font-averia-gruesa-libre text-xl">{currentAchievement.title}</h4>
          
          <button 
            onClick={handleClose}
            className="mt-3 w-full py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl border border-white/10 transition-colors font-parkinsans"
          >
            Awesome!
          </button>
        </div>
      </div>
    </div>
  );
}
