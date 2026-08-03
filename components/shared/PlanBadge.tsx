import React from "react";

interface PlanBadgeProps {
  plan?: string;
  className?: string;
}

export default function PlanBadge({ plan, className = "" }: PlanBadgeProps) {
  if (plan === "premium") {
    return (
      <svg
        width="14"
        height="14"
        viewBox="0 0 13 13"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block ${className}`} 
      >
        <defs>
          <radialGradient id="blue-badge-grad">
            <stop offset="0%" stopColor="#4dabf7" />
            <stop offset="60%" stopColor="#006aff" />
            <stop offset="100%" stopColor="#0050cc" />
          </radialGradient>
        </defs>
        <circle cx="6.5" cy="6.5" r="6.2" fill="url(#blue-badge-grad)" />
        <path
          d="M4 6.6 L5.8 8.4 L9 5.2"
          stroke="white"
          strokeWidth="1.35"
          fill="none"
        />
      </svg>
    );
  }

  if (plan === "owner") {
    return (
      <svg
        width="14"
        height="14"
        viewBox="0 0 13 13"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block ${className}`} 
      >
        <defs>
          <radialGradient id="gold-badge-grad">
            <stop offset="0%" stopColor="#ffdd80" />
            <stop offset="60%" stopColor="#ffb516" />
            <stop offset="100%" stopColor="#e89f00" />
          </radialGradient>
        </defs>
        <circle cx="6.5" cy="6.5" r="6.2" fill="url(#gold-badge-grad)" />
        <path
          d="M4 6.6 L5.8 8.4 L9 5.2"
          stroke="white"
          strokeWidth="1.35"
          fill="none"
        />
      </svg>
    );
  }

  return null;
}
