/**
 * Simple Tooltip Component
 * Displays explanatory text on hover for disabled actions
 */

import { useState } from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({ content, children, position = "top" }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Don't render tooltip if no content
  if (!content) {
    return <>{children}</>;
  }

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      <div
        role="tooltip"
        className={`
          absolute z-50 px-2.5 py-1.5 text-xs
          bg-surface-dark border border-surface-highlight
          text-text-muted rounded-lg shadow-xl
          whitespace-nowrap pointer-events-none
          transition-opacity duration-150
          ${positionClasses[position]}
          ${isVisible ? "opacity-100" : "opacity-0"}
        `}
      >
        {content}
      </div>
    </div>
  );
}
