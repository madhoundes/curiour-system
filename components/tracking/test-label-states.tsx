"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Icon from "@/components/ui/icon"
import { isValidTrackingNumber, formatTrackingNumber } from "@/lib/mock/tracking"

const testTrackingNumbers = {
  valid: [
    "ASH-20250910-ABC123",
    "ASH-20241215-XYZ789",
    "ASH-20250101-DEF456"
  ],
  invalid: [
    "ASH-2024-ABC123",
    "INVALID-NUMBER",
    "ASH-20250910-AB",
    ""
  ]
}

const TestLabelStates: React.FC = () => {
  const [testInput, setTestInput] = React.useState<string>("")
  
  const handleTestInput = (value: string) => {
    setTestInput(value)
  }

  const getValidationState = (value: string) => {
    if (!value.trim()) return "empty"
    const formatted = formatTrackingNumber(value)
    return isValidTrackingNumber(formatted) ? "valid" : "invalid"
  }

  const currentState = getValidationState(testInput)

  return (
    <div id="parcego-test-label-states" className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Validation Testing</h2>
        <p className="text-gray-600">Test different tracking number formats to see validation states</p>
      </div>

      {/* Interactive Test Input */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Eye" className="w-5 h-5 text-blue-600" />
            Test Input Validation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Input
              id="parcego-test-validation-input"
              value={testInput}
              onChange={(e) => handleTestInput(e.target.value)}
              placeholder="Enter tracking number to test..."
              className="flex-1"
            />
            <Badge 
              variant={currentState === "valid" ? "default" : currentState === "invalid" ? "destructive" : "secondary"}
              className="px-3 py-1.5 text-xs font-medium"
            >
              {currentState === "valid" && (
                <>
                  <Icon name="Check" className="w-3 h-3 mr-1" />
                  Valid
                </>
              )}
              {currentState === "invalid" && (
                <>
                  <Icon name="X" className="w-3 h-3 mr-1" />
                  Invalid
                </>
              )}
              {currentState === "empty" && (
                <>
                  <Icon name="Minus" className="w-3 h-3 mr-1" />
                  Empty
                </>
              )}
            </Badge>
          </div>
          
          {testInput.trim() && currentState === "invalid" && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              <Icon name="TriangleAlert" className="w-4 h-4 inline mr-2" />
              Expected format: ASH-YYYYMMDD-XXXXXX (e.g., ASH-20250910-ABC123)
            </div>
          )}
        </CardContent>
      </Card>

      {/* Side-by-side Examples */}
      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Valid Examples */}
        <Card id="parcego-test-valid-examples" className="border-green-200 bg-green-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Icon name="Check" className="w-4 h-4 text-green-600" />
              </div>
              Valid Examples
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {testTrackingNumbers.valid.map((number, index) => (
              <div 
                key={`valid-${index}`}
                className="flex items-center justify-between bg-white border border-green-200 rounded-lg p-3 hover:shadow-sm transition-shadow"
              >
                <code className="text-sm font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded">
                  {number}
                </code>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-green-100 text-green-800 border-green-200 text-xs">
                    <Icon name="Check" className="w-3 h-3 mr-1" />
                    Valid
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTestInput(number)}
                    className="h-7 px-2 text-xs text-green-700 hover:text-green-800 hover:bg-green-100"
                  >
                    Test
                  </Button>
                </div>
              </div>
            ))}
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="text-sm font-semibold text-green-800 mb-2">Format Rules:</h4>
              <ul className="text-xs text-green-700 space-y-1">
                <li>• Starts with &quot;ASH-&quot;</li>
                <li>• 8-digit date (YYYYMMDD)</li>
                <li>• Hyphen separator</li>
                <li>• 6-character alphanumeric code</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Invalid Examples */}
        <Card id="parcego-test-invalid-examples" className="border-red-200 bg-red-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <Icon name="X" className="w-4 h-4 text-red-600" />
              </div>
              Invalid Examples
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {testTrackingNumbers.invalid.map((number, index) => (
              <div 
                key={`invalid-${index}`}
                className="flex items-center justify-between bg-white border border-red-200 rounded-lg p-3 hover:shadow-sm transition-shadow"
              >
                <code className="text-sm font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded">
                  {number || "(empty)"}
                </code>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="text-xs">
                    <Icon name="X" className="w-3 h-3 mr-1" />
                    Invalid
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTestInput(number)}
                    className="h-7 px-2 text-xs text-red-700 hover:text-red-800 hover:bg-red-100"
                  >
                    Test
                  </Button>
                </div>
              </div>
            ))}
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="text-sm font-semibold text-red-800 mb-2">Common Issues:</h4>
              <ul className="text-xs text-red-700 space-y-1">
                <li>• Wrong date format (not 8 digits)</li>
                <li>• Missing prefix or hyphens</li>
                <li>• Code too short/long</li>
                <li>• Empty input</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export { TestLabelStates }
export default TestLabelStates
