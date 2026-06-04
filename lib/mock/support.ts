// Support & Help Center Mock Data
// Following the merchant-support-help.mdc rule structure

export type FAQCategory = 'getting-started' | 'shipments' | 'account' | 'technical' | 'business';
export type FAQDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: FAQCategory;
  difficulty: FAQDifficulty;
  tags: string[];
  helpfulCount: number;
  notHelpfulCount: number;
  lastUpdated: string;
  relatedArticles?: string[];
  videoTutorial?: string;
}

export interface HelpArticle {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: FAQCategory;
  difficulty: FAQDifficulty;
  tags: string[];
  author: string;
  publishedDate: string;
  lastUpdated: string;
  readTime: number;
  helpfulCount: number;
  bookmarked: boolean;
  relatedArticles: string[];
  videoTutorial?: string;
  attachments?: Array<{
    name: string;
    url: string;
    type: 'pdf' | 'image' | 'video';
  }>;
}

export interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  category: FAQCategory;
  difficulty: FAQDifficulty;
  tags: string[];
  transcript?: string;
  chapters?: Array<{
    title: string;
    timestamp: number;
  }>;
  relatedContent: string[];
}

export interface HelpCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  count: number;
}

// Comprehensive FAQ Data
export const mockFAQs: FAQ[] = [
  // Getting Started FAQs
  {
    id: 'faq-001',
    question: 'How do I create my first shipment?',
    answer: 'Creating your first shipment is easy! Start by clicking the "Create New Shipment" button on your dashboard. Fill in the recipient details, package information, and select your preferred shipping option. Our system will provide a real-time quote, and once you confirm, you can purchase your shipping label. The entire process takes just a few minutes and you\'ll receive your tracking number immediately.',
    category: 'getting-started',
    difficulty: 'beginner',
    tags: ['first-shipment', 'onboarding', 'basics', 'creation'],
    helpfulCount: 127,
    notHelpfulCount: 3,
    lastUpdated: '2025-01-15T10:30:00Z',
    relatedArticles: ['article-001', 'article-005'],
    videoTutorial: 'video-001'
  },
  {
    id: 'faq-002',
    question: 'What information do I need to create a shipment?',
    answer: 'To create a shipment, you\'ll need: 1) Recipient\'s full name and address, 2) Package dimensions (length, width, height) and weight, 3) Package contents description, 4) Your preferred shipping service (standard, express, etc.), 5) Payment method. We recommend having all this information ready before starting to ensure a smooth process.',
    category: 'getting-started',
    difficulty: 'beginner',
    tags: ['shipment-info', 'requirements', 'preparation'],
    helpfulCount: 89,
    notHelpfulCount: 2,
    lastUpdated: '2025-01-14T15:20:00Z',
    relatedArticles: ['article-001', 'article-002']
  },
  // Shipment Management FAQs
  {
    id: 'faq-004',
    question: 'What packaging materials do I need?',
    answer: 'For most shipments, you\'ll need: 1) Sturdy cardboard boxes (new or in excellent condition), 2) Bubble wrap or packing peanuts for cushioning, 3) Strong packing tape (2-3 inch width recommended), 4) Corner protectors for fragile items, 5) Void fill material to prevent shifting. Ensure your package can withstand drops from 3-4 feet and protect fragile items with adequate cushioning.',
    category: 'shipments',
    difficulty: 'beginner',
    tags: ['packaging', 'materials', 'protection', 'fragile-items'],
    helpfulCount: 89,
    notHelpfulCount: 2,
    lastUpdated: '2025-01-14T15:20:00Z',
    relatedArticles: ['article-002'],
    videoTutorial: 'video-002'
  },
  {
    id: 'faq-005',
    question: 'How do I track my shipments?',
    answer: 'You can track your shipments in several ways: 1) Use the tracking widget on your dashboard, 2) Visit the Track Package page, 3) Use the tracking number directly in our search bar, 4) Receive email notifications for status updates. Each tracking number provides real-time updates including pickup, transit, and delivery status with estimated delivery times.',
    category: 'shipments',
    difficulty: 'beginner',
    tags: ['tracking', 'status', 'updates', 'delivery'],
    helpfulCount: 156,
    notHelpfulCount: 1,
    lastUpdated: '2025-01-13T09:15:00Z',
    relatedArticles: ['article-003'],
    videoTutorial: 'video-003'
  },
  {
    id: 'faq-006',
    question: 'What happens if my package is lost or damaged?',
    answer: 'If your package is lost or damaged, follow these steps: 1) Contact our support team immediately (within 48 hours of delivery), 2) Provide tracking number and photos of damage if applicable, 3) File a claim through our claims portal, 4) We\'ll investigate and process your claim within 5-7 business days. Most claims are resolved within 10 business days.',
    category: 'shipments',
    difficulty: 'intermediate',
    tags: ['claims', 'damage', 'lost-packages', 'support'],
    helpfulCount: 73,
    notHelpfulCount: 4,
    lastUpdated: '2025-01-12T14:45:00Z',
    relatedArticles: ['article-004']
  },
  // Account & Billing FAQs
  {
    id: 'faq-008',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, and bank transfers. For business accounts, we also offer net 30 payment terms. All payments are processed securely through Stripe with PCI DSS compliance. You can save multiple payment methods and set a default for convenience.',
    category: 'account',
    difficulty: 'beginner',
    tags: ['payment', 'billing', 'credit-cards', 'security'],
    helpfulCount: 73,
    notHelpfulCount: 4,
    lastUpdated: '2025-01-12T14:45:00Z',
    relatedArticles: ['article-004']
  },
  {
    id: 'faq-010',
    question: 'How do I update my business information?',
    answer: 'To update your business information: 1) Go to Profile settings, 2) Click "Business Information", 3) Edit the relevant fields, 4) Click "Save Changes". Note that some changes (like business name or tax ID) may require re-verification. You\'ll receive email confirmation for all changes, and updates are typically processed within 24 hours.',
    category: 'account',
    difficulty: 'beginner',
    tags: ['profile', 'business-info', 'updates', 'verification'],
    helpfulCount: 67,
    notHelpfulCount: 3,
    lastUpdated: '2025-01-10T16:20:00Z',
    relatedArticles: ['article-006']
  },

  // Technical Support FAQs
  {
    id: 'faq-011',
    question: 'I can\'t log into my account. What should I do?',
    answer: 'If you can\'t log in, try these steps: 1) Check if Caps Lock is on, 2) Verify your email address is correct, 3) Use the "Forgot Password" link to reset your password, 4) Clear your browser cache and cookies, 5) Try a different browser or device. If the problem persists, contact our support team with your email address.',
    category: 'technical',
    difficulty: 'beginner',
    tags: ['login', 'password', 'troubleshooting', 'support'],
    helpfulCount: 89,
    notHelpfulCount: 5,
    lastUpdated: '2025-01-09T13:45:00Z',
    relatedArticles: ['article-007']
  },
  {
    id: 'faq-012',
    question: 'How do I connect my Shopify store?',
    answer: 'Install the Parcego app from your Shopify store\'s admin and follow the on-screen steps to connect it to your Parcego account. Once connected, your Shopify orders will automatically sync into Parcego so you can create shipments and labels without leaving the dashboard.',
    category: 'technical',
    difficulty: 'beginner',
    tags: ['shopify', 'integration', 'ecommerce'],
    helpfulCount: 34,
    notHelpfulCount: 1,
    lastUpdated: '2025-01-08T10:15:00Z',
    relatedArticles: ['article-008']
  },

  // Business Operations FAQs
  {
    id: 'faq-014',
    question: 'What are the shipping rates and how are they calculated?',
    answer: 'Shipping rates are calculated based on: 1) Package weight and dimensions, 2) Origin and destination zip codes, 3) Shipping service selected (standard, express, overnight), 4) Package value and insurance, 5) Fuel surcharges and seasonal adjustments. Rates are displayed in real-time during shipment creation. You can view our rate calculator for estimates.',
    category: 'business',
    difficulty: 'intermediate',
    tags: ['rates', 'pricing', 'calculation', 'fuel-surcharge'],
    helpfulCount: 78,
    notHelpfulCount: 3,
    lastUpdated: '2025-01-06T11:20:00Z',
    relatedArticles: ['article-010']
  }
];

// Comprehensive Help Articles Data
export const mockHelpArticles: HelpArticle[] = [
  {
    id: 'article-001',
    title: 'Complete Guide to Creating Shipments',
    content: `
      <h2>Getting Started</h2>
      <p>Creating shipments on our platform is designed to be simple and efficient. This comprehensive guide will walk you through every step of the process, from initial setup to label generation.</p>
      
      <h3>Step 1: Access the Shipment Creation</h3>
      <p>From your dashboard, click the "Create New Shipment" button. This will open our intuitive shipment form with all the necessary fields clearly labeled.</p>
      
      <h3>Step 2: Enter Recipient Information</h3>
      <p>Fill in the complete recipient details including:</p>
      <ul>
        <li>Full name (as it appears on government ID)</li>
        <li>Complete street address</li>
        <li>City, state, and ZIP code</li>
        <li>Phone number (for delivery coordination)</li>
        <li>Email address (for delivery notifications)</li>
      </ul>
      <p><strong>Pro tip:</strong> Accurate recipient information ensures successful delivery and reduces delays.</p>
      
      <h3>Step 3: Package Details</h3>
      <p>Specify package dimensions, weight, and contents:</p>
      <ul>
        <li>Length, width, and height in inches</li>
        <li>Weight in pounds</li>
        <li>Detailed description of contents</li>
        <li>Declared value for insurance</li>
      </ul>
      <p><strong>Important:</strong> Be as accurate as possible for proper pricing and handling instructions.</p>
      
      <h3>Step 4: Shipping Options</h3>
      <p>Choose from our range of shipping services based on your delivery timeline and budget requirements:</p>
      <ul>
        <li><strong>Standard:</strong> 3-5 business days, most economical</li>
        <li><strong>Express:</strong> 1-2 business days, moderate cost</li>
        <li><strong>Overnight:</strong> Next business day, premium service</li>
        <li><strong>Saturday Delivery:</strong> Available for express and overnight</li>
      </ul>
      
      <h3>Step 5: Review and Confirm</h3>
      <p>Review all information carefully before confirming your shipment:</p>
      <ul>
        <li>Double-check recipient address</li>
        <li>Verify package dimensions and weight</li>
        <li>Confirm shipping service selection</li>
        <li>Review total cost including insurance</li>
      </ul>
      <p>Once confirmed, you can purchase your shipping label and print it immediately.</p>
      
      <h3>Best Practices</h3>
      <ul>
        <li>Save frequent recipients as contacts for faster future shipments</li>
        <li>Use accurate package dimensions to avoid re-rating fees</li>
        <li>Consider insurance for valuable items</li>
        <li>Schedule pickups during business hours for best service</li>
      </ul>
    `,
    excerpt: 'Learn everything you need to know about creating and managing shipments on our platform, from basic setup to advanced features and best practices.',
    category: 'shipments',
    difficulty: 'beginner',
    tags: ['shipments', 'creation', 'guide', 'best-practices'],
    author: 'Support Team',
    publishedDate: '2025-01-01T00:00:00Z',
    lastUpdated: '2025-01-15T10:30:00Z',
    readTime: 8,
    helpfulCount: 89,
    bookmarked: false,
    relatedArticles: ['article-002', 'article-003'],
    videoTutorial: 'video-001'
  },
  {
    id: 'article-002',
    title: 'Packaging Best Practices for Safe Delivery',
    content: `
      <h2>Why Proper Packaging Matters</h2>
      <p>Proper packaging is crucial for ensuring your shipments arrive safely and in perfect condition. Poor packaging can lead to damaged goods, unhappy customers, and increased costs from claims and returns.</p>
      
      <h3>Essential Packaging Materials</h3>
      <ul>
        <li><strong>Sturdy cardboard boxes:</strong> New or in excellent condition</li>
        <li><strong>Bubble wrap:</strong> For fragile items and cushioning</li>
        <li><strong>Packing peanuts:</strong> Lightweight void fill material</li>
        <li><strong>Strong packing tape:</strong> 2-3 inch width recommended</li>
        <li><strong>Corner protectors:</strong> For fragile items and electronics</li>
        <li><strong>Void fill material:</strong> Newspaper, tissue paper, or air pillows</li>
      </ul>
      
      <h3>Packaging Guidelines</h3>
      <p>Always use a box that\'s slightly larger than your item to allow for adequate cushioning. The general rule is 2-3 inches of cushioning on all sides.</p>
      
      <h4>For Fragile Items:</h4>
      <ul>
        <li>Wrap each item individually in bubble wrap</li>
        <li>Use corner protectors for sharp edges</li>
        <li>Fill all empty spaces with cushioning material</li>
        <li>Mark the package as "Fragile" on all sides</li>
      </ul>
      
      <h4>For Electronics:</h4>
      <ul>
        <li>Use anti-static bubble wrap</li>
        <li>Remove batteries if possible</li>
        <li>Use original packaging when available</li>
        <li>Include all cables and accessories</li>
      </ul>
      
      <h3>Testing Your Package</h3>
      <p>Before sealing your package, test its durability:</p>
      <ul>
        <li>Gently shake the package - items should not move</li>
        <li>Press on the sides - the box should not collapse</li>
        <li>Ensure the package can withstand a 3-4 foot drop</li>
      </ul>
      
      <h3>Common Packaging Mistakes to Avoid</h3>
      <ul>
        <li>Using damaged or weak boxes</li>
        <li>Insufficient cushioning material</li>
        <li>Over-packing (too heavy for box strength)</li>
        <li>Poor tape application</li>
        <li>Inadequate labeling</li>
      </ul>
    `,
    excerpt: 'Master the art of packaging to ensure your shipments arrive safely and protect your valuable items during transit. Learn essential techniques and avoid common mistakes.',
    category: 'shipments',
    difficulty: 'beginner',
    tags: ['packaging', 'safety', 'best-practices', 'fragile-items'],
    author: 'Logistics Team',
    publishedDate: '2025-01-02T00:00:00Z',
    lastUpdated: '2025-01-14T15:20:00Z',
    readTime: 6,
    helpfulCount: 67,
    bookmarked: false,
    relatedArticles: ['article-001', 'article-003'],
    videoTutorial: 'video-002'
  },
  {
    id: 'article-003',
    title: 'Understanding Shipment Tracking and Status Updates',
    content: `
      <h2>How Tracking Works</h2>
      <p>Our advanced tracking system provides real-time updates on your shipments from pickup to delivery. Understanding the different status updates helps you manage customer expectations and plan your business operations.</p>
      
      <h3>Tracking Status Types</h3>
      
      <h4>Pre-Shipment Statuses:</h4>
      <ul>
        <li><strong>Label Created:</strong> Shipping label has been generated</li>
        <li><strong>Pending Pickup:</strong> Package ready for courier pickup</li>
        <li><strong>Pickup Scheduled:</strong> Pickup time confirmed</li>
      </ul>
      
      <h4>In-Transit Statuses:</h4>
      <ul>
        <li><strong>Picked Up:</strong> Package collected by courier</li>
        <li><strong>In Transit:</strong> Package moving through network</li>
        <li><strong>Out for Delivery:</strong> Package on final delivery vehicle</li>
        <li><strong>Delivery Attempted:</strong> Delivery attempted but recipient not available</li>
      </ul>
      
      <h4>Final Statuses:</h4>
      <ul>
        <li><strong>Delivered:</strong> Package successfully delivered</li>
        <li><strong>Failed Delivery:</strong> Delivery could not be completed</li>
        <li><strong>Returned to Sender:</strong> Package returned due to delivery failure</li>
      </ul>
      
      <h3>Understanding Delivery Times</h3>
      <p>Delivery times vary based on:</p>
      <ul>
        <li>Shipping service selected</li>
        <li>Origin and destination locations</li>
        <li>Weather conditions and holidays</li>
        <li>Package size and weight</li>
      </ul>
      
      <h3>Real-Time Updates</h3>
      <p>Our system provides updates through:</p>
      <ul>
        <li>Email notifications for major status changes</li>
        <li>SMS alerts for critical updates (optional)</li>
        <li>Dashboard notifications</li>
        <li>Mobile app push notifications</li>
      </ul>
      
      <h3>Troubleshooting Common Issues</h3>
      
      <h4>Package Not Moving:</h4>
      <ul>
        <li>Check if pickup was completed</li>
        <li>Verify package wasn\'t held for inspection</li>
        <li>Contact support if no movement for 24+ hours</li>
      </ul>
      
      <h4>Delivery Delays:</h4>
      <ul>
        <li>Weather-related delays are common</li>
        <li>Holiday periods may extend delivery times</li>
        <li>Remote locations may have longer transit times</li>
      </ul>
    `,
    excerpt: 'Learn how to interpret tracking updates, understand delivery timelines, and troubleshoot common tracking issues to keep your customers informed.',
    category: 'shipments',
    difficulty: 'intermediate',
    tags: ['tracking', 'status-updates', 'delivery-times', 'troubleshooting'],
    author: 'Customer Success Team',
    publishedDate: '2025-01-03T00:00:00Z',
    lastUpdated: '2025-01-13T09:15:00Z',
    readTime: 7,
    helpfulCount: 78,
    bookmarked: false,
    relatedArticles: ['article-001', 'article-004'],
    videoTutorial: 'video-003'
  }
];

// Comprehensive Video Tutorials Data
// Note: Video tutorials are coming soon
export const mockVideoTutorials: VideoTutorial[] = [];

// Help Categories Data
export const helpCategories: HelpCategory[] = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'New to our platform? Start here with the basics.',
    icon: 'help-circle',
    color: 'bg-blue-500',
    count: 12
  },
  {
    id: 'shipments',
    name: 'Shipment Management',
    description: 'Everything you need to know about creating and managing shipments.',
    icon: 'package',
    color: 'bg-green-500',
    count: 25
  },
  {
    id: 'account',
    name: 'Account & Billing',
    description: 'Manage your profile, billing, and account settings.',
    icon: 'user',
    color: 'bg-purple-500',
    count: 18
  },
  {
    id: 'technical',
    name: 'Technical Support',
    description: 'Technical issues, integrations, and troubleshooting.',
    icon: 'settings',
    color: 'bg-orange-500',
    count: 15
  },
  {
    id: 'business',
    name: 'Business Operations',
    description: 'Analytics, reporting, and business optimization.',
    icon: 'bar-chart-3',
    color: 'bg-indigo-500',
    count: 20
  }
];

// Search and Filter Functions
export const searchContent = (query: string, category?: FAQCategory) => {
  const searchTerm = query.toLowerCase();
  
  const faqResults = mockFAQs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm) ||
                         faq.answer.toLowerCase().includes(searchTerm) ||
                         faq.tags.some(tag => tag.toLowerCase().includes(searchTerm));
    const matchesCategory = !category || faq.category === category;
    return matchesSearch && matchesCategory;
  });

  const articleResults = mockHelpArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm) ||
                         article.excerpt.toLowerCase().includes(searchTerm) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm));
    const matchesCategory = !category || article.category === category;
    return matchesSearch && matchesCategory;
  });

  const videoResults = mockVideoTutorials.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm) ||
                         video.description.toLowerCase().includes(searchTerm) ||
                         video.tags.some(tag => tag.toLowerCase().includes(searchTerm));
    const matchesCategory = !category || video.category === category;
    return matchesSearch && matchesCategory;
  });

  return {
    faqs: faqResults,
    articles: articleResults,
    videos: videoResults,
    total: faqResults.length + articleResults.length + videoResults.length
  };
};

export const getRelatedContent = (contentId: string, contentType: 'faq' | 'article' | 'video') => {
  let relatedIds: string[] = [];
  
  if (contentType === 'faq') {
    const faq = mockFAQs.find(f => f.id === contentId);
    if (faq) {
      relatedIds = [...(faq.relatedArticles || []), ...(faq.videoTutorial ? [faq.videoTutorial] : [])];
    }
  } else if (contentType === 'article') {
    const article = mockHelpArticles.find(a => a.id === contentId);
    if (article) {
      relatedIds = [...article.relatedArticles, ...(article.videoTutorial ? [article.videoTutorial] : [])];
    }
  } else if (contentType === 'video') {
    const video = mockVideoTutorials.find(v => v.id === contentId);
    if (video) {
      relatedIds = video.relatedContent;
    }
  }

  return {
    faqs: mockFAQs.filter(f => relatedIds.includes(f.id)),
    articles: mockHelpArticles.filter(a => relatedIds.includes(a.id)),
    videos: mockVideoTutorials.filter(v => relatedIds.includes(v.id))
  };
};
