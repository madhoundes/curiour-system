"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Icon } from "@/components/ui/icon";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PageHeader } from "@/components/ui/page-header";
import { toast } from "sonner";

// Import types and mock data from the support library
import type { FAQCategory } from '@/lib/mock/support';
import { mockFAQs, mockHelpArticles, mockVideoTutorials, helpCategories } from '@/lib/mock/support';

// Import contact API service
import { contactService } from '@/lib/api/contact';
import { profileService } from '@/lib/api/profile';

// Mock data is now imported from the support library

export default function SupportHelpCenter() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<FAQCategory | 'all'>('all');

  const [activeTab, setActiveTab] = useState('overview');
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Filter FAQs based on category only
  const filteredFAQs = useMemo(() => {
    return mockFAQs.filter(faq => {
      const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
      return matchesCategory;
    });
  }, [activeCategory]);

  // Filter articles based on category only
  const filteredArticles = useMemo(() => {
    return mockHelpArticles.filter(article => {
      const matchesCategory = activeCategory === 'all' || article.category === activeCategory;
      return matchesCategory;
    });
  }, [activeCategory]);

  // Filter videos based on category only
  const filteredVideos = useMemo(() => {
    return mockVideoTutorials.filter(video => {
      const matchesCategory = activeCategory === 'all' || video.category === activeCategory;
      return matchesCategory;
    });
  }, [activeCategory]);

  // const handleBookmarkToggle = (itemId: string) => {
  //   setBookmarkedItems(prev => 
  //     prev.includes(itemId) 
  //       ? prev.filter(id => id !== itemId)
  //       : [...prev, itemId]
  //   );
  // };

  const handleReadArticle = (articleId: string) => {
    // Navigate to the dedicated article page
    router.push(`/support/article/${articleId}`);
  };

  // Load user profile data when contact form is opened
  const loadUserProfile = async () => {
    if (contactForm.name || contactForm.email) {
      // Don't reload if form already has data
      return;
    }

    setIsLoadingProfile(true);
    try {
      const profile = await profileService.getProfile();
      if (profile) {
        setContactForm(prev => ({
          ...prev,
          name: profile.first_name && profile.last_name 
            ? `${profile.first_name} ${profile.last_name}` 
            : prev.name,
          email: profile.email || prev.email
        }));
      }
    } catch (error) {
      console.error('Failed to load profile for contact form:', error);
      // Don't show error to user, just continue with empty form
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Validate form data
      if (!contactForm.name.trim()) {
        throw new Error('Name is required');
      }
      if (!contactForm.email.trim()) {
        throw new Error('Email is required');
      }
      if (!contactForm.subject.trim()) {
        throw new Error('Subject is required');
      }
      if (!contactForm.message.trim()) {
        throw new Error('Message is required');
      }
      if (contactForm.message.trim().length < 10) {
        throw new Error('Message must be at least 10 characters long');
      }

      // Submit to contact API
      const response = await contactService.sendMessage({
        message: contactForm.message.trim(),
        subject: contactForm.subject.trim(),
        priority: contactForm.priority
      });

      // Reset form and close modal on success
      setContactForm({ 
        name: '', 
        email: '', 
        subject: '', 
        message: '', 
        priority: 'normal' 
      });
      setShowContactForm(false);
      
      // Show success message with ticket ID
      toast.success(`Message sent successfully! Your ticket ID is: ${response.ticket_id}`);
      
    } catch (error: any) {
      console.error('Failed to send contact message:', error);
      setSubmitError(error.message || 'Failed to send message. Please try again.');
      toast.error(error.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="parcego-support-center-container" className="min-h-screen">
      {/* Page Header */}
      <PageHeader
        title="Support & Help Center"
        description="Find answers, learn best practices, and get the help you need"
      />

      {/* Main Content */}
      <div className="mt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 parcego-tabs-enhanced">
          <TabsList 
            className="flex w-full h-auto py-1.5 px-1.5 bg-gray-100 rounded-lg overflow-hidden justify-between"
          >
            <TabsTrigger 
              value="overview" 
              className="flex-1 h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3 py-1 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 transition-all duration-200 rounded-md"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="faqs"
              className="flex-1 h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3 py-1 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 transition-all duration-200 rounded-md"
            >
              FAQs
            </TabsTrigger>
            <TabsTrigger 
              value="articles"
              className="flex-1 h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3 py-1 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 transition-all duration-200 rounded-md"
            >
              Articles
            </TabsTrigger>
            <TabsTrigger 
              value="videos"
              className="flex-1 h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3 py-1 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 transition-all duration-200 rounded-md"
            >
              Video Tutorials
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-4 sm:p-6 text-white">
              <h2 className="text-2xl font-bold mb-3">Welcome to Your Help Center</h2>
              <p className="text-blue-100 mb-6 max-w-2xl leading-relaxed">
                Everything you need to succeed with our courier platform. From getting started to advanced features, 
                we&apos;ve got you covered with comprehensive guides, tutorials, and support.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowContactForm(true);
                    loadUserProfile();
                  }}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 hover:text-white transition-all duration-200"
                >
                  Contact Support
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => alert('Live chat feature coming soon!')}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 hover:text-white transition-all duration-200"
                >
                  Live Chat
                </Button>
              </div>
            </div>

            {/* Category Grid */}
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Help Categories</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {helpCategories.map((category) => (
                  <Card
                    key={category.id}
                    id={`parcego-support-category-${category.id}`}
                    className="hover:shadow-md transition-shadow cursor-pointer border rounded-xl overflow-hidden group"
                    onClick={() => setActiveTab('faqs')}
                  >
                    <CardHeader className="px-4 py-3.5">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-xl ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                          <Icon name={category.icon} className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-1.5">{category.name}</CardTitle>
                          <CardDescription className="text-sm text-gray-600">{category.count} articles & guides</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 pb-3.5">
                      <p className="text-sm text-gray-600 leading-relaxed mb-3">{category.description}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-500">Click to explore</span>
                        <Icon name="ArrowRight" className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>


          </TabsContent>

          {/* FAQs Tab - Redesigned with Accordion */}
          <TabsContent value="faqs" className="space-y-6">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
              
              {/* Category Filter */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2" role="tablist" aria-label="FAQ categories">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveCategory('all')}
                    role="tab"
                    aria-selected={activeCategory === 'all'}
                    aria-label="Show all FAQ categories"
                    className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                      activeCategory === 'all'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 border border-transparent hover:border-gray-200'
                    }`}
                  >
                    All Categories
                  </Button>
                  {Array.from(new Set(mockFAQs.map(faq => faq.category))).map((category) => (
                    <Button
                      key={category}
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveCategory(category)}
                      role="tab"
                      aria-selected={activeCategory === category}
                      aria-label={`Show ${category} FAQs`}
                      className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                        activeCategory === category
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 border border-transparent hover:border-gray-200'
                      }`}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Accordion FAQ Section */}
              <div id="parcego-support-faq-container" className="space-y-4">
                {filteredFAQs.length > 0 ? (
                  <Accordion
                    type="single"
                    collapsible
                    className="w-full space-y-4"
                    defaultValue={filteredFAQs[0]?.id}
                  >
                    {filteredFAQs.map((faq) => (
                      <AccordionItem
                        key={faq.id}
                        value={faq.id}
                        id={`parcego-support-faq-item-${faq.id}`}
                        className="border rounded-xl transition-all duration-200 bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-50 overflow-hidden"
                      >
                        <AccordionTrigger className="px-4 py-4 hover:no-underline group data-[state=open]:bg-gray-50 data-[state=open]:border-b data-[state=open]:border-gray-200 transition-all duration-200">
                          <div className="flex items-start justify-between w-full">
                            <div className="flex-1 text-left pr-6">
                              <h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors leading-relaxed">
                                {faq.question}
                              </h4>
                              <div className="flex items-center gap-3 mt-3">
                                <Badge variant="outline" className="text-xs font-medium">
                                  {faq.category.charAt(0).toUpperCase() + faq.category.slice(1)}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 py-4 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-2 bg-white">
                          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                            <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div id="parcego-support-no-results" className="text-center py-12">
                    <Icon name="CircleQuestionMark" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No FAQs found</h3>
                    <p className="text-gray-500 mb-4">
                      No FAQs available for the selected category
                    </p>
                    <Button onClick={() => setActiveCategory('all')}>
                      View All Categories
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Articles Tab */}
          <TabsContent value="articles" className="space-y-6">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Help Articles</h3>
              <div id="parcego-support-articles-list" className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filteredArticles.length > 0 ? (
                  filteredArticles.map((article) => (
                    <Card
                      key={article.id}
                      id={`parcego-support-article-${article.id}`}
                      className="hover:shadow-md transition-shadow border rounded-xl overflow-hidden"
                    >
                      <CardHeader className="px-4 py-4">
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="outline">{article.category}</Badge>
                        </div>
                        <CardTitle className="text-xl mb-3 leading-tight">{article.title}</CardTitle>
                        <CardDescription className="text-base text-gray-600 leading-relaxed">{article.excerpt}</CardDescription>
                      </CardHeader>
                      <CardContent className="px-4 pb-4">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-sm text-gray-500">
                            <Icon name="Clock" className="h-4 w-4" />
                            {article.readTime} min read
                          </span>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="px-4 py-2"
                            onClick={() => handleReadArticle(article.id)}
                          >
                            Read Article
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div id="parcego-support-no-results" className="text-center py-12">
                    <Icon name="FileText" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
                    <p className="text-gray-500 mb-4">
                      No articles available for the selected category
                    </p>
                    <Button onClick={() => setActiveCategory('all')}>
                      View All Categories
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos" className="space-y-6">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Video Tutorials</h3>
              <div id="parcego-support-video-section" className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filteredVideos.length > 0 ? (
                  filteredVideos.map((video) => (
                    <Card
                      key={video.id}
                      id={`parcego-support-video-${video.id}`}
                      className="hover:shadow-md transition-shadow border rounded-xl overflow-hidden"
                    >
                      <CardHeader className="px-4 py-4">
                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
                          <iframe
                            src={video.videoUrl}
                            title={video.title}
                            className="w-full h-full"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                        <CardTitle className="text-xl mb-3 leading-tight">{video.title}</CardTitle>
                        <CardDescription className="text-base text-gray-600 leading-relaxed">
                          {video.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  ))
                ) : (
                  <div id="parcego-support-no-results" className="text-center py-12">
                    <Icon name="Video" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No video tutorials found</h3>
                    <p className="text-gray-500 mb-4">
                      No video tutorials available for the selected category
                    </p>
                    <Button onClick={() => setActiveCategory('all')}>
                      View All Categories
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Contact Support Dialog */}
      <Dialog open={showContactForm} onOpenChange={setShowContactForm}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle>Contact Support</DialogTitle>
            <DialogDescription>
              Need help? Fill out the form below and we&apos;ll get back to you within 24 hours.
            </DialogDescription>
          </DialogHeader>
          <form id="parcego-support-contact-form" onSubmit={handleContactSubmit} className="space-y-6">
            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{submitError}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">Name</Label>
                <Input
                  id="name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={isLoadingProfile ? "Loading..." : "Your full name"}
                  disabled={isLoadingProfile}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder={isLoadingProfile ? "Loading..." : "your.email@example.com"}
                  disabled={isLoadingProfile}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-sm font-medium text-gray-700">Subject</Label>
              <Input
                id="subject"
                value={contactForm.subject}
                onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-sm font-medium text-gray-700">Priority</Label>
              <Select
                value={contactForm.priority}
                onValueChange={(value: 'low' | 'normal' | 'high' | 'urgent') => {
                  console.log('Priority changed to:', value);
                  setContactForm(prev => ({ ...prev, priority: value }));
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select priority level" />
                </SelectTrigger>
                <SelectContent className="z-[10000]">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="message" className="text-sm font-medium text-gray-700">Message</Label>
                <span className={`text-xs ${contactForm.message.length < 10 ? 'text-red-500' : 'text-gray-500'}`}>
                  {contactForm.message.length}/10 min
                </span>
              </div>
              <Textarea
                id="message"
                rows={4}
                value={contactForm.message}
                onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                required
                placeholder="Describe your issue or question in detail... (minimum 10 characters)"
                className={contactForm.message.length > 0 && contactForm.message.length < 10 ? 'border-red-300 focus:border-red-500' : ''}
              />
              {contactForm.message.length > 0 && contactForm.message.length < 10 && (
                <p className="text-xs text-red-500">Message must be at least 10 characters long</p>
              )}
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowContactForm(false);
                  setSubmitError(null);
                  setContactForm({ 
                    name: '', 
                    email: '', 
                    subject: '', 
                    message: '', 
                    priority: 'normal' 
                  });
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
