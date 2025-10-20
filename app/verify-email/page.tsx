"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/lib/api/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PageHeader } from "@/components/ui/page-header";
import { Icon } from "@/components/ui/icon";

function VerifyEmailPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error' | 'expired'>('pending');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  // Validate token format
  const isValidTokenFormat = (token: string): boolean => {
    // Check if token matches expected format (alphanumeric with hyphens and underscores)
    return /^[A-Za-z0-9_-]+$/.test(token) && token.length >= 20;
  };

  useEffect(() => {
    if (token) {
      console.log('Verify email page loaded with token:', token);
      console.log('Token length:', token.length);
      console.log('Token format check:', isValidTokenFormat(token));
      
      if (!isValidTokenFormat(token)) {
        console.error('Invalid token format');
        setVerificationStatus('error');
        setErrorMessage('Invalid verification token format. Please check your email link.');
        return;
      }
      
      handleEmailVerification();
    } else {
      console.log('No token provided in URL');
      setVerificationStatus('error');
      setErrorMessage('Invalid verification link. No token provided.');
    }
  }, [token]);

  const handleEmailVerification = async () => {
    if (!token) return;

    console.log('Starting email verification with token:', token.substring(0, 10) + '...');
    setIsVerifying(true);
    setVerificationStatus('pending');

    try {
      console.log('Calling authService.verifyEmail with token');
      const response = await authService.verifyEmail({ token });
      
      console.log('Email verification successful:', response.data);
      setVerificationStatus('success');
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        router.push('/login?verified=true');
      }, 3000);
      
    } catch (error: any) {
      console.error('Email verification failed:', error);
      console.error('Error details:', {
        status: error.status,
        message: error.message,
        response: error.response?.data
      });
      
      if (error.status === 400) {
        if (error.message?.includes('expired') || error.message?.includes('invalid')) {
          setVerificationStatus('expired');
          setErrorMessage('This verification link has expired or is invalid. Please request a new one.');
        } else {
          setVerificationStatus('error');
          setErrorMessage(error.message || 'Verification failed. Please try again.');
        }
      } else if (error.status === 422) {
        setVerificationStatus('error');
        setErrorMessage('Invalid verification token format.');
      } else if (error.status === 404) {
        setVerificationStatus('error');
        setErrorMessage('Verification token not found. It may have already been used.');
      } else {
        setVerificationStatus('error');
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setResendStatus('error');
      return;
    }

    setIsResending(true);
    setResendStatus('idle');

    try {
      await authService.resendVerification({ email });
      setResendStatus('success');
    } catch (error: any) {
      console.error('Resend verification failed:', error);
      setResendStatus('error');
    } finally {
      setIsResending(false);
    }
  };

  const handleGoToLogin = () => {
    router.push('/login');
  };

  const handleGoToSignup = () => {
    router.push('/login?tab=signup');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <PageHeader
          title="Email Verification"
          description="Verify your email address to complete your account setup"
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {verificationStatus === 'pending' && isVerifying && (
                <>
                  <Icon name="loader-2" className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                  Verifying your email...
                </>
              )}
              {verificationStatus === 'success' && (
                <>
                  <Icon name="check-circle" className="h-8 w-8 mx-auto mb-4 text-green-600" />
                  Email Verified Successfully!
                </>
              )}
              {verificationStatus === 'error' && (
                <>
                  <Icon name="x-circle" className="h-8 w-8 mx-auto mb-4 text-red-600" />
                  Verification Failed
                </>
              )}
              {verificationStatus === 'expired' && (
                <>
                  <Icon name="clock" className="h-8 w-8 mx-auto mb-4 text-orange-600" />
                  Link Expired
                </>
              )}
            </CardTitle>
            <CardDescription className="text-center">
              {verificationStatus === 'pending' && isVerifying && 
                "Please wait while we verify your email address..."
              }
              {verificationStatus === 'success' && 
                "Your email has been successfully verified. You will be redirected to the login page shortly."
              }
              {verificationStatus === 'error' && 
                "There was an issue verifying your email address."
              }
              {verificationStatus === 'expired' && 
                "This verification link has expired or is no longer valid."
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Success State */}
            {verificationStatus === 'success' && (
              <Alert className="border-green-200 bg-green-50">
                <Icon name="check-circle" className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Your account is now verified! You can log in to access your dashboard.
                </AlertDescription>
              </Alert>
            )}

            {/* Error State */}
            {verificationStatus === 'error' && (
              <Alert className="border-red-200 bg-red-50">
                <Icon name="x-circle" className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}

            {/* Expired State */}
            {verificationStatus === 'expired' && (
              <Alert className="border-orange-200 bg-orange-50">
                <Icon name="clock" className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {verificationStatus === 'success' && (
                <Button 
                  onClick={handleGoToLogin}
                  className="w-full"
                  id="parcego-verify-email-login-btn"
                >
                  Go to Login
                </Button>
              )}

              {(verificationStatus === 'error' || verificationStatus === 'expired') && (
                <>
                  {email && (
                    <Button 
                      onClick={handleResendVerification}
                      disabled={isResending}
                      variant="outline"
                      className="w-full"
                      id="parcego-verify-email-resend-btn"
                    >
                      {isResending ? (
                        <>
                          <Icon name="loader-2" className="h-4 w-4 animate-spin mr-2" />
                          Sending...
                        </>
                      ) : (
                        'Resend Verification Email'
                      )}
                    </Button>
                  )}

                  {resendStatus === 'success' && (
                    <Alert className="border-green-200 bg-green-50">
                      <Icon name="check-circle" className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        A new verification email has been sent to {email}
                      </AlertDescription>
                    </Alert>
                  )}

                  {resendStatus === 'error' && (
                    <Alert className="border-red-200 bg-red-50">
                      <Icon name="x-circle" className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        Failed to resend verification email. Please try again.
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    onClick={handleGoToLogin}
                    className="w-full"
                    id="parcego-verify-email-back-login-btn"
                  >
                    Back to Login
                  </Button>

                  <Button 
                    onClick={handleGoToSignup}
                    variant="outline"
                    className="w-full"
                    id="parcego-verify-email-signup-btn"
                  >
                    Create New Account
                  </Button>
                </>
              )}
            </div>

            {/* Help Text */}
            <div className="text-center text-sm text-gray-600">
              <p>
                Need help? Contact our{' '}
                <a 
                  href="/support" 
                  className="text-blue-600 hover:text-blue-800 underline"
                  id="parcego-verify-email-support-link"
                >
                  support team
                </a>
                {' '}for assistance.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Loading component for Suspense fallback
const VerifyEmailLoadingFallback = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading verification...</p>
    </div>
  </div>
);

// Main page component with Suspense boundary
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailLoadingFallback />}>
      <VerifyEmailPageContent />
    </Suspense>
  );
}
