"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Circle, FilePlus, Hand, Scan, ArrowRight, Truck, XCircle, CheckCircle, Undo2, Image, StickyNote, Dot, Pen, File, X, AlertCircle } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import NextImage from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
  const iconMap: Record<string, React.ReactElement> = {
    LABEL_CREATED: <FilePlus size={16} />,
    DROP_OFF_CONFIRMED: <Hand size={16} />,
    SCANNED_AT_FACILITY: <Scan size={16} />,
    IN_TRANSIT_DEPARTED: <ArrowRight size={16} />,
    IN_TRANSIT_ARRIVED: <ArrowRight size={16} />,
    OUT_FOR_DELIVERY: <Truck size={16} />,
    DELIVERY_ATTEMPTED: <AlertCircle size={16} />,
    DELIVERY_FAILED: <XCircle size={16} />,
    DELIVERED: <CheckCircle size={16} />,
    RETURNED_TO_SENDER: <Undo2 size={16} />,
    POD_UPLOADED: <Image size={16} aria-label="Proof of delivery uploaded" />,
    NOTE_ADDED: <StickyNote size={16} />,
  };
  return iconMap[eventType] ?? <Dot size={16} />;
};

const mockTrackingData = (trackingNumber: string): { summary: ShipmentSummary; events: TrackingEvent[] } => {
  const now = new Date();
  const toISO = (d: Date) => d.toISOString();
  const events: TrackingEvent[] = [
    { id: "evt-10", timestamp: toISO(new Date(now.getTime() - 1000 * 60 * 60 * 26)), type: "LABEL_CREATED", statusAfter: "LabelCreated", location: "Merchant Portal", actor: "merchant", details: "Label created and awaiting drop-off" },
    { id: "evt-20", timestamp: toISO(new Date(now.getTime() - 1000 * 60 * 60 * 22)), type: "DROP_OFF_CONFIRMED", statusAfter: "DropoffConfirmed", location: "Local Drop-off Point", actor: "courier", details: "Package received at drop-off location" },
    { id: "evt-30", timestamp: toISO(new Date(now.getTime() - 1000 * 60 * 60 * 19)), type: "SCANNED_AT_FACILITY", statusAfter: "ReceivedAtFacility", location: "Central Facility", actor: "system", details: "Package scanned into facility" },
    { id: "evt-40", timestamp: toISO(new Date(now.getTime() - 1000 * 60 * 60 * 15)), type: "IN_TRANSIT_DEPARTED", statusAfter: "InTransit", location: "Central Facility", actor: "system", details: "Departed facility en route" },
    { id: "evt-50", timestamp: toISO(new Date(now.getTime() - 1000 * 60 * 60 * 6)), type: "OUT_FOR_DELIVERY", statusAfter: "OutForDelivery", location: "Destination City", actor: "system", details: "Courier has the package" },
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

export default function TrackPackageClient() {
  const params = useSearchParams();
  const router = useRouter();
  const [trackingParam, setTrackingParam] = useState<string | null>(null);

  useEffect(() => {
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
        <div id="parcego-tracking-header" className="mb-6">
          <div className="flex items-center mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/label/preview?tracking=${trackingParam}`)}
              id="parcego-tracking-back-btn"
              className="parcego-nav__back-btn"
              aria-label="Back to Label Preview"
            >
              <X size={16} className="mr-2" />
              Back to Label
            </Button>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Tracking {summary.trackingNumber}</h1>
              <p className="text-sm text-gray-500">Last update {new Date(summary.lastUpdate).toLocaleString()}</p>
            </div>
            <Badge id="parcego-tracking-status-badge" className={`px-3 py-1 ${statusBadgeClasses[summary.status]}`}>
              <Circle size={12} className="mr-1" />
              {summary.status}
            </Badge>
          </div>

          <div role="status" aria-live="polite" className="sr-only">Current status {summary.status}</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Tracking Timeline</CardTitle>
              <CardDescription>Latest events are shown first</CardDescription>
            </CardHeader>
            <CardContent>
              <ol id="parcego-tracking-timeline" className="space-y-6">
                {[...visibleEvents].reverse().map((evt, idx, arr) => (
                  <li key={evt.id} id={`parcego-tracking-timeline-item-${evt.id}`} className="grid grid-cols-[28px_1fr] gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-white border border-gray-200 text-gray-600 grid place-items-center">
                        {iconForEvent(evt.type)}
                      </div>
                      {idx !== arr.length - 1 ? <div className="flex-1 w-px bg-gray-200 mt-2" aria-hidden="true" /> : null}
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{titleForEvent(evt)}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${statusBadgeClasses[evt.statusAfter]}`}>{evt.statusAfter}</span>
                      </div>
                      <span className="text-xs text-gray-500">{new Date(evt.timestamp).toLocaleString()} {evt.location ? `• ${evt.location}` : ""}</span>
                      {evt.details ? <p className="text-sm text-gray-700">{evt.details}</p> : null}
                      {evt.attachments && evt.attachments.length > 0 ? (
                        <div className="mt-2 flex gap-2">
                          {evt.attachments.map((a) => (
                            <button key={a.url} id={`parcego-tracking-attachment-${evt.id}`} className="group inline-flex items-center gap-2 rounded border px-2 py-1 text-xs hover:bg-gray-50 transition-all" onClick={() => setPreview({ url: a.url })} aria-label="Open attachment preview">
                              {a.type === "photo" ? <Image size={14} aria-label="Photo attachment" /> : a.type === "signature" ? <Pen size={14} /> : <File size={14} />}
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
                  <Button variant="outline" onClick={() => setShowAll((v) => !v)}>{showAll ? "Show recent only" : "Show older updates"}</Button>
                </div>
              ) : null}
            </CardContent>
          </Card>

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
                    {events.flatMap((e) => e.attachments || []).filter((a) => a.type === "photo").slice(0, 6).map((a) => (
                      <button key={a.url} className="aspect-square w-full rounded border overflow-hidden hover:shadow-sm transition-all" onClick={() => setPreview({ url: a.url })} aria-label="Open photo preview">
                        <NextImage src={a.url} alt="Proof of delivery" width={100} height={100} className="h-full w-full object-cover" />
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

      {preview ? (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-black/50" onClick={() => setPreview(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-[90vw] p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-medium">Preview</h2>
              <Button variant="ghost" onClick={() => setPreview(null)} aria-label="Close preview">
                <X size={18} />
              </Button>
            </div>
            <div className="max-h-[70vh] overflow-auto">
              <NextImage src={preview.url} alt="Attachment preview" width={800} height={600} className="w-full h-auto rounded" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}


