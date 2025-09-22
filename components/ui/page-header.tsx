import { Icon } from "@/components/ui/icon"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  description?: string
  icon?: string
  iconSize?: number
  className?: string
  children?: React.ReactNode
  onBack?: () => void
  backLabel?: string
}

export function PageHeader({ 
  title, 
  description, 
  icon, 
  iconSize = 24,
  className,
  children,
  onBack,
  backLabel
}: PageHeaderProps) {
  return (
    <div className={cn("mb-8", className)}>
      <div className="flex items-start gap-3">
        {icon && (
          <div className="flex-shrink-0 flex items-center">
            <Icon 
              name={icon} 
              size={iconSize} 
              className="text-gray-600" 
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2 transition-colors bg-transparent"
            >
              <Icon name="ArrowLeft" size={16} className="mr-1" />
              {backLabel || "Back"}
            </button>
          )}
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-base text-gray-600 max-w-3xl">
              {description}
            </p>
          )}
        </div>
        {children && (
          <div className="flex-shrink-0">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}
