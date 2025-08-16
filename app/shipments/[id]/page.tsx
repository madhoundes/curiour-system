"use client";

import React, { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icon } from "@/components/ui/icon";
import { generateMockShipments, formatCurrency } from "@/lib/mock/shipments";

const allShipments = generateMockShipments();

export default function ShipmentDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id as string;

  const shipment = useMemo(() => allShipments.find((s) => s.id === id), [id]);

  if (!shipment) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p className="text-sm text-gray-600">Shipment not found.</p>
        <Button variant="ghost" className="mt-2" onClick={() => router.push("/shipments")} id="parcego-shipments-back-btn">
          <Icon name="ArrowLeft" size={16} className="mr-2" /> Back to Shipments
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          {/* Left side: Back button */}
          <div className="flex-shrink-0">
            <Button 
              variant="ghost" 
              onClick={() => router.push("/shipments")} 
              id="parcego-shipments-back-btn" 
              aria-label="Back to shipments"
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 rounded-full"
            >
              <Icon name="ArrowLeft" size={18} />
            </Button>
          </div>

          {/* Center: Title and tracking info */}
          <div className="flex-1 flex justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">{shipment.id}</h1>
              <p className="text-sm text-gray-600">Tracking: {shipment.trackingNumber}</p>
            </div>
          </div>

          {/* Right side: Action buttons */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <Button variant="outline" onClick={() => router.push(`/create-shipment?from=${encodeURIComponent(shipment.id)}`)} aria-label="Re-ship">
              <Icon name="Repeat" size={16} className="mr-2" /> Re-ship
            </Button>
            <Button variant="outline" onClick={() => alert("Printing (mock)…")} aria-label="Print">
              <Icon name="Printer" size={16} className="mr-2" /> Print
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4 flex items-center gap-4">
            <Badge>{shipment.status.replace(/_/g, " ")}</Badge>
            <span className="text-sm text-gray-700">{new Date(shipment.createdAt).toLocaleString()}</span>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="docs">Label & Docs</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Recipient</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-700">
                  <div className="font-medium">{shipment.recipient.name}</div>
                  <div>{shipment.recipient.address1}</div>
                  <div>
                    {shipment.recipient.city}, {shipment.recipient.province} {shipment.recipient.postalCode}
                  </div>
                  <div>{shipment.recipient.country}</div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Service</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-700">{shipment.service} via {shipment.courier}</CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Package</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-700">{shipment.weightKg.toFixed(2)} kg • {formatCurrency(shipment.cost)}</CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Tracking Timeline</CardTitle>
                <CardDescription>Key shipment milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li>Label Created</li>
                  <li>Scanned at origin facility</li>
                  <li>In transit</li>
                  <li>Out for delivery</li>
                  <li>Delivered</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="docs" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>Label and invoice</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-2">
                <Button variant="outline" onClick={() => router.push(`/label/preview?tracking=${encodeURIComponent(shipment.trackingNumber)}`)}>
                  <Icon name="FileText" size={16} className="mr-2" /> View Label
                </Button>
                <Button variant="outline" onClick={() => alert("Downloading invoice (mock)…")}>
                  <Icon name="FileDown" size={16} className="mr-2" /> Download Invoice
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700">
                Base: {formatCurrency(Math.max(0, shipment.cost - 4.5))} • Taxes/Fees: {formatCurrency(4.5)} • Total: {formatCurrency(shipment.cost)}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


