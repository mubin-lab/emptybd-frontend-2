"use client";

import { useState } from "react";
import { HelpCircle, X, CheckCircle, AlertTriangle, Lightbulb, Info } from "lucide-react";
import { helpContent } from "@/lib/config/helpContent";

interface PageHelpPanelProps {
  pageKey: string;
}

export default function PageHelpPanel({ pageKey }: PageHelpPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const content = helpContent[pageKey];

  if (!content) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[9999] bg-secondary hover:bg-secondary/90 text-black font-bold rounded-full p-3 shadow-xl shadow-secondary/20 hover:scale-105 transition-all flex items-center justify-center border border-secondary/50 group"
        aria-label="Help"
      >
        <HelpCircle size={24} className="group-hover:animate-bounce" />
        {/* <span className=" ">সাহায্য (Help)</span> */}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end pointer-events-none p-4 sm:p-6">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto transition-opacity animate-in fade-in duration-300"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="relative w-full max-w-md h-full max-h-[85vh] bg-gray-950 border border-gray-800 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col pointer-events-auto animate-in slide-in-from-right-10 fade-in duration-300 overflow-hidden">
            
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-gray-900 to-black border-b border-gray-800 flex items-center justify-between sticky top-0 z-10">
              <h3 className="text-white font-bold flex items-center gap-2 text-lg lg:text-xl">
                <HelpCircle className="text-secondary" />
                {content.title} - সাহায্য
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-white/10 space-y-6">
              
              {/* Description */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <h4 className="text-gray-200 inter text-xs lg:text-sm font-bold flex items-center gap-2 mb-2  ">
                  <Info size={16} className="text-blue-400" /> পরিচিতি
                </h4>
                <p className="text-gray-300 inter text-xs lg:text-sm leading-relaxed  ">
                  {content.description}
                </p>
              </div>

              {/* Tips */}
              {content.tips && content.tips.length > 0 && (
                <div>
                  <h4 className="text-secondary inter text-xs lg:text-sm font-bold flex items-center gap-2 mb-3   uppercase tracking-widest">
                    <Lightbulb size={16} /> টিপস
                  </h4>
                  <ul className="space-y-2">
                    {content.tips.map((tip, idx) => (
                      <li key={idx} className="flex gap-3 inter text-xs lg:text-sm text-gray-300   bg-gray-900/50 p-3 rounded-xl border border-gray-800/50">
                        <span className="text-secondary mt-0.5">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Best Practices */}
              {content.bestPractices && content.bestPractices.length > 0 && (
                <div>
                  <h4 className="text-green-400 inter text-xs lg:text-sm font-bold flex items-center gap-2 mb-3   uppercase tracking-widest">
                    <CheckCircle size={16} /> সেরা অভ্যাস
                  </h4>
                  <ul className="space-y-2">
                    {content.bestPractices.map((bp, idx) => (
                      <li key={idx} className="flex gap-3 inter text-xs lg:text-sm text-gray-300   bg-green-500/5 p-3 rounded-xl border border-green-500/10">
                        <span className="text-green-400 mt-0.5">✓</span>
                        <span>{bp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Common Mistakes */}
              {content.commonMistakes && content.commonMistakes.length > 0 && (
                <div>
                  <h4 className="text-red-400 inter text-xs lg:text-sm font-bold flex items-center gap-2 mb-3   uppercase tracking-widest">
                    <AlertTriangle size={16} /> সর্তকতা / সাধারণ ভুল
                  </h4>
                  <ul className="space-y-2">
                    {content.commonMistakes.map((cm, idx) => (
                      <li key={idx} className="flex gap-3 inter text-xs lg:text-sm text-gray-300   bg-red-500/5 p-3 rounded-xl border border-red-500/10">
                        <span className="text-red-400 mt-0.5">⚠</span>
                        <span>{cm}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Notes */}
              {content.notes && content.notes.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
                  <h4 className="text-amber-400 inter text-xs lg:text-sm font-bold mb-2  ">বিশেষ দ্রষ্টব্য:</h4>
                  <ul className="space-y-1.5">
                    {content.notes.map((note, idx) => (
                      <li key={idx} className="text-gray-300 inter text-xs lg:text-sm   leading-relaxed flex gap-2">
                        <span>-</span> {note}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}
