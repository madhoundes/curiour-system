"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import Icon from "@/components/ui/icon"
import type { DeliveryPhoto } from "@/lib/api/types"

type ProofOfDeliveryGalleryProps = {
  /** Real photos returned by the public tracking endpoint. */
  photos: DeliveryPhoto[]
  /** Whether the shipment is in the DELIVERED state. */
  isDelivered: boolean
  /** Actual delivery timestamp (ISO 8601) when available. */
  deliveredAt?: string
  /** Pre-formatted "City, Province" or company name for the recipient. */
  destination?: string
}

// Format an ISO timestamp in the visitor's local timezone. Using the browser's
// locale keeps the displayed time consistent with what the recipient would see
// on a receipt / in their email rather than rendering raw UTC.
const formatLocalDateTime = (iso: string): string => {
  if (!iso) return ""
  try {
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return ""
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return ""
  }
}

// Small deterministic tilt for the polaroid look. Same input produces same
// rotation across renders so photos don't jitter on rerender.
const getImageRotation = (id: number | string): number => {
  const rotations = [-2, -1, 0, 1, 2, 3, -3]
  const key = String(id)
  const hash = key.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return rotations[hash % rotations.length]
}

const PhotoThumb: React.FC<{
  photo: DeliveryPhoto
  index: number
  onClick: () => void
}> = ({ photo, index, onClick }) => {
  const [errored, setErrored] = React.useState(false)
  const rotation = getImageRotation(photo.id)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onClick()
        }
      }}
      aria-label={`Open proof of delivery photo ${index + 1}`}
      className="relative group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
    >
      <div
        className="relative bg-white border-2 border-white shadow-md rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105"
        style={{ transform: `rotate(${rotation}deg)`, transformOrigin: "center center" }}
      >
        <div className="relative w-full aspect-square bg-gray-100">
          {errored ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
              <Icon name="ImageOff" className="w-6 h-6 text-gray-400 mb-1" />
              <span className="text-[10px] text-gray-500 leading-tight">Photo unavailable</span>
            </div>
          ) : (
            // Plain <img>: signed S3 URLs change on every API call (new
            // X-Amz-Signature), so the next/image optimizer would cache-miss
            // every time and burn through the optimization budget for no
            // gain. We also avoid maintaining a remote-patterns allowlist as
            // buckets/regions/CloudFront change.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo.photo_url}
              alt={`Proof of delivery photo ${index + 1}`}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
              onError={() => setErrored(true)}
            />
          )}

          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
              <Icon name="Search" className="w-4 h-4 text-gray-700" />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
        Photo {index + 1}
      </div>
    </div>
  )
}

const ProofOfDeliveryGallery: React.FC<ProofOfDeliveryGalleryProps> = ({
  photos,
  isDelivered,
  deliveredAt,
  destination,
}) => {
  const [selectedPhoto, setSelectedPhoto] = React.useState<DeliveryPhoto | null>(null)
  const [modalErrored, setModalErrored] = React.useState(false)

  const handleSelect = (photo: DeliveryPhoto) => {
    setModalErrored(false)
    setSelectedPhoto(photo)
  }

  const handleCloseModal = () => {
    setSelectedPhoto(null)
    setModalErrored(false)
  }

  const hasPhotos = isDelivered && photos.length > 0

  return (
    <Card id="parcego-tracking-pod-gallery" className="bg-white border border-gray-200 rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <Icon name="Camera" className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Proof of Delivery</h3>
            <p className="text-sm text-gray-500 font-normal">Delivery confirmation photos</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasPhotos ? (
          <>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                <Icon name="Check" className="w-3 h-3 mr-1" />
                Delivered Successfully
              </Badge>
              {deliveredAt && (
                <span className="text-xs text-gray-500">{formatLocalDateTime(deliveredAt)}</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {photos.map((photo, index) => (
                <PhotoThumb
                  key={photo.id}
                  photo={photo}
                  index={index}
                  onClick={() => handleSelect(photo)}
                />
              ))}
            </div>

            {destination && (
              <div className="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg p-3">
                <div className="mb-1">
                  <span className="font-medium">Delivery Location</span>
                </div>
                <p>{destination}</p>
              </div>
            )}

            <Dialog open={!!selectedPhoto} onOpenChange={handleCloseModal}>
              <DialogContent className="max-w-3xl w-full">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Icon name="Camera" className="w-5 h-5 text-green-600" />
                    Proof of Delivery
                  </DialogTitle>
                </DialogHeader>
                {selectedPhoto && (
                  <div className="space-y-4">
                    <div className="relative w-full aspect-square max-h-[500px] bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                      {modalErrored ? (
                        <div className="flex flex-col items-center justify-center text-center px-6">
                          <Icon name="ImageOff" className="w-10 h-10 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">
                            This photo link has expired. Refresh the page to load a new one.
                          </p>
                        </div>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={selectedPhoto.photo_url}
                          alt="Proof of delivery"
                          className="max-w-full max-h-full object-contain"
                          onError={() => setModalErrored(true)}
                        />
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Uploaded:</span>
                        <p className="text-gray-900">
                          {formatLocalDateTime(selectedPhoto.uploaded_at) || "—"}
                        </p>
                      </div>
                      {destination && (
                        <div>
                          <span className="font-medium text-gray-600">Location:</span>
                          <p className="text-gray-900">{destination}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Icon name="Camera" className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              {isDelivered ? "No Photos Available" : "Not Yet Delivered"}
            </h4>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              {isDelivered
                ? "This delivery was completed without proof-of-delivery photos."
                : "Proof of delivery photos will appear here once the package is delivered."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { ProofOfDeliveryGallery }
export default ProofOfDeliveryGallery
