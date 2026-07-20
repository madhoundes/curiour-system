"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { isValidTrackingNumber, formatTrackingNumber } from "@/lib/mock/tracking"

type TrackingInputCardProps = {
  id?: string
  className?: string
  defaultValue?: string
  onSubmit: (trackingNumber: string) => void
}

export const TrackingInputCard: React.FC<TrackingInputCardProps> = ({ id = "parcego-tracking-input-card", className, defaultValue = "", onSubmit }) => {
  const [value, setValue] = React.useState<string>(defaultValue)
  const [error, setError] = React.useState<string>("")
  const inputRef = React.useRef<HTMLInputElement>(null)
  const liveRef = React.useRef<HTMLDivElement>(null)

  const handleSubmit = React.useCallback(() => {
    const v = formatTrackingNumber(value)
    if (!v) {
      setError("Enter a tracking number")
      inputRef.current?.focus()
      return
    }
    if (!isValidTrackingNumber(v)) {
      setError("Invalid format. Use a 6+ character code (e.g. OKGK8R)")
      inputRef.current?.focus()
      return
    }
    setError("")
    liveRef.current?.setAttribute("data-status", `Tracking ${v}`)
    onSubmit(v)
  }, [value, onSubmit])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSubmit()
    }
  }

  const isDisabled = !formatTrackingNumber(value)

  return (
    <Card id={id} className={cn("w-full max-w-xl mx-auto", className)}>
      <CardHeader>
        <CardTitle className="text-xl">Track a shipment</CardTitle>
        <CardDescription>Enter your tracking number to view real-time status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3" aria-labelledby="parcego-tracking-input-label">
          <label id="parcego-tracking-input-label" htmlFor="parcego-tracking-widget-input" className="sr-only">Tracking number</label>
          <div className="flex items-center gap-2">
            <Input
              id="parcego-tracking-widget-input"
              aria-label="Enter your tracking number"
              ref={inputRef}
              value={value}
              onChange={(e) => {
                setValue(e.target.value)
                if (error) setError("") // Clear error when user starts typing
              }}
              onKeyDown={handleKeyDown}
              placeholder="ASH-20250910-ABC123"
              inputMode="text"
              autoFocus
            />
            <Button
              id="parcego-tracking-widget-submit-btn"
              aria-label="Track"
              onClick={handleSubmit}
              disabled={isDisabled}
              data-slot="button"
            >
              Track
            </Button>
          </div>
          {error && (
            <div id="parcego-tracking-widget-error" role="alert" className="text-sm text-red-600">
              {error}
            </div>
          )}
          <div ref={liveRef} role="status" aria-live="polite" className="sr-only" />
        </div>
      </CardContent>
    </Card>
  )
}

export default TrackingInputCard


