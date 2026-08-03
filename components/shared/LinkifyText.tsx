import React from "react";

interface LinkifyTextProps {
  text: string;
  className?: string;
}

export default function LinkifyText({ text, className = "" }: LinkifyTextProps) {
  if (!text) return null;

  // Regular expression to match URLs (http:// or https://)
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  // Split the text into parts (text and URLs)
  const parts = text.split(urlRegex);

  return (
    <p className={className}>
      {parts.map((part, index) => {
        // If the part matches the URL regex, render an <a> tag
        if (part.match(urlRegex)) {
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline underline-offset-2 break-all"
              onClick={(e) => e.stopPropagation()} // Prevent triggering parent clicks if any
            >
              {part}
            </a>
          );
        }
        // Otherwise, render normal text
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </p>
  );
}
