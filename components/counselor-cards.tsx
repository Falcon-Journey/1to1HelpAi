"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserIcon, CalendarIcon, StarIcon, ClockIcon, MapPinIcon, GraduationCapIcon, XIcon, PhoneIcon, MailIcon, DollarSignIcon } from 'lucide-react'
import { BookingModal } from "./booking-modal"

// Hardcoded counselor data
const counselors = [
  {
    id: 1,
    name: "Dr. Sarah Chen",
    title: "Licensed Clinical Psychologist",
    specialties: ["Anxiety", "Depression", "Trauma"],
    rating: 4.9,
    experience: "12 years",
    location: "San Francisco, CA",
    education: "PhD Psychology, Stanford University",
    bio: "Dr. Chen specializes in cognitive-behavioral therapy and has extensive experience helping clients overcome anxiety and depression. She uses evidence-based approaches tailored to each individual's needs.",
    availability: "Mon-Fri, 9AM-6PM",
    rate: "$150/session",
    phone: "+1 (555) 123-4567",
    email: "sarah.chen@bloomwellness.com",
    image: "/professional-woman-therapist.png"
  },
  {
    id: 2,
    name: "Dr. Michael Rodriguez",
    title: "Licensed Marriage & Family Therapist",
    specialties: ["Couples Therapy", "Family Counseling", "Communication"],
    rating: 4.8,
    experience: "8 years",
    location: "Austin, TX",
    education: "MA Family Therapy, University of Texas",
    bio: "Dr. Rodriguez helps couples and families build stronger relationships through improved communication and conflict resolution. He creates a safe space for healing and growth.",
    availability: "Tue-Sat, 10AM-7PM",
    rate: "$120/session",
    phone: "+1 (555) 234-5678",
    email: "michael.rodriguez@bloomwellness.com",
    image: "/professional-man-therapist.png"
  },
  {
    id: 3,
    name: "Dr. Emily Johnson",
    title: "Licensed Clinical Social Worker",
    specialties: ["Mindfulness", "Stress Management", "Life Transitions"],
    rating: 4.9,
    experience: "10 years",
    location: "Seattle, WA",
    education: "MSW Clinical Practice, University of Washington",
    bio: "Dr. Johnson integrates mindfulness-based approaches with traditional therapy to help clients manage stress and navigate life changes. She believes in the power of self-compassion and resilience.",
    availability: "Mon-Thu, 8AM-5PM",
    rate: "$130/session",
    phone: "+1 (555) 345-6789",
    email: "emily.johnson@bloomwellness.com",
    image: "/professional-woman-counselor.png"
  }
]

interface CounselorCardsProps {
  isSignedUp: boolean
  onSignUp: () => void
  onClose: () => void
}

export function CounselorCards({ isSignedUp, onSignUp, onClose }: CounselorCardsProps) {
  const [selectedCounselor, setSelectedCounselor] = useState<typeof counselors[0] | null>(null)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [bookings, setBookings] = useState<any[]>([])

  const handleBookSession = (counselor: typeof counselors[0]) => {
    setSelectedCounselor(counselor)
    setIsBookingOpen(true)
  }

  const handleBookingComplete = (booking: any) => {
    setBookings(prev => [...prev, booking])
    console.log('New booking:', booking)
  }

  return (
    <>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#2d5a5a]">Professional Counselors</h3>
              <p className="text-sm text-muted-foreground">Connect with qualified mental health professionals</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-[#2d5a5a] hover:bg-[#8fbc8f]/10"
            >
              <XIcon className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Show booking count if user has bookings */}
          {bookings.length > 0 && (
            <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">
                ✅ You have {bookings.length} upcoming appointment{bookings.length > 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>

        {/* Counselor Cards */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {counselors.map((counselor) => (
            <Card key={counselor.id} className="border-[#8fbc8f]/30 hover:border-[#2d5a5a]/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8fbc8f] to-[#2d5a5a] flex items-center justify-center">
                    <UserIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-[#2d5a5a]">{counselor.name}</h4>
                    <p className="text-sm text-muted-foreground">{counselor.title}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <StarIcon className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{counselor.rating}</span>
                      <span className="text-sm text-muted-foreground">• {counselor.experience}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Specialties */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {counselor.specialties.map((specialty) => (
                    <Badge key={specialty} variant="outline" className="text-xs border-[#8fbc8f]/50 text-[#2d5a5a]">
                      {specialty}
                    </Badge>
                  ))}
                </div>

                {/* Basic Info (Always Visible) */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{counselor.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ClockIcon className="w-4 h-4" />
                    <span>{counselor.availability}</span>
                  </div>
                </div>

                {/* Gated Content */}
                {isSignedUp ? (
                  <div className="mt-4 space-y-3 p-3 bg-[#8fbc8f]/10 rounded-lg border border-[#8fbc8f]/20">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-[#2d5a5a]">
                        <GraduationCapIcon className="w-4 h-4" />
                        <span className="font-medium">{counselor.education}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#2d5a5a]">
                        <DollarSignIcon className="w-4 h-4" />
                        <span className="font-medium">{counselor.rate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#2d5a5a]">
                        <PhoneIcon className="w-4 h-4" />
                        <span className="font-medium">{counselor.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#2d5a5a]">
                        <MailIcon className="w-4 h-4" />
                        <span className="font-medium">{counselor.email}</span>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-[#8fbc8f]/20">
                      <p className="text-sm text-[#2d5a5a] leading-relaxed">{counselor.bio}</p>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button 
                        className="flex-1 bg-[#2d5a5a] hover:bg-[#1e3a3a] text-white"
                        size="sm"
                        onClick={() => handleBookSession(counselor)}
                      >
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        Book Session
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-[#8fbc8f] text-[#2d5a5a] hover:bg-[#8fbc8f]/10"
                      >
                        <PhoneIcon className="w-4 h-4 mr-2" />
                        Call
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 p-4 bg-gradient-to-r from-[#8fbc8f]/10 to-[#2d5a5a]/10 rounded-lg border border-[#8fbc8f]/30 text-center">
                    <div className="space-y-2">
                      <div className="w-12 h-12 mx-auto bg-[#2d5a5a]/10 rounded-full flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-[#2d5a5a]" />
                      </div>
                      <h5 className="font-medium text-[#2d5a5a]">Full Profile Available</h5>
                      <p className="text-sm text-muted-foreground">
                        Sign up to view complete counselor information, contact details, and book sessions.
                      </p>
                      <Button 
                        onClick={onSignUp}
                        className="w-full bg-[#2d5a5a] hover:bg-[#1e3a3a] text-white mt-3"
                        size="sm"
                      >
                        Sign Up to View Details
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/50 bg-[#8fbc8f]/5">
          <p className="text-xs text-muted-foreground text-center">
            All counselors are licensed professionals verified by Bloom Wellness
          </p>
        </div>
      </div>

      {/* Booking Modal */}
      {selectedCounselor && (
        <BookingModal
          counselor={selectedCounselor}
          isOpen={isBookingOpen}
          onClose={() => {
            setIsBookingOpen(false)
            setSelectedCounselor(null)
          }}
          onBookingComplete={handleBookingComplete}
        />
      )}
    </>
  )
}
