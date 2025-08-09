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
  "PieChart": "ChartPie"
};

// Centralized Lucide icon renderer to avoid scattered imports and runtime errors
export const Icon: React.FC<IconProps> = ({ name, size = 16, className, strokeWidth = 1.75, title, ...rest }) => {
  // Try to use alias if available
  const actualIconName = (iconAliases[name as string] || name) as IconName;
  const LucideIcon = icons[actualIconName];
  
  if (!LucideIcon) {
    console.warn(`Icon "${name}" (resolved as "${actualIconName}") not found in lucide-react`);
    return null;
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


