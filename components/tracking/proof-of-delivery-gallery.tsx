"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import Icon from "@/components/ui/icon"
import Image from "next/image"

type ProofOfDeliveryGalleryProps = {
  hasPOD: boolean
}

const proofImages = [
  {
    id: "proof-01",
    src: "/images/proof-01.png",
    alt: "Package delivered at front door",
    timestamp: "2025-09-12T14:15:00Z",
    location: "Front door - 123 Main St"
  },
  {
    id: "proof-02", 
    src: "/images/proof-02.png",
    alt: "Package placed by entrance",
    timestamp: "2025-09-12T14:14:30Z",
    location: "Entrance - 123 Main St"
  },
  {
    id: "proof-03",
    src: "/images/proof-03.png", 
    alt: "Delivery confirmation photo",
    timestamp: "2025-09-12T14:13:45Z",
    location: "Porch - 123 Main St"
  }
]

// Generate consistent random rotations for each image
const getImageRotation = (id: string): number => {
  const rotations = [-2, -1, 0, 1, 2, 3, -3]
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return rotations[hash % rotations.length]
}

const ProofOfDeliveryGallery: React.FC<ProofOfDeliveryGalleryProps> = ({ hasPOD }) => {
  const [selectedImage, setSelectedImage] = React.useState<typeof proofImages[0] | null>(null)

  const handleImageClick = (image: typeof proofImages[0]) => {
    setSelectedImage(image)
  }

  const handleCloseModal = () => {
    setSelectedImage(null)
  }

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
        {hasPOD ? (
          <>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                <Icon name="Check" className="w-3 h-3 mr-1" />
                Delivered Successfully
              </Badge>
              <span className="text-xs text-gray-500">
                {new Date("2025-09-12T14:15:00Z").toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {proofImages.map((image, index) => {
                const rotation = getImageRotation(image.id)
                return (
                  <div
                    key={image.id}
                    className="relative group cursor-pointer"
                    onClick={() => handleImageClick(image)}
                  >
                    {/* Image Container with Random Rotation */}
                    <div 
                      className="relative bg-white border-2 border-white shadow-md rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105"
                      style={{ 
                        transform: `rotate(${rotation}deg)`,
                        transformOrigin: 'center center'
                      }}
                    >
                      <div className="relative w-full aspect-square">
                        <Image
                          src={image.src}
                          alt={image.alt}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 150px, 120px"
                          onError={() => {
                            // Fallback for missing images
                            console.warn(`Image not found: ${image.src}`)
                          }}
                        />
                        
                        {/* Overlay on Hover */}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                            <Icon name="Search" className="w-4 h-4 text-gray-700" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Image Info (appears on hover) */}
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                      Photo {index + 1}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg p-3">
              <div className="mb-1">
                <span className="font-medium">Delivery Location</span>
              </div>
              <p>123 Main Street, Toronto, ON M5V 3A8</p>
            </div>

            {/* Modal for Image Preview */}
            <Dialog open={!!selectedImage} onOpenChange={handleCloseModal}>
              <DialogContent className="max-w-3xl w-full">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Icon name="Camera" className="w-5 h-5 text-green-600" />
                    Proof of Delivery
                  </DialogTitle>
                </DialogHeader>
                {selectedImage && (
                  <div className="space-y-4">
                    <div className="relative w-full aspect-square max-h-[500px] bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={selectedImage.src}
                        alt={selectedImage.alt}
                        fill
                        className="object-contain"
                        priority
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Timestamp:</span>
                        <p className="text-gray-900">
                          {new Date(selectedImage.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Location:</span>
                        <p className="text-gray-900">{selectedImage.location}</p>
                      </div>
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
            <h4 className="text-sm font-medium text-gray-900 mb-2">No Photos Available</h4>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              Proof of delivery photos will appear here once the package is delivered.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { ProofOfDeliveryGallery }
export default ProofOfDeliveryGallery
