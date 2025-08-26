export type Status = 'pending' | 'in_progress' | 'resolved';

export interface Recipient {
  name: string;
  address: string;
  company?: string;
  contact: {
    phone: string;
    email: string;
  };
}

export interface Sender {
  name: string;
  address: string;
  company?: string;
  contact: {
    phone: string;
    email: string;
  };
}

export interface PackageDetails {
  type: string;
  weight: number;
  weightUnit: 'kg' | 'lbs';
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'in';
  };
  fragile: boolean;
  valuable: boolean;
  insurance: boolean;
  insuranceAmount?: number;
}

export interface UndeliverablePackage {
  id: string;
  trackingNumber: string;
  sender: Sender;
  recipient: Recipient;
  packageDetails: PackageDetails;
  issueType: string;
  issueDescription: string;
  priority: 'high' | 'medium' | 'low';
  status: Status;
  notes?: string;
  reportedBy: string;
  reportedAt: string;
  createdAt: string;
  updatedAt: string;
  estimatedResolution?: string;
  courierNotes?: string;
  customerContactAttempts?: number;
  lastContactAttempt?: string;
}

export const mockUndeliverablePackages: UndeliverablePackage[] = [
  {
    id: "undel-001",
    trackingNumber: "ASH-20250101-ABC123",
    sender: {
      name: "TechCorp Solutions",
      address: "123 Business Ave, Toronto, ON M5V 2H1",
      company: "TechCorp Solutions Inc.",
      contact: {
        phone: "+1 (416) 555-0101",
        email: "shipping@techcorp.com"
      }
    },
    recipient: {
      name: "John Smith",
      address: "456 Residential St, Vancouver, BC V6B 1A1",
      contact: {
        phone: "+1 (604) 555-0202",
        email: "john.smith@email.com"
      }
    },
    packageDetails: {
      type: "Electronics",
      weight: 2.5,
      weightUnit: "kg",
      dimensions: {
        length: 30,
        width: 20,
        height: 15,
        unit: "cm"
      },
      fragile: true,
      valuable: true,
      insurance: true,
      insuranceAmount: 500
    },
    issueType: "Address Not Found",
    issueDescription: "The delivery address provided does not exist. The street number 456 is not found on Residential St.",
    priority: "high",
    status: "pending",
    notes: "Customer needs to provide correct address. Package contains expensive electronics.",
    reportedBy: "Courier - Mike Johnson",
    reportedAt: "2025-01-15T10:30:00Z",
    createdAt: "2025-01-10T08:00:00Z",
    updatedAt: "2025-01-15T10:30:00Z",
    estimatedResolution: "2025-01-20",
    courierNotes: "Attempted delivery at 10:30 AM. No such address exists.",
    customerContactAttempts: 2,
    lastContactAttempt: "2025-01-15T14:00:00Z"
  },
  {
    id: "undel-002",
    trackingNumber: "ASH-20250102-DEF456",
    sender: {
      name: "Fashion Forward",
      address: "789 Retail Blvd, Montreal, QC H2Y 1C6",
      company: "Fashion Forward Ltd.",
      contact: {
        phone: "+1 (514) 555-0303",
        email: "orders@fashionforward.ca"
      }
    },
    recipient: {
      name: "Sarah Wilson",
      address: "321 Apartment 5B, Calgary, AB T2P 1J9",
      contact: {
        phone: "+1 (403) 555-0404",
        email: "sarah.wilson@email.com"
      }
    },
    packageDetails: {
      type: "Clothing",
      weight: 1.2,
      weightUnit: "kg",
      dimensions: {
        length: 25,
        width: 18,
        height: 8,
        unit: "cm"
      },
      fragile: false,
      valuable: false,
      insurance: false
    },
    issueType: "No Access to Building",
    issueDescription: "Courier cannot access the apartment building. No buzzer code provided and no one available to let them in.",
    priority: "medium",
    status: "in_progress",
    notes: "Customer provided incorrect buzzer code. Need to contact for correct access information.",
    reportedBy: "Courier - Lisa Chen",
    reportedAt: "2025-01-14T15:45:00Z",
    createdAt: "2025-01-11T09:30:00Z",
    updatedAt: "2025-01-14T16:00:00Z",
    estimatedResolution: "2025-01-17",
    courierNotes: "Building access denied. No response from customer phone number.",
    customerContactAttempts: 3,
    lastContactAttempt: "2025-01-14T16:00:00Z"
  },
  {
    id: "undel-003",
    trackingNumber: "ASH-20250103-GHI789",
    sender: {
      name: "Book Haven",
      address: "456 Literary Lane, Ottawa, ON K1P 1A1",
      company: "Book Haven Inc.",
      contact: {
        phone: "+1 (613) 555-0505",
        email: "orders@bookhaven.ca"
      }
    },
    recipient: {
      name: "Michael Brown",
      address: "789 Rural Route 2, Halifax, NS B3H 1A1",
      contact: {
        phone: "+1 (902) 555-0606",
        email: "michael.brown@email.com"
      }
    },
    packageDetails: {
      type: "Books",
      weight: 3.8,
      weightUnit: "kg",
      dimensions: {
        length: 35,
        width: 25,
        height: 12,
        unit: "cm"
      },
      fragile: false,
      valuable: false,
      insurance: false
    },
    issueType: "Weather Delay",
    issueDescription: "Severe snowstorm in Halifax area preventing delivery. Roads are impassable and delivery vehicle cannot reach the destination.",
    priority: "low",
    status: "in_progress",
    notes: "Weather conditions improving. Expected to attempt delivery tomorrow.",
    reportedBy: "Courier - David Thompson",
    reportedAt: "2025-01-13T12:00:00Z",
    createdAt: "2025-01-12T10:15:00Z",
    updatedAt: "2025-01-14T09:00:00Z",
    estimatedResolution: "2025-01-16",
    courierNotes: "Heavy snowfall. Vehicle stuck in snow. Will retry when conditions improve.",
    customerContactAttempts: 1,
    lastContactAttempt: "2025-01-13T12:00:00Z"
  },
  {
    id: "undel-004",
    trackingNumber: "ASH-20250104-JKL012",
    sender: {
      name: "Artisan Crafts",
      address: "123 Creative St, Victoria, BC V8V 1A1",
      company: "Artisan Crafts Co.",
      contact: {
        phone: "+1 (250) 555-0707",
        email: "shipping@artisancrafts.ca"
      }
    },
    recipient: {
      name: "Emma Davis",
      address: "567 Business Center, Edmonton, AB T5J 0R2",
      company: "Design Studio Edmonton",
      contact: {
        phone: "+1 (780) 555-0808",
        email: "emma.davis@designstudio.ca"
      }
    },
    packageDetails: {
      type: "Artwork",
      weight: 8.5,
      weightUnit: "kg",
      dimensions: {
        length: 80,
        width: 60,
        height: 10,
        unit: "cm"
      },
      fragile: true,
      valuable: true,
      insurance: true,
      insuranceAmount: 2000
    },
    issueType: "Recipient Unavailable",
    issueDescription: "Recipient is out of office and cannot receive the package. No one else authorized to sign for this valuable artwork.",
    priority: "high",
    status: "pending",
    notes: "Package contains valuable artwork. Need to coordinate delivery time with recipient.",
    reportedBy: "Courier - Amanda Rodriguez",
    reportedAt: "2025-01-15T11:15:00Z",
    createdAt: "2025-01-13T14:20:00Z",
    updatedAt: "2025-01-15T11:15:00Z",
    estimatedResolution: "2025-01-18",
    courierNotes: "Recipient on business trip until Friday. No one else can sign for artwork.",
    customerContactAttempts: 1,
    lastContactAttempt: "2025-01-15T11:15:00Z"
  },
  {
    id: "undel-005",
    trackingNumber: "ASH-20250105-MNO345",
    sender: {
      name: "Health Supplies Plus",
      address: "890 Medical Dr, Winnipeg, MB R3C 0A8",
      company: "Health Supplies Plus Ltd.",
      contact: {
        phone: "+1 (204) 555-0909",
        email: "orders@healthsupplies.ca"
      }
    },
    recipient: {
      name: "Dr. Robert Johnson",
      address: "234 Medical Center Blvd, Regina, SK S4P 3A2",
      company: "Regina Medical Center",
      contact: {
        phone: "+1 (306) 555-1010",
        email: "dr.johnson@reginamedical.ca"
      }
    },
    packageDetails: {
      type: "Medical Supplies",
      weight: 15.2,
      weightUnit: "kg",
      dimensions: {
        length: 50,
        width: 40,
        height: 30,
        unit: "cm"
      },
      fragile: false,
      valuable: false,
      insurance: false
    },
    issueType: "Business Hours",
    issueDescription: "Package arrived after business hours. Medical center is closed and no one available to receive the medical supplies.",
    priority: "medium",
    status: "resolved",
    notes: "Delivered successfully on next business day during regular hours.",
    reportedBy: "Courier - James Wilson",
    reportedAt: "2025-01-14T18:30:00Z",
    createdAt: "2025-01-14T08:00:00Z",
    updatedAt: "2025-01-15T09:00:00Z",
    estimatedResolution: "2025-01-15",
    courierNotes: "Medical center closed at 5 PM. Package contains time-sensitive supplies.",
    customerContactAttempts: 2,
    lastContactAttempt: "2025-01-14T18:30:00Z"
  },
  {
    id: "undel-006",
    trackingNumber: "ASH-20250106-PQR678",
    sender: {
      name: "Gourmet Foods",
      address: "345 Culinary Way, Quebec City, QC G1R 1A1",
      company: "Gourmet Foods Quebec",
      contact: {
        phone: "+1 (418) 555-1111",
        email: "orders@gourmetfoods.qc.ca"
      }
    },
    recipient: {
      name: "Chef Marie LeBlanc",
      address: "678 Restaurant Row, St. John's, NL A1C 1A1",
      company: "Le Petit Bistro",
      contact: {
        phone: "+1 (709) 555-1212",
        email: "chef.marie@lepetitbistro.ca"
      }
    },
    packageDetails: {
      type: "Perishable Food",
      weight: 5.0,
      weightUnit: "kg",
      dimensions: {
        length: 40,
        width: 30,
        height: 20,
        unit: "cm"
      },
      fragile: true,
      valuable: false,
      insurance: false
    },
    issueType: "Temperature Control",
    issueDescription: "Package requires refrigeration but recipient's location does not have proper cold storage facilities. Food items may spoil.",
    priority: "high",
    status: "pending",
    notes: "Perishable food items. Need to coordinate immediate pickup or arrange cold storage.",
    reportedBy: "Courier - Pierre Dubois",
    reportedAt: "2025-01-15T13:45:00Z",
    createdAt: "2025-01-15T06:00:00Z",
    updatedAt: "2025-01-15T13:45:00Z",
    estimatedResolution: "2025-01-15",
    courierNotes: "Food package needs immediate attention. No refrigeration available at destination.",
    customerContactAttempts: 3,
    lastContactAttempt: "2025-01-15T13:45:00Z"
  },
  {
    id: "undel-007",
    trackingNumber: "ASH-20250107-STU901",
    sender: {
      name: "Tech Gadgets",
      address: "567 Innovation Ave, Mississauga, ON L5B 1A1",
      company: "Tech Gadgets Inc.",
      contact: {
        phone: "+1 (905) 555-1313",
        email: "shipping@techgadgets.ca"
      }
    },
    recipient: {
      name: "Alex Chen",
      address: "123 University Campus, Kingston, ON K7L 1A1",
      contact: {
        phone: "+1 (613) 555-1414",
        email: "alex.chen@queensu.ca"
      }
    },
    packageDetails: {
      type: "Electronics",
      weight: 1.8,
      weightUnit: "kg",
      dimensions: {
        length: 25,
        width: 20,
        height: 8,
        unit: "cm"
      },
      fragile: true,
      valuable: true,
      insurance: true,
      insuranceAmount: 800
    },
    issueType: "Campus Delivery",
    issueDescription: "Package cannot be delivered to university campus address. Need specific building and room number for delivery.",
    priority: "medium",
    status: "in_progress",
    notes: "Student needs to provide specific campus location details.",
    reportedBy: "Courier - Jennifer Park",
    reportedAt: "2025-01-14T16:20:00Z",
    createdAt: "2025-01-14T09:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
    estimatedResolution: "2025-01-16",
    courierNotes: "Campus address too vague. Need building and room number.",
    customerContactAttempts: 2,
    lastContactAttempt: "2025-01-15T10:00:00Z"
  },
  {
    id: "undel-008",
    trackingNumber: "ASH-20250108-VWX234",
    sender: {
      name: "Home Decor Plus",
      address: "789 Design Blvd, Burnaby, BC V5H 1A1",
      company: "Home Decor Plus Ltd.",
      contact: {
        phone: "+1 (604) 555-1515",
        email: "orders@homedecorplus.ca"
      }
    },
    recipient: {
      name: "Lisa Anderson",
      address: "456 Suburban Court, Saskatoon, SK S7H 1A1",
      contact: {
        phone: "+1 (306) 555-1616",
        email: "lisa.anderson@email.com"
      }
    },
    packageDetails: {
      type: "Home Decor",
      weight: 12.5,
      weightUnit: "kg",
      dimensions: {
        length: 60,
        width: 45,
        height: 25,
        unit: "cm"
      },
      fragile: true,
      valuable: false,
      insurance: false
    },
    issueType: "Damaged Package",
    issueDescription: "Package appears to be damaged during transit. Contents may be broken or compromised.",
    priority: "high",
    status: "resolved",
    notes: "Package inspected and contents verified as intact. Minor external damage only.",
    reportedBy: "Courier - Mark Thompson",
    reportedAt: "2025-01-13T14:30:00Z",
    createdAt: "2025-01-12T11:00:00Z",
    updatedAt: "2025-01-14T15:00:00Z",
    estimatedResolution: "2025-01-14",
    courierNotes: "External package damage visible. Contents appear intact upon inspection.",
    customerContactAttempts: 1,
    lastContactAttempt: "2025-01-13T14:30:00Z"
  }
];
