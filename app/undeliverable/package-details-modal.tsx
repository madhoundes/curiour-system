"use client";

import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { UndeliverablePackage, Status } from "@/lib/mock/undeliverable";

interface PackageDetailsModalProps {
  pkg: UndeliverablePackage;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (packageId: string, newStatus: Status) => void;
}

interface NoteEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (note: string) => Promise<void>;
  trackingNumber: string;
}

// Separate Note Entry Modal Component
function NoteEntryModal({ isOpen, onClose, onSubmit, trackingNumber }: NoteEntryModalProps) {
  const [noteText, setNoteText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus the textarea when modal opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      // Small delay to ensure modal is fully rendered
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(noteText.trim());
      setNoteText("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add note. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit(e);
    }
    // Submit on Enter (without modifier keys)
    if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setNoteText("");
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="max-w-md"
        onEscapeKeyDown={handleClose}
        onInteractOutside={handleClose}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Icon name="MessageSquare" size={20} className="text-teal-600" />
            <span>Add Note</span>
          </DialogTitle>
          <DialogDescription>
            Add a note for package {trackingNumber}. Use Shift+Enter for new lines, Enter to submit.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label 
              htmlFor="parcego-note-entry-textarea" 
              className="text-sm font-medium"
            >
              Note Content
            </Label>
            <Textarea
              ref={textareaRef}
              id="parcego-note-entry-textarea"
              placeholder="Enter your note here..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={4}
              className="resize-none"
              aria-describedby="parcego-note-help-text"
              disabled={isSubmitting}
            />
            <p 
              id="parcego-note-help-text" 
              className="text-xs text-gray-500"
            >
              Press Enter to submit, Shift+Enter for new line
            </p>
          </div>

          {error && (
            <div 
              className="p-3 bg-red-50 border border-red-200 rounded-md"
              role="alert"
              aria-live="polite"
            >
              <p className="text-sm text-red-700 flex items-center space-x-2">
                <Icon name="AlertCircle" size={16} className="text-red-600" />
                <span>{error}</span>
              </p>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!noteText.trim() || isSubmitting}
              className="w-full sm:w-auto"
              id="parcego-note-submit-btn"
            >
              {isSubmitting ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Adding Note...
                </>
              ) : (
                <>
                  <Icon name="Plus" size={16} className="mr-2" />
                  Add Note
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function PackageDetailsModal({
  pkg,
  isOpen,
  onClose,
  onStatusUpdate
}: PackageDetailsModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [notes, setNotes] = useState<string[]>(
    pkg.notes ? [pkg.notes] : []
  );

  const handleStatusUpdate = async (newStatus: Status) => {
    setIsUpdating(true);
    try {
      await onStatusUpdate(pkg.id, newStatus);
      // Close modal after successful status update
      onClose();
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddNote = async (noteContent: string) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would add the note to the backend
      console.log("Adding note:", noteContent);
      
      // Add note to local state
      const newNoteWithTimestamp = `${new Date().toLocaleString()}: ${noteContent}`;
      setNotes(prev => [...prev, newNoteWithTimestamp]);
      
      // Show success feedback (in a real app, this would be a toast notification)
      console.log("Note added successfully");
      
    } catch (error) {
      console.error("Failed to add note:", error);
      throw new Error("Failed to add note. Please try again.");
    }
  };

  const openNoteModal = () => {
    setIsNoteModalOpen(true);
  };

  const closeNoteModal = () => {
    setIsNoteModalOpen(false);
  };

  const getStatusBadge = (status: Status) => {
    const statusConfig = {
      pending: { variant: "secondary", text: "Pending Review" },
      in_progress: { variant: "default", text: "In Progress" },
      resolved: { variant: "default", text: "Resolved" }
    } as const;

    const config = statusConfig[status];
    return (
      <Badge variant={config.variant} className="text-sm">
        {config.text}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      high: { variant: "destructive", text: "High Priority" },
      medium: { variant: "default", text: "Medium Priority" },
      low: { variant: "secondary", text: "Low Priority" }
    } as const;

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;
    return (
      <Badge variant={config.variant} className="text-sm">
        {config.text}
      </Badge>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[85%] md:max-w-[75%] lg:max-w-[60%] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Icon name="PackageX" size={20} className="text-red-600" />
              <span>Package Details - {pkg.trackingNumber}</span>
            </DialogTitle>
            <DialogDescription>
              Review package information and manage delivery issues
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4 md:py-6 lg:py-8 px-4 md:px-6 lg:px-8">
            {/* Header Information - Enhanced Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 md:p-6 bg-gray-50 rounded-lg">
              <div>
                <Label className="text-sm font-medium text-gray-600">Tracking Number</Label>
                <p className="text-lg font-mono font-semibold text-blue-600">{pkg.trackingNumber}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Status</Label>
                <div className="mt-1">{getStatusBadge(pkg.status)}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Priority</Label>
                <div className="mt-1">{getPriorityBadge(pkg.priority)}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Issue Type</Label>
                <p className="text-sm font-medium text-red-600">{pkg.issueType}</p>
              </div>
            </div>

            {/* Issue Description - Prominent Display */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2 text-red-700">
                <Icon name="AlertTriangle" size={20} className="text-red-600" />
                <span>Issue Description</span>
              </h3>
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-gray-900">{pkg.issueDescription}</p>
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                  <span>Reported by: {pkg.reportedBy}</span>
                  <span>Reported: {new Date(pkg.reportedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Package Information - Improved Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sender Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <Icon name="User" size={20} className="text-blue-600" />
                  <span>Sender Information</span>
                </h3>
                <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Name</Label>
                    <p className="text-gray-900 font-medium">{pkg.sender.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Company</Label>
                    <p className="text-gray-900">{pkg.sender.company || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Address</Label>
                    <p className="text-gray-900">{pkg.sender.address}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Contact</Label>
                    <p className="text-gray-900">{pkg.sender.contact.phone}</p>
                    <p className="text-gray-900">{pkg.sender.contact.email}</p>
                  </div>
                </div>
              </div>

              {/* Recipient Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <Icon name="MapPin" size={20} className="text-green-600" />
                  <span>Recipient Information</span>
                </h3>
                <div className="space-y-3 p-4 bg-green-50 rounded-lg">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Name</Label>
                    <p className="text-gray-900 font-medium">{pkg.recipient.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Company</Label>
                    <p className="text-gray-900">{pkg.recipient.company || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Address</Label>
                    <p className="text-gray-900">{pkg.recipient.address}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Contact</Label>
                    <p className="text-gray-900">{pkg.recipient.contact.phone}</p>
                    <p className="text-gray-900">{pkg.recipient.contact.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Package Details - Enhanced Layout */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Icon name="Package" size={20} className="text-purple-600" />
                <span>Package Details</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 md:p-6 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Type</Label>
                  <p className="text-gray-900 font-medium">{pkg.packageDetails.type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Weight</Label>
                  <p className="text-gray-900 font-medium">{pkg.packageDetails.weight} {pkg.packageDetails.weightUnit}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Dimensions</Label>
                  <p className="text-gray-900 font-medium">
                    {pkg.packageDetails.dimensions.length} × {pkg.packageDetails.dimensions.width} × {pkg.packageDetails.dimensions.height} {pkg.packageDetails.dimensions.unit}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Special Handling</Label>
                  <div className="space-y-1">
                    {pkg.packageDetails.fragile && <Badge variant="secondary" className="text-xs">Fragile</Badge>}
                    {pkg.packageDetails.valuable && <Badge variant="default" className="text-xs">Valuable</Badge>}
                    {pkg.packageDetails.insurance && <Badge variant="outline" className="text-xs">Insured</Badge>}
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline - Enhanced Visual */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Icon name="Clock" size={20} className="text-indigo-600" />
                <span>Timeline</span>
              </h3>
              <div className="space-y-3 p-4 bg-indigo-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Package Created</p>
                    <p className="text-xs text-gray-500">{new Date(pkg.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Issue Reported</p>
                    <p className="text-xs text-gray-500">{new Date(pkg.reportedAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last Updated</p>
                    <p className="text-xs text-gray-500">{new Date(pkg.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Section - Enhanced Layout */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <Icon name="MessageSquare" size={20} className="text-teal-600" />
                  <span>Notes & Updates</span>
                </h3>
                <Button
                  onClick={openNoteModal}
                  variant="outline"
                  size="sm"
                  id="parcego-undeliverable-add-note-btn"
                  className="flex items-center space-x-2"
                >
                  <Icon name="Plus" size={16} />
                  <span>Add Note</span>
                </Button>
              </div>
              
              {/* Existing Notes */}
              {notes.length > 0 ? (
                <div className="space-y-3">
                  {notes.map((note, index) => (
                    <div 
                      key={index} 
                      className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
                      id={`parcego-undeliverable-note-${index}`}
                    >
                      <Label className="text-sm font-medium text-blue-800">Note {index + 1}</Label>
                      <p className="text-blue-900 mt-1">{note}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                  <p className="text-gray-500 text-sm">No notes added yet. Click &quot;Add Note&quot; to add the first note.</p>
                </div>
              )}
            </div>

            {/* Action Buttons - Enhanced Layout */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 md:pt-6 border-t">
              <div className="flex-1 space-y-2">
                <Label className="text-sm font-medium text-gray-600">Update Status</Label>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  {pkg.status === "pending" && (
                    <Button
                      onClick={() => handleStatusUpdate("in_progress")}
                      disabled={isUpdating}
                      className="flex-1"
                      id="parcego-undeliverable-start-progress-btn"
                    >
                      <Icon name="Play" size={16} className="mr-2" />
                      Start Progress
                    </Button>
                  )}
                  
                  {pkg.status === "in_progress" && (
                    <Button
                      onClick={() => handleStatusUpdate("resolved")}
                      disabled={isUpdating}
                      className="flex-1"
                      id="parcego-undeliverable-mark-resolved-btn"
                    >
                      <Icon name="Check" size={16} className="mr-2" />
                      Mark Resolved
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  id="parcego-undeliverable-close-btn"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Note Entry Modal */}
      <NoteEntryModal
        isOpen={isNoteModalOpen}
        onClose={closeNoteModal}
        onSubmit={handleAddNote}
        trackingNumber={pkg.trackingNumber}
      />
    </>
  );
}
