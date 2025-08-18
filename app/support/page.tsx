"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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

// Import types and mock data from the support library
import type { FAQCategory } from '@/lib/mock/support';
import { mockFAQs, mockHelpArticles, mockVideoTutorials, helpCategories } from '@/lib/mock/support';

// Mock data is now imported from the support library

export default function SupportHelpCenter() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<FAQCategory | 'all'>('all');
  const [bookmarkedItems, setBookmarkedItems] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'normal'
  });

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

  const handleBookmarkToggle = (itemId: string) => {
    setBookmarkedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock submission - in real app, this would send to backend
    console.log('Contact form submitted:', contactForm);
    setShowContactForm(false);
    setContactForm({ name: '', email: '', subject: '', message: '', priority: 'normal' });
    // Show success message
    alert('Thank you for your message! We\'ll get back to you within 24 hours.');
  };

  return (
    <div id="parcego-support-center-container" className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                <Icon name="arrow-left" className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 id="parcego-support-header-title" className="text-3xl font-bold text-gray-900">
                  Support & Help Center
                </h1>
                <p className="text-gray-600 mt-1">
                  Find answers, learn best practices, and get the help you need
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-50 border border-gray-200 p-1">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200 text-gray-600 hover:text-gray-800 transition-all duration-200"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="faqs"
              className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200 text-gray-600 hover:text-gray-800 transition-all duration-200"
            >
              FAQs
            </TabsTrigger>
            <TabsTrigger 
              value="articles"
              className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200 text-gray-600 hover:text-gray-800 transition-all duration-200"
            >
              Articles
            </TabsTrigger>
            <TabsTrigger 
              value="videos"
              className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200 text-gray-600 hover:text-gray-800 transition-all duration-200"
            >
              Video Tutorials
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">Welcome to Your Help Center</h2>
              <p className="text-blue-100 mb-6 max-w-2xl">
                Everything you need to succeed with our courier platform. From getting started to advanced features, 
                we&apos;ve got you covered with comprehensive guides, tutorials, and support.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowContactForm(true)}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-200"
                >
                  Contact Support
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => alert('Live chat feature coming soon!')}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-200"
                >
                  Live Chat
                </Button>
              </div>
            </div>

            {/* Category Grid */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Help Categories</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {helpCategories.map((category) => (
                  <Card
                    key={category.id}
                    id={`parcego-support-category-${category.id}`}
                    className="hover:shadow-md transition-shadow cursor-pointer border rounded-xl overflow-hidden group"
                    onClick={() => setActiveTab('faqs')}
                  >
                    <CardHeader className="px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-xl ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                          <Icon name={category.icon} className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{category.name}</CardTitle>
                          <CardDescription className="text-sm text-gray-600">{category.count} articles & guides</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="px-8 pb-6">
                      <p className="text-sm text-gray-600 leading-relaxed">{category.description}</p>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <span className="text-xs text-gray-500">Click to explore</span>
                        <Icon name="arrow-right" className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Featured Content */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Featured Content</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mockHelpArticles.slice(0, 2).map((article) => (
                  <Card key={article.id} className="hover:shadow-md transition-shadow border rounded-xl overflow-hidden">
                    <CardHeader className="px-8 py-6">
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="outline">{article.category}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleBookmarkToggle(article.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Icon 
                            name={bookmarkedItems.includes(article.id) ? "bookmark" : "bookmark-plus"} 
                            className="h-4 w-4" 
                          />
                        </Button>
                      </div>
                      <CardTitle className="text-xl mb-3 leading-tight">{article.title}</CardTitle>
                      <CardDescription className="text-base text-gray-600 leading-relaxed">{article.excerpt}</CardDescription>
                    </CardHeader>
                    <CardContent className="px-8 pb-6">
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span className="flex items-center gap-1">
                          <Icon name="clock" className="h-4 w-4" />
                          {article.readTime} min read
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="user" className="h-4 w-4" />
                          By {article.author}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{article.difficulty}</Badge>
                        <Button variant="outline" size="sm" className="px-4 py-2">
                          Read Article
                        </Button>
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
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
              
              {/* Category Filter */}
              <div className="mb-6">
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
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
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
                          ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
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
                        className="border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-50 overflow-hidden"
                      >
                        <AccordionTrigger className="px-8 py-6 hover:no-underline group data-[state=open]:bg-gray-50 data-[state=open]:border-b data-[state=open]:border-gray-200 transition-all duration-200">
                          <div className="flex items-start justify-between w-full">
                            <div className="flex-1 text-left pr-6">
                              <h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors leading-relaxed">
                                {faq.question}
                              </h4>
                              <div className="flex items-center gap-3 mt-3">
                                <Badge variant="outline" className="text-xs font-medium">
                                  {faq.category.charAt(0).toUpperCase() + faq.category.slice(1)}
                                </Badge>
                                <Badge variant="secondary" className="text-xs font-medium">
                                  {faq.difficulty}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-8 py-8 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-2 bg-gray-50">
                          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                            <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
                            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Icon name="thumbs-up" className="h-4 w-4" />
                                  {faq.helpfulCount} found helpful
                                </span>
                                <span className="flex items-center gap-1">
                                  <Icon name="thumbs-down" className="h-4 w-4" />
                                  {faq.notHelpfulCount} not helpful
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" className="text-xs">
                                  <Icon name="message-circle" className="h-3 w-3 mr-1" />
                                  Report Issue
                                </Button>
                                <Button variant="ghost" size="sm" className="text-xs">
                                  <Icon name="share" className="h-3 w-3 mr-1" />
                                  Share
                                </Button>
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div id="parcego-support-no-results" className="text-center py-12">
                    <Icon name="help-circle" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Help Articles</h3>
              <div id="parcego-support-articles-list" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredArticles.length > 0 ? (
                  filteredArticles.map((article) => (
                    <Card
                      key={article.id}
                      id={`parcego-support-article-${article.id}`}
                      className="hover:shadow-md transition-shadow border rounded-xl overflow-hidden"
                    >
                      <CardHeader className="px-8 py-6">
                        <div className="flex items-center justify-between mb-4">
                          <Badge variant="outline">{article.category}</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleBookmarkToggle(article.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Icon 
                              name={bookmarkedItems.includes(article.id) ? "bookmark" : "bookmark-plus"} 
                              className="h-4 w-4" 
                            />
                          </Button>
                        </div>
                        <CardTitle className="text-xl mb-3 leading-tight">{article.title}</CardTitle>
                        <CardDescription className="text-base text-gray-600 leading-relaxed">{article.excerpt}</CardDescription>
                      </CardHeader>
                      <CardContent className="px-8 pb-6">
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                          <span className="flex items-center gap-1">
                            <Icon name="clock" className="h-4 w-4" />
                            {article.readTime} min read
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon name="user" className="h-4 w-4" />
                            By {article.author}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary">{article.difficulty}</Badge>
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <Icon name="thumbs-up" className="h-4 w-4" />
                              {article.helpfulCount} found helpful
                            </span>
                          </div>
                          <Button variant="outline" size="sm" className="px-4 py-2">
                            Read Article
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div id="parcego-support-no-results" className="text-center py-12">
                    <Icon name="file-text" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Video Tutorials</h3>
              <div id="parcego-support-video-section" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredVideos.length > 0 ? (
                  filteredVideos.map((video) => (
                    <Card
                      key={video.id}
                      id={`parcego-support-video-${video.id}`}
                      className="hover:shadow-md transition-shadow border rounded-xl overflow-hidden"
                    >
                      <CardHeader className="px-8 py-6">
                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-6">
                          <iframe
                            src={video.videoUrl}
                            title={video.title}
                            className="w-full h-full"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                        <CardTitle className="text-xl mb-4 leading-tight">{video.title}</CardTitle>
                        <CardDescription className="text-base text-gray-600 leading-relaxed mb-4">
                          {video.description}
                        </CardDescription>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Icon name="clock" className="h-4 w-4" />
                            {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon name="tag" className="h-4 w-4" />
                            {video.category.charAt(0).toUpperCase() + video.category.slice(1)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon name="bar-chart" className="h-4 w-4" />
                            {video.difficulty}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="px-8 pb-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="px-4 py-2">
                              <Icon name="play" className="h-4 w-4 mr-2" />
                              Watch Now
                            </Button>
                            <Button variant="ghost" size="sm" className="px-4 py-2">
                              <Icon name="bookmark-plus" className="h-4 w-4 mr-2" />
                              Save
                            </Button>
                          </div>
                          <Button variant="ghost" size="sm" className="px-4 py-2">
                            <Icon name="share" className="h-4 w-4 mr-2" />
                            Share
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div id="parcego-support-no-results" className="text-center py-12">
                    <Icon name="video" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Contact Support</DialogTitle>
            <DialogDescription>
              Need help? Fill out the form below and we&apos;ll get back to you within 24 hours.
            </DialogDescription>
          </DialogHeader>
          <form id="parcego-support-contact-form" onSubmit={handleContactSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={contactForm.subject}
                onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={contactForm.priority}
                onValueChange={(value) => setContactForm(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                rows={4}
                value={contactForm.message}
                onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                required
                placeholder="Describe your issue or question in detail..."
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowContactForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Send Message
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
