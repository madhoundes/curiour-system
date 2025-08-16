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
}

export function Stepper({ steps, className }: StepperProps) {
  return (
    <nav 
      aria-label="Progress" 
      className={cn("flex items-center justify-center", className)}
      id="parcego-stepper-nav"
    >
      <ol className="flex items-center space-x-2 sm:space-x-4">
        {steps.map((step, stepIdx) => (
          <li key={step.id} className="flex items-center">
            {/* Step Circle and Content */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Step Circle */}
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-all duration-200 relative",
                  {
                    "border-green-600 bg-green-600 text-white": step.status === "completed",
                    "border-blue-600 bg-blue-600 text-white": step.status === "current",
                    "border-gray-400 bg-white text-gray-600": step.status === "upcoming",
                  }
                )}
                id={`parcego-stepper-step-${step.id}`}
                aria-current={step.status === "current" ? "step" : undefined}
              >
                {step.status === "completed" ? (
                  <>
                    {/* Keep step number visible but smaller */}
                    <span className="text-xs font-medium opacity-60">
                      {stepIdx + 1}
                    </span>
                    {/* Overlay checkmark */}
                    <span 
                      className="iconify lucide-icon absolute inset-0 flex items-center justify-center" 
                      data-icon="lucide:check" 
                      style={{ fontSize: "14px", color: "currentColor" }}
                      aria-hidden="true"
                    />
                  </>
                ) : (
                  <span className="text-xs font-semibold">
                    {stepIdx + 1}
                  </span>
                )}
              </div>

              {/* Step Title */}
              <div className="min-w-0">
                <p
                  className={cn(
                    "text-sm font-medium transition-colors duration-200",
                    {
                      "text-green-700": step.status === "completed",
                      "text-blue-700": step.status === "current", 
                      "text-gray-700": step.status === "upcoming",
                    }
                  )}
                >
                  {step.title}
                </p>
              </div>
            </div>

            {/* Connector Line */}
            {stepIdx < steps.length - 1 && (
              <div
                className={cn(
                  "ml-2 sm:ml-4 h-0.5 w-8 sm:w-12 transition-colors duration-200",
                  {
                    "bg-green-600": step.status === "completed",
                    "bg-gray-400": step.status === "current" || step.status === "upcoming",
                  }
                )}
                aria-hidden="true"
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
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

  return stepDefinitions.map((step, index) => ({
    ...step,
    status: 
      index < currentStep - 1 ? "completed" :
      index === currentStep - 1 ? "current" : 
      "upcoming"
  }));
}
