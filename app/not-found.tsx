import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Home, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-blue-200">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Search className="h-8 w-8 text-blue-600" />
            </div>
          </div>
                          <CardTitle className="text-xl font-bold text-blue-900">
                  Page Not Found
                </CardTitle>
                  <CardDescription className="text-blue-700">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-gray-600">
            <p className="text-sm mb-4">
              Error 404 - The requested resource could not be found.
            </p>
          </div>
          
          <div className="flex flex-col space-y-2">
            <Link href="/">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                <Home className="h-4 w-4 mr-2" />
                Go to Homepage
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-2">
              Looking for something specific?
            </p>
            <div className="flex justify-center space-x-4 text-sm">
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
                Dashboard
              </Link>
              <Link href="/shipments" className="text-blue-600 hover:text-blue-800">
                Shipments
              </Link>
              <Link href="/analytics" className="text-blue-600 hover:text-blue-800">
                Analytics
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
