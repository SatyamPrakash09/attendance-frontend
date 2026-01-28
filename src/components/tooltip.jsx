"use client";

import { useState, useEffect } from "react";

export const Tooltip = ({ children, text, position = "top", className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    return () => {
      setIsVisible(false);
    };
  }, []);

  const positions = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-4",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-4",
    left: "right-full top-1/2 -translate-y-1/2 mr-4",
    right: "left-full top-1/2 -translate-y-1/2 ml-4"
  };

  const arrowPositions = {
    top: "absolute top-full left-1/2 -translate-x-1/2 -mt-px border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-zinc-800",
    bottom: "absolute bottom-full left-1/2 -translate-x-1/2 -mb-px border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-zinc-800",
    left: "absolute left-full top-1/2 -translate-y-1/2 -ml-px border-t-[6px] border-b-[6px] border-l-[6px] border-t-transparent border-b-transparent border-l-zinc-800",
    right: "absolute right-full top-1/2 -translate-y-1/2 -mr-px border-t-[6px] border-b-[6px] border-r-[6px] border-t-transparent border-b-transparent border-r-zinc-800"
  };

  return (
    <div 
      className={`relative whitespace-nowrap inline-flex ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      
      <div
        className={`absolute ${positions[position]} px-3 py-1.5 bg-zinc-800 text-white text-xs font-medium rounded-lg whitespace-nowrap pointer-events-none transition-all duration-100 ease-out z-50 ${
          isVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-1'
        }`}
        style={{
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
        }}
      >
        {text}
        <div className={arrowPositions[position]} />
      </div>
    </div>
  );
};

export default Tooltip;