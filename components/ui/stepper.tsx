"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface StepperStep {
  id: string;
  title: string;
  status: "completed" | "current" | "upcoming";
}

interface StepperProps {
  steps: StepperStep[];
  className?: string;
  showLabels?: boolean;
  variant?: "default" | "compact" | "centered";
}

// Check icon component for completed steps
const CheckIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      className={cn("w-5 h-5", className)}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12.75l6 6 9-13.5"
      />
    </svg>
  );
};

export function Stepper({ 
  steps, 
  className, 
  showLabels = true, 
  variant = "default" 
}: StepperProps) {
  return (
    <div 
      className={cn(
        "w-full",
        variant === "centered" && "flex justify-center",
        className
      )}
      id="parcego-stepper-container"
    >
      <nav 
        aria-label="Progress" 
        className={cn(
          "w-full",
          variant === "centered" && "max-w-4xl"
        )}
        id="parcego-stepper-nav"
      >
        <ol className={cn(
          "flex items-center w-full",
          variant === "compact" ? "gap-0 sm:gap-2" : "gap-1 sm:gap-4",
          variant === "centered" ? "justify-center" : "justify-start"
        )}>
          {steps.map((step, stepIdx) => (
            <li key={step.id} className="flex items-center flex-1 min-w-0">
              {/* Step Circle and Content */}
              <div className={cn(
                "flex items-center w-full min-w-0",
                variant === "compact" ? "gap-0 sm:gap-2" : "gap-1 sm:gap-3"
              )}>
                {/* Step Circle */}
                <div
                  className={cn(
                    "flex-shrink-0 flex h-10 w-10 sm:h-10 sm:w-10 items-center justify-center rounded-full border-2 text-sm sm:text-sm font-semibold transition-colors duration-300 ease-out relative group",
                    "focus:outline-none",
                    {
                      "border-green-600 bg-green-600 text-white": step.status === "completed",
                      "border-blue-600 bg-blue-600 text-white": step.status === "current",
                      "border-gray-300 bg-white text-gray-500": step.status === "upcoming",
                    }
                  )}
                  id={`parcego-stepper-step-${step.id}`}
                  aria-current={step.status === "current" ? "step" : undefined}
                >
                  {step.status === "completed" ? (
                    <>
                      {/* Checkmark icon */}
                      <CheckIcon className="text-white w-4 h-4 sm:w-5 sm:h-5" />
                      {/* Step number overlay for accessibility */}
                      <span className="sr-only">Step {stepIdx + 1} completed</span>
                    </>
                  ) : (
                    <span className="text-sm sm:text-sm font-semibold">
                      {stepIdx + 1}
                    </span>
                  )}
                </div>

                {/* Step Title - Hidden on mobile portrait, visible on larger screens */}
                {showLabels && (
                  <div className="hidden sm:block min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm font-medium transition-colors duration-300 whitespace-nowrap truncate",
                        {
                          "text-green-700": step.status === "completed",
                          "text-blue-700": step.status === "current", 
                          "text-gray-600": step.status === "upcoming",
                        }
                      )}
                      id={`parcego-stepper-title-${step.id}`}
                    >
                      {step.title}
                    </p>
                  </div>
                )}
              </div>

              {/* Connector Line - Longer on mobile to fill space */}
              {stepIdx < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 min-w-[32px] sm:min-w-[32px] mx-2 sm:mx-2 md:mx-4 transition-all duration-300 ease-out",
                    {
                      "bg-green-600": step.status === "completed",
                      "bg-gray-300": step.status === "current" || step.status === "upcoming",
                    }
                  )}
                  aria-hidden="true"
                  id={`parcego-stepper-connector-${step.id}`}
                />
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}

// Utility function to generate stepper data
export function createStepperSteps(currentStep: number): StepperStep[] {
  const stepDefinitions = [
    { id: "shipment-details", title: "Shipment Details" },
    { id: "package-details", title: "Package Details" },
    { id: "quote-preview", title: "Quote Preview" },
    { id: "purchase-label", title: "Purchase Label" },
  ];

  // Ensure currentStep is within valid range
  const validStep = Math.min(Math.max(currentStep, 1), stepDefinitions.length);

  return stepDefinitions.map((step, index) => ({
    ...step,
    status: 
      index < validStep - 1 ? "completed" :
      index === validStep - 1 ? "current" : 
      "upcoming"
  }));
}
