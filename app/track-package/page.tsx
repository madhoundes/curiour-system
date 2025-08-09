import { Suspense } from "react";
import Client from "./Client";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-500">Loading tracking…</div>}>
      <Client />
    </Suspense>
  );
}

// The previous client logic has been moved to app/track-package/track-client.tsx
// to satisfy Next.js CSR bailout requirements for useSearchParams.

type ShipmentStatus =
  | "LabelCreated"
  | "DropoffConfirmed"
  | "ReceivedAtFacility"
  | "InTransit"
  | "OutForDelivery"
  | "DeliveryAttempted"
  | "Delivered"
  | "FailedDelivery"
  | "ReturnedToSender"
  | "Cancelled";

type TrackingEvent = {
  id: string;
  timestamp: string;
  type: string;
  statusAfter: ShipmentStatus;
  location?: string;
  coordinates?: { lat: number; lng: number };
  actor: "system" | "courier" | "merchant";
  details?: string;
  attachments?: Array<{ url: string; type: "photo" | "signature" | "doc" }>;
  meta?: Record<string, unknown>;
};

type ShipmentSummary = {
  trackingNumber: string;
  status: ShipmentStatus;
  origin: string;
  destination: string;
  eta?: string;
  carrier?: string;
  lastUpdate: string;
  hasPOD: boolean;
};

const statusBadgeClasses: Record<ShipmentStatus, string> = {
  LabelCreated: "bg-slate-100 text-slate-800",
  DropoffConfirmed: "bg-indigo-100 text-indigo-800",
  ReceivedAtFacility: "bg-violet-100 text-violet-800",
  InTransit: "bg-blue-100 text-blue-800",
  OutForDelivery: "bg-amber-100 text-amber-800",
  DeliveryAttempted: "bg-orange-100 text-orange-800",
  Delivered: "bg-green-100 text-green-800",
  FailedDelivery: "bg-red-100 text-red-800",
  ReturnedToSender: "bg-rose-100 text-rose-800",
  Cancelled: "bg-gray-100 text-gray-800",
};

const titleForEvent = (event: TrackingEvent): string => {
  const mapping: Record<string, string> = {
    LABEL_CREATED: "Label created",
    DROP_OFF_CONFIRMED: "Package dropped off",
    SCANNED_AT_FACILITY: "Received at facility",
    IN_TRANSIT_DEPARTED: "Departed facility",
    IN_TRANSIT_ARRIVED: "Arrived at facility",
    OUT_FOR_DELIVERY: "Out for delivery",
    DELIVERY_ATTEMPTED: "Delivery attempted",
    DELIVERY_FAILED: "Delivery failed",
    DELIVERED: "Delivered",
    RETURNED_TO_SENDER: "Returned to sender",
    POD_UPLOADED: "Proof of delivery uploaded",
    NOTE_ADDED: "Note added",
  };
  return mapping[event.type] ?? event.type.replaceAll("_", " ").toLowerCase();
};

const iconForEvent = (eventType: string) => {
  const iconMap: Record<string, string> = {
    LABEL_CREATED: "lucide:file-plus",
    DROP_OFF_CONFIRMED: "lucide:hand",
    SCANNED_AT_FACILITY: "lucide:scan",
    IN_TRANSIT_DEPARTED: "lucide:arrow-right",
    IN_TRANSIT_ARRIVED: "lucide:arrow-left",
    OUT_FOR_DELIVERY: "lucide:truck",
    DELIVERY_ATTEMPTED: "lucide:alert-circle",
    DELIVERY_FAILED: "lucide:x-circle",
    DELIVERED: "lucide:check-circle",
    RETURNED_TO_SENDER: "lucide:undo-2",
    POD_UPLOADED: "lucide:image",
    NOTE_ADDED: "lucide:sticky-note",
  };
  const dataIcon = iconMap[eventType] ?? "lucide:dot";
  return React.createElement("span", {
    className: "iconify lucide-icon",
    "data-icon": dataIcon,
    style: { width: "16px", height: "16px", color: "currentColor" },
  });
};

const mockTrackingData = (trackingNumber: string): { summary: ShipmentSummary; events: TrackingEvent[] } => {
  const now = new Date();
  const toISO = (d: Date) => d.toISOString();
  const events: TrackingEvent[] = [
    {
      id: "evt-10",
      timestamp: toISO(new Date(now.getTime() - 1000 * 60 * 60 * 26)),
      type: "LABEL_CREATED",
      statusAfter: "LabelCreated",
      location: "Merchant Portal",
      actor: "merchant",
      details: "Label created and awaiting drop-off",
    },
    {
      id: "evt-20",
      timestamp: toISO(new Date(now.getTime() - 1000 * 60 * 60 * 22)),
      type: "DROP_OFF_CONFIRMED",
      statusAfter: "DropoffConfirmed",
      location: "Local Drop-off Point",
      actor: "courier",
      details: "Package received at drop-off location",
    },
    {
      id: "evt-30",
      timestamp: toISO(new Date(now.getTime() - 1000 * 60 * 60 * 19)),
      type: "SCANNED_AT_FACILITY",
      statusAfter: "ReceivedAtFacility",
      location: "Central Facility",
      actor: "system",
      details: "Package scanned into facility",
    },
    {
      id: "evt-40",
      timestamp: toISO(new Date(now.getTime() - 1000 * 60 * 60 * 15)),
      type: "IN_TRANSIT_DEPARTED",
      statusAfter: "InTransit",
      location: "Central Facility",
      actor: "system",
      details: "Departed facility en route",
    },
    {
      id: "evt-50",
      timestamp: toISO(new Date(now.getTime() - 1000 * 60 * 60 * 6)),
      type: "OUT_FOR_DELIVERY",
      statusAfter: "OutForDelivery",
      location: "Destination City",
      actor: "system",
      details: "Courier has the package",
    },
  ];

  const summary: ShipmentSummary = {
    trackingNumber,
    status: "OutForDelivery",
    origin: "San Francisco, CA",
    destination: "New York, NY",
    eta: new Date(now.getTime() + 1000 * 60 * 60 * 4).toISOString(),
    carrier: "Parcego",
    lastUpdate: events[events.length - 1]?.timestamp ?? now.toISOString(),
    hasPOD: false,
  };

  return { summary, events };
};

export default function TrackPackagePage() {
  const params = useSearchParams();
  const router = useRouter();
  const [trackingParam, setTrackingParam] = useState<string | null>(null);
  useEffect(() => {
    // Read search param only on client to avoid hydration mismatch
    setTrackingParam(params.get("tracking") || "ASH-20250101-ABC123");
  }, [params]);

  const { summary, events } = useMemo(() => {
    const tn = trackingParam || "ASH-20250101-ABC123";
    return mockTrackingData(tn);
  }, [trackingParam]);
  const [showAll, setShowAll] = useState(false);
  const visibleEvents = showAll ? events : events.slice(-3);
  const [preview, setPreview] = useState<{ url: string } | null>(null);

  if (!trackingParam) {
    // Render a stable placeholder during SSR/first paint to avoid hydration mismatch
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Tracking Timeline</CardTitle>
              <CardDescription>Preparing tracking details…</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-4 w-1/3 bg-gray-200 rounded" />
                <div className="h-4 w-2/3 bg-gray-200 rounded" />
                <div className="h-4 w-1/2 bg-gray-200 rounded" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div id="parcego-tracking-header" className="mb-6">
          {/* Back Row */}
          <div className="flex items-center mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
              id="parcego-tracking-back-btn"
              className="parcego-nav__back-btn"
              aria-label="Back to Dashboard"
            >
              {React.createElement('span', {
                className: 'iconify lucide-icon',
                'data-icon': 'lucide:arrow-left',
                style: { width: '16px', height: '16px', marginRight: '8px', color: 'currentColor' }
              })}
              Back to Dashboard
            </Button>
          </div>

          {/* Title Row */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Tracking {summary.trackingNumber}</h1>
              <p className="text-sm text-gray-500">Last update {new Date(summary.lastUpdate).toLocaleString()}</p>
            </div>
            <Badge id="parcego-tracking-status-badge" className={`px-3 py-1 ${statusBadgeClasses[summary.status]}`}>
              {React.createElement("span", {
                className: "iconify lucide-icon",
                "data-icon": "lucide:circle",
                style: { width: "12px", height: "12px", marginRight: "6px" },
              })}
              {summary.status}
            </Badge>
          </div>

          {/* Live region for SR */}
          <div role="status" aria-live="polite" className="sr-only">
            Current status {summary.status}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Tracking Timeline</CardTitle>
              <CardDescription>Latest events are shown first</CardDescription>
            </CardHeader>
            <CardContent>
              <ol id="parcego-tracking-timeline" className="space-y-6">
                {[...visibleEvents].reverse().map((evt, idx, arr) => (
                  <li
                    key={evt.id}
                    id={`parcego-tracking-timeline-item-${evt.id}`}
                    className="grid grid-cols-[28px_1fr] gap-3"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-white border border-gray-200 text-gray-600 grid place-items-center">
                        {iconForEvent(evt.type)}
                      </div>
                      {idx !== arr.length - 1 ? (
                        <div className="flex-1 w-px bg-gray-200 mt-2" aria-hidden="true" />
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{titleForEvent(evt)}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${statusBadgeClasses[evt.statusAfter]}`}>{evt.statusAfter}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(evt.timestamp).toLocaleString()} {evt.location ? `• ${evt.location}` : ""}
                      </span>
                      {evt.details ? (
                        <p className="text-sm text-gray-700">{evt.details}</p>
                      ) : null}
                      {evt.attachments && evt.attachments.length > 0 ? (
                        <div className="mt-2 flex gap-2">
                          {evt.attachments.map((a) => (
                            <button
                              key={a.url}
                              id={`parcego-tracking-attachment-${evt.id}`}
                              className="group inline-flex items-center gap-2 rounded border px-2 py-1 text-xs hover:bg-gray-50 transition-all"
                              onClick={() => setPreview({ url: a.url })}
                              aria-label="Open attachment preview"
                            >
                              {React.createElement("span", {
                                className: "iconify lucide-icon",
                                "data-icon": a.type === "photo" ? "lucide:image" : a.type === "signature" ? "lucide:pen" : "lucide:file",
                                style: { width: "14px", height: "14px", color: "currentColor" },
                              })}
                              <span className="text-gray-700">{a.type}</span>
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
              {events.length > 3 ? (
                <div className="mt-4">
                  <Button variant="outline" onClick={() => setShowAll((v) => !v)}>
                    {showAll ? "Show recent only" : "Show older updates"}
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Summary & POD */}
          <div className="space-y-6">
            <Card id="parcego-tracking-summary-card">
              <CardHeader>
                <CardTitle>Shipment Summary</CardTitle>
                <CardDescription>Overview and ETA</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center justify-between"><span>Origin</span><span className="font-medium">{summary.origin}</span></div>
                  <div className="flex items-center justify-between"><span>Destination</span><span className="font-medium">{summary.destination}</span></div>
                  <div className="flex items-center justify-between"><span>Carrier</span><span className="font-medium">{summary.carrier}</span></div>
                  <div className="flex items-center justify-between"><span>ETA</span><span className="font-medium">{summary.eta ? new Date(summary.eta).toLocaleString() : "—"}</span></div>
                </div>
              </CardContent>
            </Card>

            <Card id="parcego-tracking-pod-gallery">
              <CardHeader>
                <CardTitle>Proof of Delivery</CardTitle>
                <CardDescription>{summary.hasPOD ? "Tap a thumbnail to preview" : "No proof of delivery available yet"}</CardDescription>
              </CardHeader>
              <CardContent>
                {summary.hasPOD ? (
                  <div className="grid grid-cols-3 gap-2">
                    {/* Mock thumbnails if any in events */}
                    {events
                      .flatMap((e) => e.attachments || [])
                      .filter((a) => a.type === "photo")
                      .slice(0, 6)
                      .map((a) => (
                        <button
                          key={a.url}
                          className="aspect-square w-full rounded border overflow-hidden hover:shadow-sm transition-all"
                          onClick={() => setPreview({ url: a.url })}
                          aria-label="Open photo preview"
                        >
                          <img src={a.url} alt="Proof of delivery" className="h-full w-full object-cover" />
                        </button>
                      ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">No proof of delivery available yet</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Simple Modal Preview (UI only) */}
      {preview ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-black/50"
          onClick={() => setPreview(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-3xl w-[90vw] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-medium">Preview</h2>
              <Button variant="ghost" onClick={() => setPreview(null)} aria-label="Close preview">
                {React.createElement("span", {
                  className: "iconify lucide-icon",
                  "data-icon": "lucide:x",
                  style: { width: "18px", height: "18px" },
                })}
              </Button>
            </div>
            <div className="max-h-[70vh] overflow-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview.url} alt="Attachment preview" className="w-full h-auto rounded" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}


