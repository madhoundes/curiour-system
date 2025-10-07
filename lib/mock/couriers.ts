// Courier Mock Data Types and Functions

export type CourierStatus = "active" | "inactive" | "suspended" | "pending_verification" | "background_check" | "onboarding";

export type VehicleType = "car" | "van" | "truck" | "motorcycle" | "bicycle";

export type ServiceRadius = "10km" | "25km" | "50km" | "100km";

export type AvailabilityDay = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export type ShiftPreference = "morning" | "afternoon" | "evening" | "night";

export type ExperienceLevel = "none" | "less_than_1_year" | "1_to_3_years" | "3_to_5_years" | "5_plus_years";

export interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
}

export interface Courier {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  username: string;
  city: string;
  province: string;
  postalCode: string;
  serviceRadius: ServiceRadius;
  vehicleType: VehicleType;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  licensePlate: string;
  availability: AvailabilityDay[];
  preferredShifts: ShiftPreference[];
  maxPackagesPerDay: number;
  experience: ExperienceLevel;
  emergencyContact: EmergencyContact;
  status: CourierStatus;
  rating: number;
  totalDeliveries: number;
  totalEarnings: number;
  joinedDate: string; // ISO string
  lastActive: string; // ISO string
  notes?: string;
  // Additional fields for admin management
  verificationStatus: {
    backgroundCheck: "pending" | "approved" | "rejected";
    insurance: "pending" | "approved" | "rejected";
    vehicle: "pending" | "approved" | "rejected";
    documents: "pending" | "approved" | "rejected";
  };
  performance: {
    onTimeDelivery: number; // percentage
    customerRating: number; // average rating
    completionRate: number; // percentage
    responseTime: number; // average minutes
  };
  earnings: {
    totalEarnings: number;
    thisMonth: number;
    lastMonth: number;
    averagePerDelivery: number;
  };
  documents: Array<{
    id: string;
    type: "license" | "insurance" | "background_check" | "vehicle_registration" | "other";
    name: string;
    url: string;
    uploadedAt: string;
    status: "pending" | "approved" | "rejected";
  }>;
}

// Mock data for existing couriers
export const mockCouriers: Courier[] = [
  {
    id: "C001",
    fullName: "Sarah Johnson",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1 (416) 555-0123",
    username: "sarahj_courier",
    city: "Toronto",
    province: "Ontario",
    postalCode: "M5V 3A8",
    serviceRadius: "25km",
    vehicleType: "car",
    vehicleMake: "Toyota",
    vehicleModel: "Camry",
    vehicleYear: "2019",
    licensePlate: "ABC123",
    availability: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    preferredShifts: ["morning", "afternoon"],
    maxPackagesPerDay: 25,
    experience: "3_to_5_years",
    emergencyContact: {
      name: "Mike Johnson",
      phone: "+1 (416) 555-0124",
      relation: "Spouse"
    },
    status: "active",
    rating: 4.8,
    totalDeliveries: 1247,
    totalEarnings: 18475.50,
    joinedDate: "2023-01-15T10:30:00Z",
    lastActive: "2025-01-21T16:45:00Z",
    notes: "Excellent courier, very reliable. Always on time.",
    verificationStatus: {
      backgroundCheck: "approved",
      insurance: "approved",
      vehicle: "approved",
      documents: "approved"
    },
    performance: {
      onTimeDelivery: 96.5,
      customerRating: 4.8,
      completionRate: 98.2,
      responseTime: 12.5
    },
    earnings: {
      totalEarnings: 18475.50,
      thisMonth: 2847.25,
      lastMonth: 3156.80,
      averagePerDelivery: 14.82
    },
    documents: [
      {
        id: "doc_001",
        type: "license",
        name: "Driver License",
        url: "/documents/c001_license.pdf",
        uploadedAt: "2023-01-15T10:30:00Z",
        status: "approved"
      },
      {
        id: "doc_002",
        type: "insurance",
        name: "Vehicle Insurance",
        url: "/documents/c001_insurance.pdf",
        uploadedAt: "2023-01-15T10:35:00Z",
        status: "approved"
      }
    ]
  },
  {
    id: "C002",
    fullName: "Alex Rodriguez",
    firstName: "Alex",
    lastName: "Rodriguez",
    email: "alex.rodriguez@email.com",
    phone: "+1 (604) 555-0234",
    username: "alexr_delivery",
    city: "Vancouver",
    province: "British Columbia",
    postalCode: "V6B 1A1",
    serviceRadius: "50km",
    vehicleType: "van",
    vehicleMake: "Ford",
    vehicleModel: "Transit",
    vehicleYear: "2021",
    licensePlate: "XYZ789",
    availability: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
    preferredShifts: ["morning", "afternoon", "evening"],
    maxPackagesPerDay: 40,
    experience: "5_plus_years",
    emergencyContact: {
      name: "Maria Rodriguez",
      phone: "+1 (604) 555-0235",
      relation: "Mother"
    },
    status: "active",
    rating: 4.9,
    totalDeliveries: 2156,
    totalEarnings: 32456.75,
    joinedDate: "2022-03-10T14:20:00Z",
    lastActive: "2025-01-21T18:30:00Z",
    notes: "Top performer, handles large packages well.",
    verificationStatus: {
      backgroundCheck: "approved",
      insurance: "approved",
      vehicle: "approved",
      documents: "approved"
    },
    performance: {
      onTimeDelivery: 98.1,
      customerRating: 4.9,
      completionRate: 99.1,
      responseTime: 8.7
    },
    earnings: {
      totalEarnings: 32456.75,
      thisMonth: 4567.90,
      lastMonth: 4234.60,
      averagePerDelivery: 15.06
    },
    documents: [
      {
        id: "doc_003",
        type: "license",
        name: "Commercial Driver License",
        url: "/documents/c002_license.pdf",
        uploadedAt: "2022-03-10T14:20:00Z",
        status: "approved"
      },
      {
        id: "doc_004",
        type: "vehicle_registration",
        name: "Vehicle Registration",
        url: "/documents/c002_registration.pdf",
        uploadedAt: "2022-03-10T14:25:00Z",
        status: "approved"
      }
    ]
  },
  {
    id: "C003",
    fullName: "Emma Thompson",
    firstName: "Emma",
    lastName: "Thompson",
    email: "emma.thompson@email.com",
    phone: "+1 (514) 555-0345",
    username: "emmat_delivery",
    city: "Montreal",
    province: "Quebec",
    postalCode: "H3B 2Y7",
    serviceRadius: "10km",
    vehicleType: "bicycle",
    vehicleMake: "Specialized",
    vehicleModel: "Sirrus",
    vehicleYear: "2023",
    licensePlate: "N/A",
    availability: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    preferredShifts: ["morning", "afternoon"],
    maxPackagesPerDay: 15,
    experience: "1_to_3_years",
    emergencyContact: {
      name: "James Thompson",
      phone: "+1 (514) 555-0346",
      relation: "Father"
    },
    status: "active",
    rating: 4.7,
    totalDeliveries: 567,
    totalEarnings: 8456.25,
    joinedDate: "2024-06-01T09:15:00Z",
    lastActive: "2025-01-21T17:20:00Z",
    notes: "Great for downtown deliveries, eco-friendly approach.",
    verificationStatus: {
      backgroundCheck: "approved",
      insurance: "approved",
      vehicle: "approved",
      documents: "approved"
    },
    performance: {
      onTimeDelivery: 94.8,
      customerRating: 4.7,
      completionRate: 96.5,
      responseTime: 15.2
    },
    earnings: {
      totalEarnings: 8456.25,
      thisMonth: 1234.50,
      lastMonth: 1187.30,
      averagePerDelivery: 14.91
    },
    documents: [
      {
        id: "doc_005",
        type: "license",
        name: "Driver License",
        url: "/documents/c003_license.pdf",
        uploadedAt: "2024-06-01T09:15:00Z",
        status: "approved"
      }
    ]
  },
  {
    id: "C004",
    fullName: "Michael Chen",
    firstName: "Michael",
    lastName: "Chen",
    email: "michael.chen@email.com",
    phone: "+1 (403) 555-0456",
    username: "michaelc_courier",
    city: "Calgary",
    province: "Alberta",
    postalCode: "T2P 1J9",
    serviceRadius: "100km",
    vehicleType: "truck",
    vehicleMake: "Chevrolet",
    vehicleModel: "Silverado",
    vehicleYear: "2020",
    licensePlate: "DEF456",
    availability: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    preferredShifts: ["morning", "afternoon", "evening"],
    maxPackagesPerDay: 60,
    experience: "3_to_5_years",
    emergencyContact: {
      name: "Lisa Chen",
      phone: "+1 (403) 555-0457",
      relation: "Wife"
    },
    status: "suspended",
    rating: 4.2,
    totalDeliveries: 892,
    totalEarnings: 15678.90,
    joinedDate: "2023-08-20T11:45:00Z",
    lastActive: "2025-01-18T14:30:00Z",
    notes: "Currently suspended due to vehicle maintenance issues.",
    verificationStatus: {
      backgroundCheck: "approved",
      insurance: "pending",
      vehicle: "rejected",
      documents: "approved"
    },
    performance: {
      onTimeDelivery: 89.5,
      customerRating: 4.2,
      completionRate: 91.8,
      responseTime: 18.3
    },
    earnings: {
      totalEarnings: 15678.90,
      thisMonth: 0,
      lastMonth: 2345.60,
      averagePerDelivery: 17.58
    },
    documents: [
      {
        id: "doc_006",
        type: "vehicle_registration",
        name: "Vehicle Registration",
        url: "/documents/c004_registration.pdf",
        uploadedAt: "2023-08-20T11:45:00Z",
        status: "rejected"
      }
    ]
  },
  {
    id: "C005",
    fullName: "Jessica Martinez",
    firstName: "Jessica",
    lastName: "Martinez",
    email: "jessica.martinez@email.com",
    phone: "+1 (902) 555-0567",
    username: "jessicam_delivery",
    city: "Halifax",
    province: "Nova Scotia",
    postalCode: "B3H 2S1",
    serviceRadius: "25km",
    vehicleType: "car",
    vehicleMake: "Honda",
    vehicleModel: "Civic",
    vehicleYear: "2022",
    licensePlate: "GHI789",
    availability: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    preferredShifts: ["morning", "afternoon"],
    maxPackagesPerDay: 20,
    experience: "less_than_1_year",
    emergencyContact: {
      name: "Carlos Martinez",
      phone: "+1 (902) 555-0568",
      relation: "Brother"
    },
    status: "pending_verification",
    rating: 0,
    totalDeliveries: 0,
    totalEarnings: 0,
    joinedDate: "2025-01-20T13:30:00Z",
    lastActive: "2025-01-20T13:30:00Z",
    notes: "New courier, pending background check completion.",
    verificationStatus: {
      backgroundCheck: "pending",
      insurance: "pending",
      vehicle: "pending",
      documents: "pending"
    },
    performance: {
      onTimeDelivery: 0,
      customerRating: 0,
      completionRate: 0,
      responseTime: 0
    },
    earnings: {
      totalEarnings: 0,
      thisMonth: 0,
      lastMonth: 0,
      averagePerDelivery: 0
    },
    documents: []
  }
];

// Helper functions for courier management
export const getCourierById = (id: string): Courier | undefined => {
  return mockCouriers.find(courier => courier.id === id);
};

export const getCouriersByStatus = (status: CourierStatus): Courier[] => {
  return mockCouriers.filter(courier => courier.status === status);
};

export const getActiveCouriers = (): Courier[] => {
  return mockCouriers.filter(courier => courier.status === "active");
};

export const getCouriersByCity = (city: string): Courier[] => {
  return mockCouriers.filter(courier => 
    courier.city.toLowerCase().includes(city.toLowerCase())
  );
};

export const getCouriersByVehicleType = (vehicleType: VehicleType): Courier[] => {
  return mockCouriers.filter(courier => courier.vehicleType === vehicleType);
};

export const getTopPerformers = (limit: number = 5): Courier[] => {
  return mockCouriers
    .filter(courier => courier.status === "active")
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
};

export const getCourierStats = () => {
  const total = mockCouriers.length;
  const active = mockCouriers.filter(c => c.status === "active").length;
  const pending = mockCouriers.filter(c => c.status === "pending_verification").length;
  const suspended = mockCouriers.filter(c => c.status === "suspended").length;
  
  const totalEarnings = mockCouriers.reduce((sum, c) => sum + c.totalEarnings, 0);
  const totalDeliveries = mockCouriers.reduce((sum, c) => sum + c.totalDeliveries, 0);
  const averageRating = mockCouriers
    .filter(c => c.rating > 0)
    .reduce((sum, c, _, arr) => sum + c.rating / arr.length, 0);

  return {
    total,
    active,
    pending,
    suspended,
    totalEarnings,
    totalDeliveries,
    averageRating: Math.round(averageRating * 10) / 10
  };
};

// Mock function to simulate creating a new courier
export const createMockCourier = (courierData: Partial<Courier>): Courier => {
  const newId = `C${String(mockCouriers.length + 1).padStart(3, '0')}`;
  const now = new Date().toISOString();
  
  const newCourier: Courier = {
    id: newId,
    fullName: `${courierData.firstName || ''} ${courierData.lastName || ''}`.trim(),
    firstName: courierData.firstName || '',
    lastName: courierData.lastName || '',
    email: courierData.email || '',
    phone: courierData.phone || '',
    username: courierData.username || '',
    city: courierData.city || '',
    province: courierData.province || '',
    postalCode: courierData.postalCode || '',
    serviceRadius: courierData.serviceRadius || '25km',
    vehicleType: courierData.vehicleType || 'car',
    vehicleMake: courierData.vehicleMake || '',
    vehicleModel: courierData.vehicleModel || '',
    vehicleYear: courierData.vehicleYear || '',
    licensePlate: courierData.licensePlate || '',
    availability: courierData.availability || [],
    preferredShifts: courierData.preferredShifts || [],
    maxPackagesPerDay: courierData.maxPackagesPerDay || 20,
    experience: courierData.experience || 'none',
    emergencyContact: courierData.emergencyContact || {
      name: '',
      phone: '',
      relation: ''
    },
    status: courierData.status || 'pending_verification',
    rating: 0,
    totalDeliveries: 0,
    totalEarnings: 0,
    joinedDate: now,
    lastActive: now,
    notes: courierData.notes || '',
    verificationStatus: {
      backgroundCheck: 'pending',
      insurance: 'pending',
      vehicle: 'pending',
      documents: 'pending'
    },
    performance: {
      onTimeDelivery: 0,
      customerRating: 0,
      completionRate: 0,
      responseTime: 0
    },
    earnings: {
      totalEarnings: 0,
      thisMonth: 0,
      lastMonth: 0,
      averagePerDelivery: 0
    },
    documents: []
  };

  return newCourier;
};

// Mock function to simulate updating a courier
export const updateMockCourier = (id: string, updates: Partial<Courier>): Courier | null => {
  const index = mockCouriers.findIndex(courier => courier.id === id);
  if (index === -1) return null;

  mockCouriers[index] = {
    ...mockCouriers[index],
    ...updates,
    lastActive: new Date().toISOString()
  };

  return mockCouriers[index];
};

// Mock function to simulate deleting a courier
export const deleteMockCourier = (id: string): boolean => {
  const index = mockCouriers.findIndex(courier => courier.id === id);
  if (index === -1) return false;

  mockCouriers.splice(index, 1);
  return true;
};

export default mockCouriers;
