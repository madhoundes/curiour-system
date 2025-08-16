export type ShipmentStatus =
  | "LABEL_CREATED"
  | "SCANNED"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "FAILED";

export type Shipment = {
  id: string;
  trackingNumber: string;
  orderNumber?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  service: "Standard" | "Express" | "Same Day";
  courier: "Ashraf" | "DHL" | "FedEx" | "UPS";
  weightKg: number;
  cost: number;
  recipient: {
    name: string;
    email?: string;
    phone?: string;
    address1: string;
    address2?: string;
    city: string;
    province?: string;
    postalCode: string;
    country: string;
  };
  originCountry: string;
  destinationRegion?: "Domestic" | "International";
  status: ShipmentStatus;
  tags?: string[];
  notes?: string;
  labelUrl?: string;
  invoiceUrl?: string;
};

type Random = () => number;

const createSeededRandom = (seed: number): Random => {
  // xorshift32
  let s = seed >>> 0;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 10000) / 10000;
  };
};

const services: Array<Shipment["service"]> = ["Standard"];
const couriers: Array<Shipment["courier"]> = ["Ashraf", "DHL", "FedEx", "UPS"];

const cities = [
  { city: "Toronto", province: "ON" },
  { city: "Vancouver", province: "BC" },
  { city: "Montreal", province: "QC" },
  { city: "Calgary", province: "AB" },
  { city: "Edmonton", province: "AB" },
  { city: "Ottawa", province: "ON" },
  { city: "Winnipeg", province: "MB" },
  { city: "Quebec City", province: "QC" },
];

const names = [
  "John Smith",
  "Emma Johnson",
  "Liam Williams",
  "Olivia Brown",
  "Noah Jones",
  "Ava Garcia",
  "Isabella Miller",
  "Mason Davis",
  "Mia Rodriguez",
  "Ethan Martinez",
];

export const generateMockShipments = (count = 120, seed = 20250811): Shipment[] => {
  const rand = createSeededRandom(seed);
  const shipments: Shipment[] = [];
  const now = new Date();

  for (let i = 0; i < count; i += 1) {
    const dayOffset = Math.floor(rand() * 90);
    const created = new Date(now);
    created.setDate(now.getDate() - dayOffset);
    const updated = new Date(created);
    updated.setHours(created.getHours() + Math.floor(rand() * 72));

    // Weighted status: Delivered most frequent
    const r = rand();
    const status: ShipmentStatus =
      r < 0.45
        ? "DELIVERED"
        : r < 0.65
          ? "IN_TRANSIT"
          : r < 0.78
            ? "OUT_FOR_DELIVERY"
            : r < 0.88
              ? "SCANNED"
              : r < 0.97
                ? "LABEL_CREATED"
                : "FAILED";

    const service = services[Math.floor(rand() * services.length)];
    const courier = couriers[Math.floor(rand() * couriers.length)];
    const city = cities[Math.floor(rand() * cities.length)];
    const name = names[Math.floor(rand() * names.length)];
    const id = `ASH-2025-${String(i + 1).padStart(6, "0")}`;
    const trackingNumber = `ASH-TRK-${Math.floor(rand() * 1_000_000).toString(36).toUpperCase()}${
      Math.floor(rand() * 1_000).toString(36).toUpperCase()
    }`;
    const weightKg = parseFloat((0.2 + rand() * 15).toFixed(2));
    const cost = parseFloat((5 + rand() * 95).toFixed(2));
    const domestic = rand() > 0.2;

    shipments.push({
      id,
      trackingNumber,
      orderNumber: rand() > 0.5 ? `ORD-${1000 + i}` : undefined,
      createdAt: created.toISOString(),
      updatedAt: updated.toISOString(),
      service,
      courier,
      weightKg,
      cost,
      recipient: {
        name,
        address1: `${Math.floor(rand() * 9999)} Main St`,
        city: city.city,
        province: city.province,
        postalCode: `${String.fromCharCode(65 + Math.floor(rand() * 26))}${Math.floor(rand() * 10)}${String.fromCharCode(65 + Math.floor(rand() * 26))} ${Math.floor(rand() * 10)}${String.fromCharCode(65 + Math.floor(rand() * 26))}${Math.floor(rand() * 10)}`,
        country: domestic ? "USA" : "Canada",
      },
      originCountry: "Canada",
      destinationRegion: domestic ? "Domestic" : "International",
      status,
      tags: rand() > 0.7 ? ["fragile"] : undefined,
      notes: rand() > 0.85 ? "Leave at front desk" : undefined,
      labelUrl: `/label/preview?tracking=${encodeURIComponent(trackingNumber)}`,
      invoiceUrl: "/invoice/mock.pdf",
    });
  }

  return shipments;
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
};


