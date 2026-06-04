"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { useRouter } from "next/navigation";

export default function LandingTermsPage() {
  const router = useRouter();

  return (
    <div id="parcego-landing-terms-container" className="py-8 px-4 sm:px-6 lg:px-8">
      {/* Skip to main content link for keyboard navigation */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md"
        id="parcego-landing-terms-skip-link"
      >
        Skip to main content
      </a>

      {/* Main Content */}
      <main id="main-content" className="max-w-4xl mx-auto" role="main" aria-label="Terms and Conditions">
        {/* Page Header */}
        <PageHeader
          title="Terms & Conditions"
          description="Please read these terms carefully before using our courier platform services."
          icon="FileText"
          iconSize={32}
        />
        {/* Last Updated Badge */}
        <div className="mb-6">
          <Badge variant="outline" className="text-sm">
            <Icon name="Calendar" className="h-4 w-4 mr-2" />
            Last Updated: January 15, 2025
          </Badge>
        </div>

        {/* Table of Contents */}
        <nav aria-label="Table of Contents" className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Icon name="List" className="h-5 w-5 text-blue-600" />
                Table of Contents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 list-decimal list-inside text-sm text-gray-700">
                <li><a href="#parcego-landing-terms-acceptance" className="hover:text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded">Acceptance of Terms</a></li>
                <li><a href="#parcego-landing-terms-service-description" className="hover:text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded">Service Description</a></li>
                <li><a href="#parcego-landing-terms-user-accounts" className="hover:text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded">User Accounts and Registration</a></li>
                <li><a href="#parcego-landing-terms-acceptable-use" className="hover:text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded">Acceptable Use Policy</a></li>
                <li><a href="#parcego-landing-terms-payment" className="hover:text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded">Payment Terms and Billing</a></li>
                <li><a href="#parcego-landing-terms-liability" className="hover:text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded">Limitation of Liability and Disclaimers</a></li>
                <li><a href="#parcego-landing-terms-insurance" className="hover:text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded">Insurance and Claims</a></li>
                <li><a href="#parcego-landing-terms-ip" className="hover:text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded">Intellectual Property Rights</a></li>
                <li><a href="#parcego-landing-terms-termination" className="hover:text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded">Termination</a></li>
                <li><a href="#parcego-landing-terms-law" className="hover:text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded">Governing Law and Dispute Resolution</a></li>
                <li><a href="#parcego-landing-terms-changes" className="hover:text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded">Changes to Terms</a></li>
                <li><a href="#parcego-landing-terms-contact" className="hover:text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded">Contact Information</a></li>
              </ol>
            </CardContent>
          </Card>
        </nav>

        {/* Terms & Conditions Content */}
        <Card id="parcego-landing-terms-main-content" className="mb-8" role="article" aria-labelledby="terms-overview-title">
          <CardHeader>
            <CardTitle id="terms-overview-title" className="flex items-center gap-2">
              <Icon name="Scale" className="h-6 w-6 text-blue-600" aria-hidden="true" />
              Terms of Service Overview
            </CardTitle>
            <CardDescription>
              These Terms and Conditions ("Terms") govern your use of the Parcego courier business platform and services.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            
            {/* Acceptance of Terms */}
            <section id="parcego-landing-terms-acceptance" aria-labelledby="section-acceptance">
              <h2 id="section-acceptance" className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Icon name="CheckCircle" className="h-5 w-5 text-blue-600" aria-hidden="true" />
                1. Acceptance of Terms
              </h2>
              <div className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  By accessing or using the Parcego platform, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, you may not use our services.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  These terms apply to all users of the platform, including merchants, couriers, and any other individuals or entities that access or use our services.
                </p>
              </div>
            </section>

            <Separator />

            {/* Service Description */}
            <section id="parcego-landing-terms-service-description" aria-labelledby="section-service">
              <h2 id="section-service" className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Icon name="Package" className="h-5 w-5 text-blue-600" aria-hidden="true" />
                2. Service Description
              </h2>
              <div className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  Parcego provides a courier business platform that connects merchants with courier services for package delivery. Our services include:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                  <li>Shipment creation and management tools</li>
                  <li>Real-time tracking and delivery updates</li>
                  <li>Payment processing and billing management</li>
                  <li>Courier network coordination and optimization</li>
                  <li>Customer support and service assistance</li>
                  <li>Analytics and reporting features</li>
                </ul>
                <p className="text-gray-600 leading-relaxed">
                  We reserve the right to modify, suspend, or discontinue any aspect of our services at any time with reasonable notice.
                </p>
              </div>
            </section>

            <Separator />

            {/* User Accounts */}
            <section id="parcego-landing-terms-user-accounts" aria-labelledby="section-accounts">
              <h2 id="section-accounts" className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Icon name="User" className="h-5 w-5 text-blue-600" aria-hidden="true" />
                3. User Accounts and Registration
              </h2>
              <div className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  To use our services, you must create an account and provide accurate, complete, and current information. You are responsible for:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                  <li>Maintaining the confidentiality of your account credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Notifying us immediately of any unauthorized use</li>
                  <li>Ensuring your account information remains accurate and up-to-date</li>
                </ul>
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-yellow-800 text-sm">
                    <strong>Important:</strong> You must be at least 18 years old to create an account and use our services. Business accounts must be created by authorized representatives of the business entity.
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            {/* Acceptable Use */}
            <section id="parcego-landing-terms-acceptable-use" aria-labelledby="section-use">
              <h2 id="section-use" className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Icon name="Shield" className="h-5 w-5 text-blue-600" aria-hidden="true" />
                4. Acceptable Use Policy
              </h2>
              <div className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  You agree to use our services only for lawful purposes and in accordance with these Terms. You may not:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-800">Prohibited Activities:</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm ml-4">
                      <li>Ship illegal or prohibited items</li>
                      <li>Provide false or misleading information</li>
                      <li>Attempt to circumvent security measures</li>
                      <li>Interfere with platform operations</li>
                      <li>Use automated systems to access services</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-800">Restricted Content:</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm ml-4">
                      <li>Hazardous materials</li>
                      <li>Perishable goods without proper handling</li>
                      <li>Items requiring special permits</li>
                      <li>Counterfeit or stolen goods</li>
                      <li>Items violating intellectual property rights</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            {/* Payment Terms */}
            <section id="parcego-landing-terms-payment" aria-labelledby="section-payment">
              <h2 id="section-payment" className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Icon name="CreditCard" className="h-5 w-5 text-blue-600" aria-hidden="true" />
                5. Payment Terms and Billing
              </h2>
              <div className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  Payment for services is processed through secure third-party payment processors. By using our services, you agree to:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                  <li>Pay all applicable fees and charges in advance</li>
                  <li>Provide accurate billing information</li>
                  <li>Authorize automatic payment processing</li>
                  <li>Accept responsibility for all charges incurred</li>
                </ul>
                
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-medium text-blue-900 mb-2">Refund Policy</h3>
                  <p className="text-blue-800 text-sm">
                    Refunds are provided in accordance with our refund policy, typically within 5-10 business days for eligible requests. 
                    Service fees may be non-refundable in certain circumstances.
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            {/* Liability and Disclaimers */}
            <section id="parcego-landing-terms-liability" aria-labelledby="section-liability">
              <h2 id="section-liability" className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Icon name="AlertTriangle" className="h-5 w-5 text-blue-600" aria-hidden="true" />
                6. Limitation of Liability and Disclaimers
              </h2>
              <div className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  Our services are provided "as is" and "as available" without warranties of any kind. We disclaim all warranties, express or implied, including but not limited to:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                  <li>Warranties of merchantability and fitness for a particular purpose</li>
                  <li>Warranties regarding accuracy, reliability, or completeness</li>
                  <li>Warranties that services will be uninterrupted or error-free</li>
                </ul>
                
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h3 className="font-medium text-red-900 mb-2">Limitation of Liability</h3>
                  <p className="text-red-800 text-sm">
                    In no event shall Parcego be liable for any indirect, incidental, special, consequential, or punitive damages, 
                    including but not limited to loss of profits, data, or business opportunities, arising from your use of our services.
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            {/* Insurance and Claims */}
            <section id="parcego-landing-terms-insurance" aria-labelledby="section-insurance">
              <h2 id="section-insurance" className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Icon name="ShieldCheck" className="h-5 w-5 text-blue-600" aria-hidden="true" />
                7. Insurance and Claims
              </h2>
              <div className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  We provide basic insurance coverage for shipments, subject to the following terms:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                  <li>Coverage limits and exclusions apply as specified in our insurance policy</li>
                  <li>Claims must be filed within 30 days of delivery or attempted delivery</li>
                  <li>Documentation and proof of loss may be required</li>
                  <li>Additional insurance may be available for high-value items</li>
                </ul>
                
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="font-medium text-green-900 mb-2">Claims Process</h3>
                  <p className="text-green-800 text-sm">
                    To file a claim, contact our support team with your tracking number, photos of damage (if applicable), 
                    and any relevant documentation. We will investigate and respond within 5-10 business days.
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            {/* Intellectual Property */}
            <section id="parcego-landing-terms-ip" aria-labelledby="section-ip">
              <h2 id="section-ip" className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Icon name="Copyright" className="h-5 w-5 text-blue-600" aria-hidden="true" />
                8. Intellectual Property Rights
              </h2>
              <div className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  The Parcego platform, including its design, functionality, and content, is protected by intellectual property laws. You may not:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                  <li>Copy, modify, or distribute our platform or content</li>
                  <li>Reverse engineer or attempt to extract source code</li>
                  <li>Use our trademarks or logos without permission</li>
                  <li>Create derivative works based on our platform</li>
                </ul>
                <p className="text-gray-600 leading-relaxed">
                  You retain ownership of any content you upload to our platform, but grant us a license to use such content 
                  as necessary to provide our services.
                </p>
              </div>
            </section>

            <Separator />

            {/* Termination */}
            <section id="parcego-landing-terms-termination" aria-labelledby="section-termination">
              <h2 id="section-termination" className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Icon name="XCircle" className="h-5 w-5 text-blue-600" aria-hidden="true" />
                9. Termination
              </h2>
              <div className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  Either party may terminate these Terms at any time. We may suspend or terminate your account immediately if you:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                  <li>Violate these Terms or our policies</li>
                  <li>Engage in fraudulent or illegal activities</li>
                  <li>Fail to pay required fees</li>
                  <li>Provide false or misleading information</li>
                </ul>
                <p className="text-gray-600 leading-relaxed">
                  Upon termination, your right to use our services ceases immediately, and we may delete your account and data 
                  in accordance with our data retention policies.
                </p>
              </div>
            </section>

            <Separator />

            {/* Governing Law */}
            <section id="parcego-landing-terms-law" aria-labelledby="section-law">
              <h2 id="section-law" className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Icon name="Gavel" className="h-5 w-5 text-blue-600" aria-hidden="true" />
                10. Governing Law and Dispute Resolution
              </h2>
              <div className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  These Terms are governed by the laws of Ontario, Canada, without regard to conflict of law principles. 
                  Any disputes arising from these Terms or your use of our services will be resolved through:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-gray-600 ml-4">
                  <li>Good faith negotiations between the parties</li>
                  <li>Mediation if negotiations fail</li>
                  <li>Binding arbitration in Toronto, Ontario</li>
                </ol>
                <p className="text-gray-600 leading-relaxed">
                  You waive any right to participate in class action lawsuits or class-wide arbitration against us.
                </p>
              </div>
            </section>

            <Separator />

            {/* Changes to Terms */}
            <section id="parcego-landing-terms-changes" aria-labelledby="section-changes">
              <h2 id="section-changes" className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Icon name="Edit" className="h-5 w-5 text-blue-600" aria-hidden="true" />
                11. Changes to Terms
              </h2>
              <div className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  We may update these Terms from time to time to reflect changes in our services or applicable laws. 
                  We will notify you of material changes by:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                  <li>Posting updated Terms on our platform</li>
                  <li>Sending email notifications to registered users</li>
                  <li>Displaying prominent notices on our platform</li>
                </ul>
                <p className="text-gray-600 leading-relaxed">
                  Your continued use of our services after changes become effective constitutes acceptance of the updated Terms.
                </p>
              </div>
            </section>

            <Separator />

            {/* Contact Information */}
            <section id="parcego-landing-terms-contact" aria-labelledby="section-contact">
              <h2 id="section-contact" className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Icon name="Mail" className="h-5 w-5 text-blue-600" aria-hidden="true" />
                12. Contact Information
              </h2>
              <div className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  If you have any questions about these Terms and Conditions, please contact us:
                </p>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="space-y-2">
                    <p className="text-blue-900 font-medium">Parcego Legal Team</p>
                    <p className="text-blue-800 text-sm">Email: help@parcego.com</p>
                    <p className="text-blue-800 text-sm">Phone: 519-619-6759</p>
                    <p className="text-blue-800 text-sm">Address: 975 Midway Blvd, Unit 13, Mississauga, ON L5T 2J6</p>
                  </div>
                </div>
              </div>
            </section>

          </CardContent>
        </Card>

        {/* Action Buttons */}
        <nav aria-label="Related pages" className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button 
            variant="outline"
            onClick={() => router.push("/landing/privacy")}
            className="flex items-center gap-2"
            id="parcego-landing-terms-privacy-btn"
            aria-label="Go to Privacy Policy page"
          >
            <Icon name="Shield" className="h-4 w-4" aria-hidden="true" />
            Privacy Policy
          </Button>
          <Button 
            variant="outline"
            onClick={() => router.push("/support")}
            className="flex items-center gap-2"
            id="parcego-landing-terms-support-btn"
            aria-label="Go to Support page"
          >
            <Icon name="HelpCircle" className="h-4 w-4" aria-hidden="true" />
            Contact Support
          </Button>
        </nav>
      </main>
    </div>
  );
}

