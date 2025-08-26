"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Icon } from "@/components/ui/icon";

interface CancelShipmentDialogProps {
  shipmentId: string;
  trackingNumber: string;
  onCancel: (shipmentId: string) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CancelShipmentDialog({
  shipmentId,
  trackingNumber,
  onCancel,
  isOpen,
  onOpenChange,
}: CancelShipmentDialogProps) {
  const handleCancel = () => {
    onCancel(shipmentId);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Icon name="XCircle" size={20} className="text-red-500" />
            Cancel Shipment
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to cancel shipment <strong>{trackingNumber}</strong>? 
            This action cannot be undone and will permanently mark the shipment as cancelled.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep Shipment</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            <Icon name="X" size={16} className="mr-2" />
            Cancel Shipment
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
