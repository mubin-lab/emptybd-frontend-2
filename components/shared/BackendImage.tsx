"use client";

import React, { useState } from "react";

interface BackendImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  wrapperClassName?: string;
  showShine?: boolean;
}

export default function BackendImage({ src, alt, className = "", wrapperClassName = "", showShine = false, ...props }: BackendImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // If there's no src, or if it errored, we can show a broken state or just the placeholder
  const shouldShowPlaceholder = !isLoaded && !hasError;

  return (
    <div className={`relative flex items-center justify-center overflow-hidden bg-gray-900/50 ${className} ${wrapperClassName}`}>
      {shouldShowPlaceholder && (
        <span className="absolute inset-0 flex items-center justify-center text-gray-500 font-bold text-xs sm:text-sm tracking-widest animate-pulse pointer-events-none z-0">
          emptyBD
        </span>
      )}
      
      {src && !hasError ? (
        <>
          <img
            src={src as string}
            alt={alt || "Image"}
            className={`object-cover transition-opacity duration-500 ease-in-out z-10 ${isLoaded ? "opacity-100" : "opacity-0"} ${className}`}
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            onClick={props.onClick}
            id={props.id}
            {...(props as any)}
          />
          {isLoaded && showShine && <div className="glass-shine-layer"></div>}
        </>
      ) : hasError ? (
        <span className="absolute inset-0 flex items-center justify-center text-red-500/50 font-medium text-[10px] pointer-events-none z-0">
          Error
        </span>
      ) : null}
    </div>
  );
}
