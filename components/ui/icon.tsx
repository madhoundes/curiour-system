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
  "HelpCircle": "CircleQuestionMark",
  "package": "Package",
  "user": "User",
  "settings": "Settings",
  "bar-chart-3": "ChartColumn",
  "search": "Search",
  "mail": "Mail",
  "message-circle": "MessageCircle",
  "arrow-left": "ArrowLeft",
  "arrow-right": "ArrowRight",
  "plus": "Plus",
  "bookmark": "Bookmark",
  "bookmark-plus": "BookmarkPlus",
  "thumbs-up": "ThumbsUp",
  "thumbs-down": "ThumbsDown",
  "play": "Play",
  "file-text": "FileText",
  "video": "Video",
  "x": "X",
  "trash": "Trash2",
  "Trash": "Trash2",
  // Additional icons
  "Bell": "Bell",
  "bell": "Bell",
  "Lightbulb": "Lightbulb",
  "lightbulb": "Lightbulb",
  "ChevronRight": "ChevronRight",
  "chevron-right": "ChevronRight",
  "History": "History",
  "history": "History",
  "Truck": "Truck",
  "truck": "Truck",
  "DollarSign": "DollarSign",
  "dollar-sign": "DollarSign",
  "TrendingUp": "TrendingUp",
  "trending-up": "TrendingUp",
  "Award": "Award",
  "award": "Award",
  "Activity": "Activity",
  "activity": "Activity",
  "Zap": "Zap",
  "zap": "Zap",
  "Star": "Star",
  "star": "Star",
  "Share": "Share",
  "share": "Share",
  "Phone": "Phone",
  "phone": "Phone",
  "Navigation": "Navigation",
  "navigation": "Navigation",
  "Camera": "Camera",
  "camera": "Camera",
  "LogOut": "LogOut",
  "log-out": "LogOut",
  "Timer": "Timer",
  "timer": "Timer",
  "Square": "Square",
  "square": "Square",
  "Hash": "Hash",
  "hash": "Hash",
  "PackageCheck": "PackageCheck",
  "package-check": "PackageCheck",
  "Route": "Route",
  "route": "Route",
  "WifiOff": "WifiOff",
  "wifi-off": "WifiOff",
  "RefreshCw": "RefreshCw",
  "refresh-cw": "RefreshCw",
  "SkipForward": "SkipForward",
  "skip-forward": "SkipForward",
  "ExternalLink": "ExternalLink",
  "external-link": "ExternalLink",
  "GripVertical": "GripVertical",
  "grip-vertical": "GripVertical",
  "GitBranch": "GitBranch",
  "git-branch": "GitBranch",
  "PenTool": "PenTool",
  "pen-tool": "PenTool",
  "RotateCcw": "RotateCcw",
  "rotate-ccw": "RotateCcw",
  "TriangleAlert": "TriangleAlert",
  "triangle-alert": "TriangleAlert",
  "MessageSquare": "MessageSquare",
  "message-square": "MessageSquare",
  "ScanBarcode": "ScanBarcode",
  "scan-barcode": "ScanBarcode",
  "Warehouse": "Building",
  "warehouse": "Building",
  "Building": "Building",
  "building": "Building",
  // Clock aliases
  "Clock": "Clock",
  "clock": "Clock",
  // Navigation icons
  "Home": "House",
  "home": "House",
  "Map": "MapPin",
  "map": "MapPin",
  // Package and shipping icons
  "MapPin": "MapPin",
  "Package": "Package",
  "Shield": "Shield",
  // Chart icons
  "ChartColumn": "ChartColumn",
  "ChartBar": "ChartBar",
  "ChartLine": "ChartLine",
  "ChartPie": "ChartPie",
  // Circle icons
  "CircleCheck": "CircleCheck",
  "CircleAlert": "CircleAlert",
  "CircleX": "CircleX",
  "CircleQuestionMark": "CircleQuestionMark",
  // Other UI icons
  "Pencil": "Pencil",
  "User": "User",
  "Settings": "Settings",
  "Search": "Search",
  "Mail": "Mail",
  "MessageCircle": "MessageCircle",
  "Plus": "Plus",
  "Bookmark": "Bookmark",
  "BookmarkPlus": "BookmarkPlus",
  "ThumbsUp": "ThumbsUp",
  "ThumbsDown": "ThumbsDown",
  "Play": "Play",
  "FileText": "FileText",
  "Video": "Video",
  "X": "X",
  // Loading icons
  "Loader2": "Loader",
  "loader2": "Loader",
  // Calculator and math icons for Quick Quote widget
  "Calculator": "Calculator",
  "calculator": "Calculator",
  "calc": "Calculator",
  // Undeliverable page icons
  "PackageX": "PackageX",
  "Eye": "Eye",
  "eye": "Eye",
  "eye-off": "EyeOff",
  "Check": "Check",
  // Dashboard shipping tips icons
  "Scale": "Scale",
  "Tag": "Tag",
  "tag": "Tag",
  "Box": "Package",
  // Purchase label page icons
  "CreditCard": "CreditCard",
  "Info": "Info",
  "Download": "Download",
  "Printer": "Printer",
  // Header icons
  "Menu": "Menu",
  "menu": "Menu",
  // More menu icons
  "MoreVertical": "EllipsisVertical",
  "more-vertical": "EllipsisVertical",
  "EllipsisVertical": "EllipsisVertical",
  "ellipsis-vertical": "EllipsisVertical",
  "minus": "Minus",
  "Minus": "Minus",
  "check": "Check",
  "Check": "Check",
  // Filter icon aliases
  "Filter": "Funnel",
  "filter": "Funnel",
  // Store and shopping icons
  "Store": "ShoppingBag",
  "store": "ShoppingBag",
  "ShoppingBag": "ShoppingBag",
  "RotateCw": "RotateCw",
  "rotate-cw": "RotateCw"
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


