import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PartyPopper, Gift, MapPin, Users } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <PartyPopper className="h-20 w-20 text-primary" />
              <span className="absolute -top-2 -right-2 text-4xl">🎂</span>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Cumple
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Celebrating birthdays with family and friends at Encinas
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-pink-100 flex items-center justify-center">
                <span className="text-3xl">👩</span>
              </div>
              <CardTitle className="text-2xl">Cova</CardTitle>
              <CardDescription>Covadonga</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-3xl">👨</span>
              </div>
              <CardTitle className="text-2xl">Jaime</CardTitle>
              <CardDescription>Jaime</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="max-w-2xl mx-auto mb-12">
          <CardHeader>
            <div className="flex items-center gap-3">
              <MapPin className="h-6 w-6 text-primary" />
              <CardTitle>Venue</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium mb-2">Encinas</p>
            <p className="text-gray-600 mb-4">
              Encinas (Bularas), 1<br />
              28224 Pozuelo de Alarcón, Spain
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://maps.google.com/?q=Encina+Alam+Bul+1+28224+Pozuelo+de+Alarcon+Spain"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm">
                  Open in Google Maps
                </Button>
              </a>
              <a
                href="https://maps.apple.com/?q=Encinas+Alameda+Bul+1+28224+Pozuelo+de+Alarcon+Spain"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm">
                  Open in Apple Maps
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto mb-16">
          <div className="text-center p-6">
            <Users className="h-10 w-10 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold mb-1">Guest Management</h3>
            <p className="text-sm text-gray-600">Track RSVPs and dietary preferences</p>
          </div>
          <div className="text-center p-6">
            <Gift className="h-10 w-10 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold mb-1">Gift Registry</h3>
            <p className="text-sm text-gray-600">Contribute to meaningful gifts</p>
          </div>
          <div className="text-center p-6">
            <PartyPopper className="h-10 w-10 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold mb-1">Celebrate Together</h3>
            <p className="text-sm text-gray-600">Share in the joy of celebration</p>
          </div>
        </div>

        <div className="text-center">
          <Link href="/login">
            <Button size="lg" className="text-lg px-8">
              Admin Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
