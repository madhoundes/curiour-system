"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { useRouter } from "next/navigation";

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <div id="parcego-privacy-policy-container" className="space-y-6">
      {/* Skip to main content link for keyboard navigation */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md"
        id="parcego-privacy-skip-link"
      >
        Skip to main content
      </a>

      {/* Main Content */}
      <main id="main-content" className="max-w-4xl mx-auto" role="main" aria-label="Privacy Policy">
        {/* Page Header */}
        <PageHeader
          title="Privacy Policy"
          description="Your privacy is important to us. Learn how we collect, use, and protect your information."
          icon="Shield"
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
                <li><a href="#parcego-privacy-policy-information-collection" className="hover:text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded">Information We Collect</a></li>
                <li><a href="#parcego-privacy-policy-information-use" className="hover:text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded">How We Use Your Information</a></li>
                <li><a href="#parcego-privacy-policy-information-sharing" className="hover:text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded">Information Sharing and Disclosure</a></li>
                <li><a href="#parcego-privacy-policy-data-security" className="hover:text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded">Data Security</a></li>
                <li><a href="#parcego-privacy-policy-your-rights" className="hover:text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded">Your Rights and Choices</a></li>
                <li><a href="#parcego-privacy-policy-cookies" className="hover:text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded">Cookies and Tracking Technologies</a></li>
                <li><a href="#parcego-privacy-policy-international-transfers" className="hover:text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded">International Data Transfers</a></li>
                <li><a href="#parcego-privacy-policy-children" className="hover:text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded">Children's Privacy</a></li>
                <li><a href="#parcego-privacy-policy-changes" className="hover:text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded">Changes to This Privacy Policy</a></li>
                <li><a href="#parcego-privacy-policy-contact" className="hover:text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded">Contact Us</a></li>
              </ol>
            </CardContent>
          </Card>
        </nav>

        {/* Privacy Policy Content */}
        <Card id="parcego-privacy-policy-main-content" className="mb-8" role="article" aria-labelledby="privacy-overview-title">
          <CardHeader>
            <CardTitle id="privacy-overview-title" className="flex items-center gap-2">
              <Icon name="FileText" className="h-6 w-6 text-blue-600" aria-hidden="true" />
              Privacy Policy Overview
            </CardTitle>
            <CardDescription>
              This Privacy Policy describes how Parcego ("we," "our," or "us") collects, uses, and shares information about you when you use our courier business platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            
            {/* Information We Collect */}
            <section id="parcego-privacy-policy-information-collection" aria-labelledby="section-collection">
              <h2 id="section-collection" className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Icon name="Database" className="h-5 w-5 text-blue-600" aria-hidden="true" />
                1. Information We Collect
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Personal Information</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support. This may include:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600 ml-4">
                    <li>Name, email address, and phone number</li>
                    <li>Business information and verification documents</li>
                    <li>Shipping addresses and recipient information</li>
                    <li>Payment information (processed securely through Stripe)</li>
                    <li>Communication preferences and support interactions</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Usage Information</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We automatically collect certain information about your use of our platform, including:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600 ml-4">
                    <li>Device information and IP address</li>
                    <li>Browser type and operating system</li>
                    <li>Pages visited and features used</li>
                    <li>Time spent on our platform</li>
                    <li>Error logs and performance data</li>
                  </ul>
                </div>
              </div>
            </section>

            <Separator />

            {/* How We Use Information */}
            <section id="parcego-privacy-policy-information-use" aria-labelledby="section-use">
              <h2 id="section-use" className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Icon name="Settings" className="h-5 w-5 text-blue-600" aria-hidden="true" />
                2. How We Use Your Information
              </h2>
              <div className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  We use the information we collect to provide, maintain, and improve our services. Specifically, we use your information to:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                  <li>Process shipments and provide courier services</li>
                  <li>Verify your identity and business information</li>
                  <li>Process payments and manage billing</li>
                  <li>Provide customer support and respond to inquiries</li>
                  <li>Send important service updates and notifications</li>
                  <li>Improve our platform and develop new features</li>
                  <li>Ensure platform security and prevent fraud</li>
                  <li>Comply with legal obligations and regulations</li>
                </ul>
              </div>
            </section>

            <Separator />

            {/* Information Sharing */}
            <section id="parcego-privacy-policy-information-sharing" aria-labelledby="section-sharing">
              <h2 id="section-sharing" className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Icon name="Users" className="h-5 w-5 text-blue-600" aria-hidden="true" />
                3. Information Sharing and Disclosure
              </h2>
              <div className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  We do not sell, trade, or rent your personal information to third parties. We may share your information in the following limited circumstances:
                </p>
                
                <div className="space-y-3">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-medium text-blue-900 mb-2">Service Providers</h3>
                    <p className="text-blue-800 text-sm">
                      We share information with trusted third-party service providers who assist us in operating our platform, such as payment processors (Stripe), cloud hosting providers, and analytics services.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h3 className="font-medium text-green-900 mb-2">Courier Partners</h3>
                    <p className="text-green-800 text-sm">
                      We share necessary shipping information with courier partners to facilitate package delivery, including recipient addresses and tracking information.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h3 className="font-medium text-yellow-900 mb-2">Legal Requirements</h3>
                    <p className="text-yellow-800 text-sm">
                      We may disclose information when required by law, court order, or to protect our rights, property, or safety, or that of our users.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            {/* Data Security */}
            <section id="parcego-privacy-policy-data-security" aria-labelledby="section-security">
              <h2 id="section-security" className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Icon name="Lock" className="h-5 w-5 text-blue-600" aria-hidden="true" />
                4. Data Security
              </h2>
              <div className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments and updates</li>
                  <li>Access controls and authentication systems</li>
                  <li>Secure payment processing through PCI-compliant providers</li>
                  <li>Employee training on data protection practices</li>
                </ul>
              </div>
            </section>

            <Separator />

            {/* Your Rights */}
            <section id="parcego-privacy-policy-your-rights" aria-labelledby="section-rights">
              <h2 id="section-rights" className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Icon name="UserCheck" className="h-5 w-5 text-blue-600" aria-hidden="true" />
                5. Your Rights and Choices
              </h2>
              <div className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  You have certain rights regarding your personal information, including:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Access and Update</h3>
                    <p className="text-gray-600 text-sm">
                      You can access and update your account information through your profile settings.
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Data Portability</h3>
                    <p className="text-gray-600 text-sm">
                      You can request a copy of your data in a portable format.
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Deletion</h3>
                    <p className="text-gray-600 text-sm">
                      You can request deletion of your account and associated data.
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Communication Preferences</h3>
                    <p className="text-gray-600 text-sm">
                      You can opt out of marketing communications while keeping essential service notifications.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            {/* Cookies and Tracking */}
            <section id="parcego-privacy-policy-cookies" aria-labelledby="section-cookies">
              <h2 id="section-cookies" className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Icon name="Cookie" className="h-5 w-5 text-blue-600" aria-hidden="true" />
                6. Cookies and Tracking Technologies
              </h2>
              <div className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  We use cookies and similar tracking technologies to enhance your experience on our platform. These technologies help us:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                  <li>Remember your preferences and settings</li>
                  <li>Analyze platform usage and performance</li>
                  <li>Provide personalized content and features</li>
                  <li>Ensure platform security and prevent fraud</li>
                </ul>
                <p className="text-gray-600 leading-relaxed mt-4">
                  You can control cookie settings through your browser preferences, though disabling certain cookies may affect platform functionality.
                </p>
              </div>
            </section>

            <Separator />

            {/* International Transfers */}
            <section id="parcego-privacy-policy-international-transfers" aria-labelledby="section-transfers">
              <h2 id="section-transfers" className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Icon name="Globe" className="h-5 w-5 text-blue-600" aria-hidden="true" />
                7. International Data Transfers
              </h2>
              <div className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with applicable data protection laws.
                </p>
              </div>
            </section>

            <Separator />

            {/* Children's Privacy */}
            <section id="parcego-privacy-policy-children" aria-labelledby="section-children">
              <h2 id="section-children" className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Icon name="Baby" className="h-5 w-5 text-blue-600" aria-hidden="true" />
                8. Children's Privacy
              </h2>
              <div className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.
                </p>
              </div>
            </section>

            <Separator />

            {/* Changes to Privacy Policy */}
            <section id="parcego-privacy-policy-changes" aria-labelledby="section-changes">
              <h2 id="section-changes" className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Icon name="Edit" className="h-5 w-5 text-blue-600" aria-hidden="true" />
                9. Changes to This Privacy Policy
              </h2>
              <div className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. We will notify you of any material changes by posting the updated policy on our platform and updating the "Last Updated" date.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  We encourage you to review this Privacy Policy periodically to stay informed about how we protect your information.
                </p>
              </div>
            </section>

            <Separator />

            {/* Contact Information */}
            <section id="parcego-privacy-policy-contact" aria-labelledby="section-contact">
              <h2 id="section-contact" className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Icon name="Mail" className="h-5 w-5 text-blue-600" aria-hidden="true" />
                10. Contact Us
              </h2>
              <div className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="space-y-2">
                    <p className="text-blue-900 font-medium">Parcego Privacy Team</p>
                    <p className="text-blue-800 text-sm">Email: privacy@parcego.com</p>
                    <p className="text-blue-800 text-sm">Phone: 1-800-PARCEGO</p>
                    <p className="text-blue-800 text-sm">Address: 123 Business Ave, Suite 100, Toronto, ON M5H 2N2</p>
                  </div>
                </div>
              </div>
            </section>

          </CardContent>
        </Card>

        {/* Action Buttons */}
        <nav aria-label="Related pages" className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="outline"
            onClick={() => router.push("/support")}
            className="flex items-center gap-2"
            id="parcego-privacy-policy-support-btn"
            aria-label="Go to Support page"
          >
            <Icon name="HelpCircle" className="h-4 w-4" aria-hidden="true" />
            Contact Support
          </Button>
          <Button 
            variant="outline"
            onClick={() => router.push("/terms-conditions")}
            className="flex items-center gap-2"
            id="parcego-privacy-policy-terms-btn"
            aria-label="Go to Terms and Conditions page"
          >
            <Icon name="FileText" className="h-4 w-4" aria-hidden="true" />
            Terms & Conditions
          </Button>
        </nav>
      </main>
    </div>
  );
}
