"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Stepper, StepperStep } from "@/components/ui/stepper";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  onBack?: () => void;
  backLabel?: string;
  steps?: StepperStep[];
  className?: string;
}

export function PageHeader({ 
  title, 
  onBack, 
  backLabel = "Back", 
  steps, 
  className 
}: PageHeaderProps) {
  return (
    <div className={cn("bg-white shadow-sm border-b border-gray-200", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-8 py-8">
          {/* Top Row: Title */}
          <div className="flex justify-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight text-center">
              {title}
            </h1>
          </div>

          {/* Bottom Row: Back Button and Stepper */}
          <div className="flex items-center justify-between">
            {/* Left side: Back button - Icon only */}
            <div className="flex-shrink-0">
              {onBack && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  id="parcego-page-header-back-btn"
                  className="parcego-nav__back-btn p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 rounded-full"
                  aria-label={backLabel}
                >
                  <span 
                    className="iconify lucide-icon" 
                    data-icon="lucide:arrow-left" 
                    style={{ fontSize: "18px", color: "currentColor" }}
                    aria-hidden="true"
                  />
                </Button>
              )}
            </div>

            {/* Center: Stepper */}
            {steps && steps.length > 0 && (
              <div className="flex-1 flex justify-center">
                <Stepper steps={steps} />
              </div>
            )}

            {/* Right side: Spacer to balance layout when no back button */}
            {!onBack && (
              <div className="flex-shrink-0 w-32">
                {/* Invisible spacer to maintain stepper centering when no back button */}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
