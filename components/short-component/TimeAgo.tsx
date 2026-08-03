"use client";

import { useEffect, useState } from "react";

type TimeAgoProps = {
  date: string | Date;
  className?: string;
};

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // seconds

  if (diff < 60) return `${diff}s`;

  const minutes = Math.floor(diff / 60);
  if (minutes < 60) return `${minutes}min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;

  const years = Math.floor(months / 12);
  return `${years}yr`;
}

export default function TimeAgo({ date, className }: TimeAgoProps) {
  const [timeAgo, setTimeAgo] = useState("");

  useEffect(() => {
    const parsedDate = typeof date === "string" ? new Date(date) : date;

    const update = () => {
      setTimeAgo(getTimeAgo(parsedDate));
    };

    update(); // initial
    const interval = setInterval(update, 1000); // auto update প্রতি সেকেন্ডে

    return () => clearInterval(interval);
  }, [date]);

  return (
    <span className={` ${className ?? ""}`}>
      {timeAgo}
    </span>
  );
}
