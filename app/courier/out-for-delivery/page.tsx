"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@/components/ui/icon";

type StopStatus = "pending" | "en_route" | "delivered" | "failed";

type Stop = {
  id: string;
  sequence: number;
  name: string;
  address: string;
  eta: string;
  status: StopStatus;
  phone?: string;
  notes?: string;
};

const INITIAL_STOPS: Stop[] = [
  { id: "stp-001", sequence: 1, name: "Maya Chen", address: "221B Baker St, London", eta: "10:10–10:30", status: "en_route", phone: "+44 20 7946 0123" },
  { id: "stp-002", sequence: 2, name: "Arjun Patel", address: "10 Downing St, London", eta: "10:35–10:55", status: "pending", phone: "+44 7444 111222" },
  { id: "stp-003", sequence: 3, name: "Sara López", address: "30 St Mary Axe, London", eta: "11:05–11:25", status: "pending", phone: "+44 7700 900123" },
];

const statusBadge = (s: StopStatus) => {
  if (s === "delivered") return "bg-green-100 text-green-800 border-green-200";
  if (s === "failed") return "bg-red-100 text-red-800 border-red-200";
  if (s === "en_route") return "bg-blue-100 text-blue-800 border-blue-200";
  return "bg-gray-100 text-gray-800 border-gray-200";
};

export default function OutForDeliveryPage() {
  const router = useRouter();

  const [stops, setStops] = useState<Stop[]>(INITIAL_STOPS);
  const [selectedStopId, setSelectedStopId] = useState<string>(INITIAL_STOPS[0].id);
  const [isPaused, setIsPaused] = useState(false);
  const [showToast, setShowToast] = useState<{ message: string; tone: "success" | "warning" | "neutral" } | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  // Dialog states
  const [showAttemptDialog, setShowAttemptDialog] = useState(false);
  const [attemptTab, setAttemptTab] = useState<"delivered" | "failed">("delivered");
  const [showScanDialog, setShowScanDialog] = useState(false);
  const [showWorkflowDialog, setShowWorkflowDialog] = useState(false);
  // Failed attempt form
  const [failedReason, setFailedReason] = useState("No answer");
  const [failedNotes, setFailedNotes] = useState("");

  const selectedStop = useMemo(() => stops.find((s) => s.id === selectedStopId)!, [stops, selectedStopId]);
  const deliveredCount = useMemo(() => stops.filter((s) => s.status === "delivered").length, [stops]);
  const failedCount = useMemo(() => stops.filter((s) => s.status === "failed").length, [stops]);
  const totalStops = stops.length;
  const remainingCount = totalStops - deliveredCount - failedCount;
  const progressPct = Math.round((deliveredCount / totalStops) * 100);

  useEffect(() => {
    if (!showToast) return;
    const t = setTimeout(() => setShowToast(null), 2200);
    return () => clearTimeout(t);
  }, [showToast]);

  const handleBack = useCallback(() => {
    router.push("/courier");
  }, [router]);

  const handleSelectStop = useCallback((id: string) => setSelectedStopId(id), []);



  const getNextPendingStop = useCallback((currentId: string) => {
    const ordered = [...stops].sort((a, b) => a.sequence - b.sequence);
    const idx = ordered.findIndex((s) => s.id === currentId);
    return ordered.slice(idx + 1).find((s) => s.status === "pending" || s.status === "en_route");
  }, [stops]);

  // Get next pending stop for better UX
  const nextPendingStop = useMemo(() => getNextPendingStop(selectedStopId), [getNextPendingStop, selectedStopId]);

  const handleWorkflowAction = useCallback((action: "next" | "complete" | "skip") => {
    if (action === "next") {
      const nextStop = getNextPendingStop(selectedStopId);
      if (nextStop) {
        setSelectedStopId(nextStop.id);
        setShowToast({ message: `Moving to next stop: ${nextStop.name}`, tone: "success" });
      } else {
        setShowToast({ message: "No more pending stops", tone: "warning" });
      }
    } else if (action === "complete") {
      setShowToast({ message: "Route completed! Returning to dashboard", tone: "success" });
      setTimeout(() => router.push("/courier"), 1500);
    } else if (action === "skip") {
      setStops((prev) => prev.map((s) => (s.id === selectedStopId ? { ...s, status: "failed" } : s)));
      setShowToast({ message: `Stop skipped: ${selectedStop.name}`, tone: "warning" });
      const nextStop = getNextPendingStop(selectedStopId);
      if (nextStop) setSelectedStopId(nextStop.id);
    }
    setShowWorkflowDialog(false);
  }, [selectedStopId, getNextPendingStop, selectedStop.name, router]);

  const handleConfirmDelivered = useCallback(() => {
    setStops((prev) => prev.map((s) => (s.id === selectedStopId ? { ...s, status: "delivered" } : s)));
    setShowAttemptDialog(false);
    setShowToast({ message: "Delivery confirmed (UI only)", tone: "success" });
    // Show workflow dialog instead of auto-advancing
    setShowWorkflowDialog(true);
  }, [selectedStopId]);

  const handleConfirmFailed = useCallback(() => {
    setStops((prev) => prev.map((s) => (s.id === selectedStopId ? { ...s, status: "failed" } : s)));
    setShowAttemptDialog(false);
    setShowToast({ message: `Failed attempt: ${failedReason}`, tone: "warning" });
    // Show workflow dialog for failed attempts too
    setShowWorkflowDialog(true);
  }, [failedReason, selectedStopId]);

  const handleScanSubmit = useCallback(() => {
    setShowScanDialog(false);
    setShowToast({ message: "Pre-drop scan recorded (mock)", tone: "neutral" });
  }, []);

  const handlePauseResume = useCallback(() => {
    setIsPaused((p) => !p);
    setShowToast({ message: !isPaused ? "Route paused (UI only)" : "Route resumed (UI only)", tone: "neutral" });
  }, [isPaused]);

  const headerStatusLabel = isPaused ? "Paused" : "In Progress";

  return (
    <div className="min-h-screen bg-gray-50" id="parcego-ofd-container">
      {/* Toast */}
      {showToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50" aria-live="polite">
          <div className={`px-4 py-2 rounded-lg shadow-sm border flex items-center gap-2 bg-white ${showToast.tone === "success" ? "border-emerald-200" : showToast.tone === "warning" ? "border-amber-200" : "border-gray-200"}`}>
            <Icon name={showToast.tone === "success" ? "CheckCircle" : showToast.tone === "warning" ? "AlertCircle" : "Info"} className={`${showToast.tone === "success" ? "text-emerald-600" : showToast.tone === "warning" ? "text-amber-600" : "text-gray-500"}`} size={16} />
            <span className="text-sm font-medium">{showToast.message}</span>
          </div>
        </div>
      )}

      {/* Offline banner */}
      {isOffline && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between" id="parcego-ofd-offline-banner">
          <div className="flex items-center gap-2 text-amber-800 text-sm"><Icon name="WifiOff" size={16} /> Offline. Actions will be queued.</div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setIsOffline(false)}>Dismiss</Button>
            <Button size="sm" onClick={() => setShowToast({ message: "Retrying queued actions (mock)", tone: "neutral" })}>Retry</Button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 py-4" id="parcego-ofd-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button id="parcego-ofd-back-btn" variant="ghost" size="icon" onClick={handleBack} aria-label="Go back" className="p-3"><Icon name="ArrowLeft" size={22} className="text-gray-700" /></Button>
            <div>
              <h1 className="text-xl font-semibold">Out for Delivery</h1>
              <p className="text-sm text-muted-foreground">Manage your active route and attempts (UI only).</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/courier/route')}
              className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
              id="parcego-ofd-start-delivery-route-btn"
            >
              <Icon name="Route" size={16} className="mr-2" />
              Start Delivery Route
            </Button>
            <Badge id="parcego-ofd-status-badge" className={isPaused ? "bg-gray-100 text-gray-800 border-gray-200" : "bg-emerald-100 text-emerald-800 border-emerald-200"}>{headerStatusLabel}</Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl p-4 grid gap-6 lg:grid-cols-12">
        {/* Summary */}
        <Card id="parcego-ofd-summary-card" className="lg:col-span-12">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Route Summary</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handlePauseResume}>{isPaused ? <><Icon name="Play" size={14} className="mr-2" />Resume</> : <><Icon name="Pause" size={14} className="mr-2" />Pause</>}</Button>
                <Button variant="outline" size="sm" onClick={() => setShowToast({ message: "Route refreshed (mock)", tone: "neutral" })}><Icon name="RefreshCw" size={14} className="mr-2" />Refresh</Button>
                <Button variant="outline" size="sm" onClick={() => setIsOffline((p) => !p)}>{isOffline ? "Go Online" : "Go Offline"}</Button>
              </div>
            </CardTitle>
            <CardDescription>Stops: {totalStops} • Delivered: {deliveredCount} • Failed: {failedCount} • Remaining: {remainingCount}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-2 rounded-full bg-gray-200 overflow-hidden" aria-label="Progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPct} role="progressbar">
              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${progressPct}%` }} />
            </div>
          </CardContent>
        </Card>

        {/* Stops List */}
        <Card className="lg:col-span-5" id="parcego-ofd-stops-list">
          <CardHeader>
            <CardTitle>Stops</CardTitle>
            <CardDescription>Tap a stop to focus. Action icons are UI-only.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {stops.sort((a, b) => a.sequence - b.sequence).map((s) => (
              <div
                key={s.id}
                id={`parcego-ofd-stop-item-${s.id}`}
                role="button"
                tabIndex={0}
                aria-pressed={selectedStopId === s.id}
                onClick={() => handleSelectStop(s.id)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleSelectStop(s.id); } }}
                className={`group flex items-center justify-between rounded-lg border p-3 transition-all ${
                  selectedStopId === s.id ? "border-blue-300 bg-blue-50" : 
                  s.status === "delivered" ? "border-green-200 bg-green-50" :
                  s.status === "failed" ? "border-red-200 bg-red-50" :
                  "hover:bg-gray-50"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-gray-100 text-gray-800 border-gray-200">#{s.sequence}</Badge>
                    <p className="font-medium truncate">{s.name}</p>
                    <Badge className={statusBadge(s.status)}>{s.status.replace("_", " ")}</Badge>
                    {s.status === "delivered" && (
                      <Icon name="CheckCircle" size={16} className="text-green-600 flex-shrink-0" />
                    )}
                    {s.status === "failed" && (
                      <Icon name="XCircle" size={16} className="text-red-600 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{s.address}</p>
                  <p className="text-xs text-gray-500">ETA {s.eta}</p>
                </div>
                <div className="ml-3 flex items-center gap-2">
                  <Button variant="outline" size="icon" aria-label="Navigate"><Icon name="Navigation" size={16} /></Button>
                  <Button variant="outline" size="icon" aria-label="Call"><Icon name="Phone" size={16} /></Button>
                  <Button variant="outline" size="icon" aria-label="Message"><Icon name="MessageSquare" size={16} /></Button>
                  <Button variant="outline" size="icon" aria-label="Scan"><Icon name="ScanBarcode" size={16} /></Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Current Stop */}
        <Card className="lg:col-span-7" id="parcego-ofd-current-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Current Stop</span>
              <Badge className={statusBadge(selectedStop.status)}>#{selectedStop.sequence} • {selectedStop.status.replace("_", " ")}</Badge>
            </CardTitle>
            <CardDescription className="truncate">{selectedStop.name} • {selectedStop.address}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Map placeholder */}
            <div className="h-40 rounded-xl border bg-white flex items-center justify-center text-gray-500"><Icon name="MapPin" size={20} className="mr-2" /> Map placeholder</div>

            {/* Details */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-lg border p-3">
                <p className="text-sm text-muted-foreground">Recipient</p>
                <p className="font-medium">{selectedStop.name}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{selectedStop.phone || "—"}</p>
              </div>
              <div className="sm:col-span-2 rounded-lg border p-3">
                <p className="text-sm text-muted-foreground">Notes</p>
                <p className="font-medium">{selectedStop.notes || "No special instructions"}</p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={() => { setAttemptTab("delivered"); setShowAttemptDialog(true); }}><Icon name="Hand" size={16} className="mr-2" />Attempt Delivery</Button>
              <Button variant="outline" onClick={() => setShowScanDialog(true)}><Icon name="ScanBarcode" size={16} className="mr-2" />Pre-drop Scan</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sticky Bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80" id="parcego-ofd-stickybar">
        <div className="mx-auto max-w-6xl px-4 py-2 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Stop {stops.findIndex((s) => s.id === selectedStopId) + 1} of {totalStops} • Remaining {remainingCount}
            {nextPendingStop && (
              <span className="ml-2 text-blue-600 font-medium">
                • Next: {nextPendingStop.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><Icon name="Navigation" size={14} className="mr-2" />Navigate</Button>
            <Button variant="outline" size="sm"><Icon name="Phone" size={14} className="mr-2" />Call</Button>
            <Button size="sm" onClick={() => { setAttemptTab("delivered"); setShowAttemptDialog(true); }}><Icon name="Hand" size={14} className="mr-2" />Attempt Delivery</Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowWorkflowDialog(true)}
              className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              <Icon name="ArrowRight" size={14} className="mr-2" />Next Action
            </Button>
          </div>
        </div>
      </div>

      {/* Attempt Delivery Dialog (headless) */}
      {showAttemptDialog && (
        <div id="parcego-ofd-attempt-dialog" role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAttemptDialog(false)} />
          <div className="relative bg-white rounded-xl shadow-lg w-full max-w-lg border p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">Attempt Delivery</h2>
                <p className="text-sm text-muted-foreground">Update the outcome for this stop.</p>
              </div>
              <Button variant="ghost" size="icon" aria-label="Close" onClick={() => setShowAttemptDialog(false)}><Icon name="X" /></Button>
            </div>

            {/* Tabs */}
            <div className="mt-4 grid grid-cols-2 rounded-lg border p-1 text-sm">
              <button className={`rounded-md px-3 py-1.5 ${attemptTab === "delivered" ? "bg-gray-100" : "hover:bg-gray-50"}`} onClick={() => setAttemptTab("delivered")}>Delivered</button>
              <button className={`rounded-md px-3 py-1.5 ${attemptTab === "failed" ? "bg-gray-100" : "hover:bg-gray-50"}`} onClick={() => setAttemptTab("failed")}>Failed</button>
            </div>

            {attemptTab === "delivered" ? (
              <div className="mt-4 space-y-4">
                <div className="h-28 rounded-lg border-dashed border flex items-center justify-center text-sm text-muted-foreground"><Icon name="Camera" size={18} className="mr-2" /> Photo placeholder</div>
                <div className="flex items-center gap-2 text-sm"><input id="parcego-ofd-require-signature" type="checkbox" className="accent-primary" /><label htmlFor="parcego-ofd-require-signature">Require signature (UI only)</label></div>
                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAttemptDialog(false)}>Cancel</Button>
                  <Button id="parcego-ofd-delivered-confirm-btn" onClick={handleConfirmDelivered}><Icon name="CheckCircle" size={16} className="mr-2" />Confirm Delivery</Button>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <fieldset className="space-y-2">
                  {["No answer", "Incorrect address", "Access blocked", "Other"].map((r) => (
                    <label key={r} className="flex items-center gap-2 text-sm">
                      <input type="radio" name="failed_reason" value={r} checked={failedReason === r} onChange={(e) => setFailedReason(e.target.value)} className="accent-primary" />
                      <span>{r}</span>
                    </label>
                  ))}
                </fieldset>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Notes (optional)</p>
                  <Textarea value={failedNotes} onChange={(e) => setFailedNotes(e.target.value)} placeholder="Add extra context (UI only)" />
                </div>
                <div className="h-20 rounded-lg border-dashed border flex items-center justify-center text-xs text-muted-foreground"><Icon name="Image" size={16} className="mr-2" /> Photo placeholder</div>
                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAttemptDialog(false)}>Cancel</Button>
                  <Button id="parcego-ofd-failed-confirm-btn" variant="destructive" onClick={handleConfirmFailed}><Icon name="AlertCircle" size={16} className="mr-2" />Record Failed Attempt</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scan Dialog (headless) */}
      {showScanDialog && (
        <div id="parcego-ofd-scan-dialog" role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowScanDialog(false)} />
          <div className="relative bg-white rounded-xl shadow-lg w-full max-w-md border p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">Pre-drop Scan</h2>
                <p className="text-sm text-muted-foreground">Enter or scan the package code (UI only).</p>
              </div>
              <Button variant="ghost" size="icon" aria-label="Close" onClick={() => setShowScanDialog(false)}><Icon name="X" /></Button>
            </div>
            <div className="mt-4 space-y-3">
              <Input placeholder="Enter code e.g. PCG-123456" aria-label="Package code" />
              <div className="h-24 rounded-lg border-dashed border flex items-center justify-center text-sm text-muted-foreground">
                <Icon name="ScanBarcode" size={18} className="mr-2" /> Scanner placeholder
              </div>
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setShowScanDialog(false)}>Cancel</Button>
              <Button onClick={handleScanSubmit}><Icon name="Check" size={16} className="mr-2" />Submit</Button>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Navigation Dialog */}
      {showWorkflowDialog && (
        <div id="parcego-ofd-workflow-dialog" role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowWorkflowDialog(false)} />
          <div className="relative bg-white rounded-xl shadow-lg w-full max-w-md border p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">What would you like to do next?</h2>
                <p className="text-sm text-muted-foreground">Choose your next action after completing this stop.</p>
              </div>
              <Button variant="ghost" size="icon" aria-label="Close" onClick={() => setShowWorkflowDialog(false)}><Icon name="X" /></Button>
            </div>
            
            <div className="mt-4 space-y-3">
              {/* Next Stop Option */}
              <button 
                onClick={() => handleWorkflowAction("next")}
                className="w-full text-left p-4 rounded-lg border hover:border-blue-300 hover:bg-blue-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <Icon name="ArrowRight" size={20} className="text-blue-600" />
                    </div>
                  </div>
                                      <div className="flex-1">
                      <div className="font-medium text-gray-900">Continue to Next Stop</div>
                      <div className="text-sm text-gray-500">
                        {nextPendingStop 
                          ? `Move to: ${nextPendingStop.name}`
                          : "No more pending stops"
                        }
                      </div>
                    </div>
                </div>
              </button>

              {/* Complete Route Option */}
              <button 
                onClick={() => handleWorkflowAction("complete")}
                className="w-full text-left p-4 rounded-lg border hover:border-green-300 hover:bg-green-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <Icon name="CheckCircle" size={20} className="text-green-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Complete Route</div>
                    <div className="text-sm text-gray-500">Finish delivery and return to dashboard</div>
                  </div>
                </div>
              </button>

              {/* Skip Stop Option */}
              <button 
                onClick={() => handleWorkflowAction("skip")}
                className="w-full text-left p-4 rounded-lg border hover:border-orange-300 hover:bg-orange-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                      <Icon name="SkipForward" size={20} className="text-orange-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Skip This Stop</div>
                    <div className="text-sm text-gray-500">Mark as failed and move to next</div>
                  </div>
                </div>
              </button>
            </div>

            <div className="mt-4 pt-3 border-t">
              <Button 
                variant="ghost" 
                onClick={() => setShowWorkflowDialog(false)}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


