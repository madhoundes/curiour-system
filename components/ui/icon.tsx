import * as React from "react";
import { icons } from "lucide-react";

export type IconName = keyof typeof icons;

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName | string; // Allow string to support aliases
  size?: number;
  className?: string;
  strokeWidth?: number;
  title?: string;
}

// Common icon name mappings for convenience
const iconAliases: Record<string, IconName> = {
  // Common aliases for backward compatibility
  "CheckCircle": "CircleCheck",
  "AlertCircle": "CircleAlert", 
  "XCircle": "CircleX",
  "BarChart3": "ChartColumn",
  "BarChart": "ChartBar",
  "LineChart": "ChartLine",
  "PieChart": "ChartPie",
  // Billing page icons
  "AlertTriangle": "TriangleAlert",
  "Edit": "Pencil",
  // Support page icons
  "help-circle": "CircleQuestionMark",
  "package": "Package",
  "user": "User",
  "settings": "Settings",
  "bar-chart-3": "ChartColumn",
  "search": "Search",
  "mail": "Mail",
  "message-circle": "MessageCircle",
  "arrow-left": "ArrowLeft",
  "arrow-right": "ArrowRight", // Add missing ArrowRight alias
  "plus": "Plus",
  "bookmark": "Bookmark",
  "bookmark-plus": "BookmarkPlus",
  "thumbs-up": "ThumbsUp",
  "thumbs-down": "ThumbsDown",
  "play": "Play",
  "file-text": "FileText",
  "video": "Video",
  "x": "X",
  // Add missing Clock alias
  "Clock": "Clock",
  "clock": "Clock",
  // Add other missing icons
  "ArrowRight": "ArrowRight",
  "MapPin": "MapPin",
  "Package": "Package",
  "Shield": "Shield",
  "BarChart3": "ChartColumn",
  "ChartColumn": "ChartColumn",
  "ChartBar": "ChartBar",
  "ChartLine": "ChartLine",
  "ChartPie": "ChartPie",
  "CircleCheck": "CircleCheck",
  "CircleAlert": "CircleAlert",
  "CircleX": "CircleX",
  "TriangleAlert": "TriangleAlert",
  "Pencil": "Pencil",
  "CircleQuestionMark": "CircleQuestionMark",
  "User": "User",
  "Settings": "Settings",
  "Search": "Search",
  "Mail": "Mail",
  "MessageCircle": "MessageCircle",
  "ArrowLeft": "ArrowLeft",
  "Plus": "Plus",
  "Bookmark": "Bookmark",
  "BookmarkPlus": "BookmarkPlus",
  "ThumbsUp": "ThumbsUp",
  "ThumbsDown": "ThumbsDown",
  "Play": "Play",
  "FileText": "FileText",
  "Video": "Video",
  "X": "X"
};

// Centralized Lucide icon renderer to avoid scattered imports and runtime errors
export const Icon: React.FC<IconProps> = ({ name, size = 16, className, strokeWidth = 1.75, title, ...rest }) => {
  // Try to use alias if available
  const actualIconName = (iconAliases[name as string] || name) as IconName;
  const LucideIcon = icons[actualIconName];
  
  if (!LucideIcon) {
    // Instead of console.warn, return a fallback icon to prevent white screen
    console.error(`Icon "${name}" (resolved as "${actualIconName}") not found in lucide-react`);
    
    // Return a fallback icon (question mark) to prevent rendering issues
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`${className || ''} text-gray-400`}
        aria-hidden={title ? undefined : true}
        focusable={false}
        {...rest}
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <path d="M12 17h.01" />
      </svg>
    );
  }
  
  return (
    <LucideIcon
      aria-hidden={title ? undefined : true}
      focusable={false}
      size={size}
      className={className}
      strokeWidth={strokeWidth}
      {...rest}
    />
  );
};

export default Icon;


