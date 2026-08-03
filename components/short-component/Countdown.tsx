"use client";

import { useEffect, useState } from "react";

function getCountdown(endTime: string) {
  const end = new Date(endTime).getTime();
  const now = new Date().getTime();
  let diff = end - now;

  if (diff <= 0) return null; // ⛔ ended

  const totalSeconds = Math.floor(diff / 1000);

  const days = Math.floor(totalSeconds / (24 * 60 * 60));
  let remaining = totalSeconds - days * 24 * 60 * 60;

  const hours = Math.floor(remaining / 3600);
  remaining -= hours * 3600;

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining - minutes * 60;

  const parts: string[] = [];

  if (days > 0) parts.push(`${days}d`);
  if (days > 0 || hours > 0)
    parts.push(`${hours.toString().padStart(2, "0")}h`);
  if (days > 0 || hours > 0 || minutes > 0)
    parts.push(`${minutes.toString().padStart(2, "0")}m`);
  parts.push(`${seconds.toString().padStart(2, "0")}s`);

  return parts.join(":");
}

export default function Countdown({
  className,
  endTime,
  onEnd,
}: {
  className?: string;
  endTime: string;
  onEnd?: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState<string | null>(
    getCountdown(endTime),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const next = getCountdown(endTime);

      if (!next) {
        setTimeLeft(null);
        clearInterval(interval);
        onEnd?.(); // 🔥 notify parent
      } else {
        setTimeLeft(next);
      }
    }, 10);

    return () => clearInterval(interval);
  }, [endTime, onEnd]);

  if (!timeLeft) {
    return (
      <span className="text-red-500 text-xs lg:text-lg font-medium">
        {" "}
        Time Over
      </span>
    );
  }

  return (
    <span className={`text-xs lg:text-lg font-medium ${className}`}>
      {timeLeft}
    </span>
  );
}
