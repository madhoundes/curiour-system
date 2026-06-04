'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, CheckCircle, XCircle } from 'lucide-react';

// Mock Scanner component for testing
interface ScannerProps {
  onScan?: (result: unknown) => void;
  onError?: (error: unknown) => void;
  constraints?: MediaStreamConstraints;
  formats?: string[];
  components?: unknown;
  styles?: unknown;
  paused?: boolean;
}

const Scanner = ({ onScan, onError, constraints, formats, components, styles, paused }: ScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isActive, setIsActive] = useState(false);

  const startCamera = async () => {
    try {
      if (!window.isSecureContext) {
        throw new Error('Camera access requires HTTPS. Use HTTPS version or localhost.');
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsActive(true);
      }
    } catch (error) {
      console.error('Camera error:', error);
      onError(error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsActive(false);
    }
  };

  return (
    <div className="relative bg-gray-900 rounded-lg h-96 overflow-hidden">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        style={styles?.video}
        autoPlay
        muted
        playsInline
      />
      {!isActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center text-white">
            <Camera size={48} className="mx-auto mb-4" />
            <p className="text-lg mb-2">Camera Test</p>
            <p className="text-sm text-gray-300 mb-4">Click to start camera for HTTPS testing</p>
            <Button onClick={startCamera} className="bg-purple-600 hover:bg-purple-700">
              <Camera size={16} className="mr-2" />
              Start Camera Test
            </Button>
          </div>
        </div>
      )}
      {isActive && (
        <div className="absolute top-4 right-4">
          <Button onClick={stopCamera} variant="destructive" size="sm">
            Stop Camera
          </Button>
        </div>
      )}
    </div>
  );
};

export default function TestCameraPage() {
  const [isSecureContext, setIsSecureContext] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [cameraActive, setCameraActive] = useState(false);

  // Check secure context on mount
  useEffect(() => {
    setIsSecureContext(window.isSecureContext);
  }, []);

  const handleCameraError = (error: unknown) => {
    console.error('Camera error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Camera access failed';
    setCameraError(errorMessage);
  };

  const handleBarcodeDetected = (result: unknown) => {
    console.log('Barcode detected:', result);
    // Mock barcode detection
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-6 w-6" />
              Camera HTTPS Test Page
            </CardTitle>
            <CardDescription>
              Test camera functionality over HTTPS to verify secure context requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Security Context Status */}
            <Alert className={isSecureContext ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <div className="flex items-center gap-2">
                {isSecureContext ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription>
                  <strong>Secure Context:</strong> {isSecureContext ? '✅ Yes' : '❌ No'}
                  <br />
                  <span className="text-sm text-gray-600">
                    {isSecureContext 
                      ? 'Camera access should work properly' 
                      : 'Camera access requires HTTPS or localhost'
                    }
                  </span>
                </AlertDescription>
              </div>
            </Alert>

            {/* Current URL */}
            <div className="p-4 bg-gray-100 rounded-lg">
              <p className="text-sm font-medium">Current URL:</p>
              <p className="text-sm text-gray-600 break-all">{typeof window !== 'undefined' ? window.location.href : 'Loading...'}</p>
            </div>

            {/* Camera Test */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Camera Test</h3>
              <Scanner
                onScan={handleBarcodeDetected}
                onError={handleCameraError}
                constraints={{
                  facingMode: "environment",
                  width: { ideal: 1280 },
                  height: { ideal: 720 }
                }}
                formats={['qr_code', 'code_128', 'code_39', 'ean_13']}
                styles={{
                  container: { width: '100%', height: '100%' },
                  video: { width: '100%', height: '100%', objectFit: 'cover' }
                }}
                paused={!cameraActive}
              />
            </div>

            {/* Error Display */}
            {cameraError && (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription>
                  <strong>Camera Error:</strong> {cameraError}
                </AlertDescription>
              </Alert>
            )}

            {/* Instructions */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Test Instructions:</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Ensure you&apos;re accessing this page via HTTPS</li>
                <li>Accept the self-signed certificate if prompted</li>
                <li>Click &quot;Start Camera Test&quot; to test camera access</li>
                <li>If successful, camera should start without errors</li>
                <li>If it fails, check the error message above</li>
              </ol>
            </div>

            {/* Navigation */}
            <div className="flex gap-4">
              <Button 
                onClick={() => window.location.href = '/login'}
                variant="outline"
              >
                Go to Courier Login
              </Button>
              <Button 
                onClick={() => window.location.href = '/courier'}
                variant="outline"
              >
                Go to Courier Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
