"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, CalendarIcon, ClockIcon, XIcon, CheckIcon, UserIcon, PhoneIcon, MailIcon } from 'lucide-react'
import { cn } from "@/lib/utils"

interface Counselor {
  id: number
  name: string
  title: string
  specialties: string[]
  rating: number
  experience: string
  location: string
  education: string
  bio: string
  availability: string
  rate: string
  phone: string
  email: string
  image: string
}

interface TimeSlot {
  id: string
  time: string
  available: boolean
}

interface BookingModalProps {
  counselor: Counselor
  isOpen: boolean
  onClose: () => void
  onBookingComplete: (booking: any) => void
}

// Generate demo time slots for the next 7 days
const generateTimeSlots = () => {
  const slots: { [key: string]: TimeSlot[] } = {}
  const today = new Date()
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    const dateKey = date.toISOString().split('T')[0]
    
    // Skip weekends for some counselors
    if (date.getDay() === 0 || date.getDay() === 6) {
      slots[dateKey] = []
      continue
    }
    
    const daySlots: TimeSlot[] = []
    const times = [
      '9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', 
      '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'
    ]
    
    times.forEach((time, index) => {
      // Randomly make some slots unavailable for demo
      const available = Math.random() > 0.3
      daySlots.push({
        id: `${dateKey}-${index}`,
        time,
        available
      })
    })
    
    slots[dateKey] = daySlots
  }
  
  return slots
}

export function BookingModal({ counselor, isOpen, onClose, onBookingComplete }: BookingModalProps) {
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [step, setStep] = useState<'date' | 'time' | 'confirm' | 'success'>('date')
  const [timeSlots] = useState(generateTimeSlots())
  const [bookingDetails, setBookingDetails] = useState({
    sessionType: 'individual',
    notes: ''
  })

  if (!isOpen) return null

  const today = new Date()
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    return date
  })

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const handleDateSelect = (date: Date) => {
    const dateKey = date.toISOString().split('T')[0]
    setSelectedDate(dateKey)
    setStep('time')
  }

  const handleSlotSelect = (slot: TimeSlot) => {
    if (!slot.available) return
    setSelectedSlot(slot)
    setStep('confirm')
  }

  const handleBooking = () => {
    const booking = {
      id: `booking-${Date.now()}`,
      counselor: counselor.name,
      date: selectedDate,
      time: selectedSlot?.time,
      sessionType: bookingDetails.sessionType,
      notes: bookingDetails.notes,
      status: 'confirmed'
    }
    
    onBookingComplete(booking)
    setStep('success')
    
    // Auto close after 3 seconds
    setTimeout(() => {
      onClose()
      // Reset state
      setStep('date')
      setSelectedDate('')
      setSelectedSlot(null)
    }, 3000)
  }

  const selectedDateObj = selectedDate ? new Date(selectedDate) : null
  const availableSlots = selectedDate ? timeSlots[selectedDate] || [] : []

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="wellness-gradient text-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Book Appointment</CardTitle>
              <p className="text-white/80 text-sm">with {counselor.name}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <XIcon className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                step === 'date' ? "bg-[#2d5a5a] text-white" : "bg-[#8fbc8f] text-white"
              )}>
                1
              </div>
              <div className="w-8 h-0.5 bg-gray-200">
                <div className={cn(
                  "h-full bg-[#8fbc8f] transition-all duration-300",
                  ['time', 'confirm', 'success'].includes(step) ? "w-full" : "w-0"
                )} />
              </div>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                step === 'time' ? "bg-[#2d5a5a] text-white" : 
                ['confirm', 'success'].includes(step) ? "bg-[#8fbc8f] text-white" : "bg-gray-200 text-gray-500"
              )}>
                2
              </div>
              <div className="w-8 h-0.5 bg-gray-200">
                <div className={cn(
                  "h-full bg-[#8fbc8f] transition-all duration-300",
                  ['confirm', 'success'].includes(step) ? "w-full" : "w-0"
                )} />
              </div>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                step === 'confirm' ? "bg-[#2d5a5a] text-white" : 
                step === 'success' ? "bg-[#8fbc8f] text-white" : "bg-gray-200 text-gray-500"
              )}>
                3
              </div>
            </div>
          </div>

          {/* Step 1: Date Selection */}
          {step === 'date' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#2d5a5a] flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Select a Date
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {dates.map((date, index) => {
                  const dateKey = date.toISOString().split('T')[0]
                  const hasSlots = timeSlots[dateKey]?.some(slot => slot.available) || false
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6
                  
                  return (
                    <Button
                      key={dateKey}
                      variant="outline"
                      className={cn(
                        "h-auto p-4 flex flex-col items-center gap-2 border-[#8fbc8f]/30",
                        hasSlots && !isWeekend ? "hover:border-[#2d5a5a] hover:bg-[#8fbc8f]/10" : "opacity-50 cursor-not-allowed",
                        selectedDate === dateKey && "border-[#2d5a5a] bg-[#8fbc8f]/10"
                      )}
                      onClick={() => hasSlots && !isWeekend && handleDateSelect(date)}
                      disabled={!hasSlots || isWeekend}
                    >
                      <span className="text-sm font-medium">
                        {index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : formatDate(date)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {isWeekend ? 'Unavailable' : hasSlots ? 'Available' : 'No slots'}
                      </span>
                    </Button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 2: Time Selection */}
          {step === 'time' && selectedDateObj && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#2d5a5a] flex items-center gap-2">
                  <ClockIcon className="w-5 h-5" />
                  Select a Time
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep('date')}
                  className="text-[#2d5a5a]"
                >
                  ← Back to dates
                </Button>
              </div>
              
              <div className="bg-[#8fbc8f]/10 p-3 rounded-lg">
                <p className="text-sm text-[#2d5a5a]">
                  <strong>{formatDate(selectedDateObj)}</strong> - Available time slots
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot.id}
                    variant="outline"
                    className={cn(
                      "h-12 border-[#8fbc8f]/30",
                      slot.available 
                        ? "hover:border-[#2d5a5a] hover:bg-[#8fbc8f]/10" 
                        : "opacity-50 cursor-not-allowed bg-gray-50",
                      selectedSlot?.id === slot.id && "border-[#2d5a5a] bg-[#8fbc8f]/10"
                    )}
                    onClick={() => handleSlotSelect(slot)}
                    disabled={!slot.available}
                  >
                    {slot.time}
                  </Button>
                ))}
              </div>

              {availableSlots.filter(s => s.available).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <ClockIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No available slots for this date</p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 'confirm' && selectedDateObj && selectedSlot && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold text-[#2d5a5a]">Confirm Appointment</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep('time')}
                  className="text-[#2d5a5a] text-xs sm:text-sm"
                >
                  ← Back
                </Button>
              </div>

              {/* Counselor Summary */}
              <div className="bg-[#8fbc8f]/10 p-3 sm:p-4 rounded-lg border border-[#8fbc8f]/20">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#8fbc8f] to-[#2d5a5a] flex items-center justify-center flex-shrink-0">
                    <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-[#2d5a5a] text-sm sm:text-base">{counselor.name}</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">{counselor.title}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2 text-xs sm:text-sm text-[#2d5a5a]">
                      <span className="flex items-center gap-1">
                        <PhoneIcon className="w-3 h-3" />
                        <span className="truncate">{counselor.phone}</span>
                      </span>
                      {/* <span className="flex items-center gap-1">
                        <MailIcon className="w-3 h-3" />
                        <span className="truncate">{counselor.email}</span>
                      </span> */}
                    </div>
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-white p-3 sm:p-4 rounded-lg border border-[#8fbc8f]/20">
                    <div className="flex items-center gap-2 mb-2">
                      <CalendarIcon className="w-4 h-4 text-[#2d5a5a]" />
                      <span className="font-medium text-[#2d5a5a] text-sm">Date</span>
                    </div>
                    <p className="text-xs sm:text-sm">{formatDate(selectedDateObj)}</p>
                  </div>
                  <div className="bg-white p-3 sm:p-4 rounded-lg border border-[#8fbc8f]/20">
                    <div className="flex items-center gap-2 mb-2">
                      <ClockIcon className="w-4 h-4 text-[#2d5a5a]" />
                      <span className="font-medium text-[#2d5a5a] text-sm">Time</span>
                    </div>
                    <p className="text-xs sm:text-sm">{selectedSlot.time}</p>
                  </div>
                </div>

                <div className="bg-white p-3 sm:p-4 rounded-lg border border-[#8fbc8f]/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-[#2d5a5a] text-sm">Session Type</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant={bookingDetails.sessionType === 'individual' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setBookingDetails(prev => ({ ...prev, sessionType: 'individual' }))}
                      className={cn(
                        "text-xs sm:text-sm",
                        bookingDetails.sessionType === 'individual' ? 'bg-[#2d5a5a]' : 'border-[#8fbc8f]/30'
                      )}
                    >
                      Individual ({counselor.rate})
                    </Button>
                    {/* <Button
                      variant={bookingDetails.sessionType === 'couples' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setBookingDetails(prev => ({ ...prev, sessionType: 'couples' }))}
                      className={cn(
                        "text-xs sm:text-sm",
                        bookingDetails.sessionType === 'couples' ? 'bg-[#2d5a5a]' : 'border-[#8fbc8f]/30'
                      )}
                    >
                      Couples ($180)
                    </Button> */}
                  </div>
                </div>

                <div className="bg-white p-3 sm:p-4 rounded-lg border border-[#8fbc8f]/20">
                  <label className="block font-medium text-[#2d5a5a] mb-2 text-sm">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    className="w-full p-2 border border-[#8fbc8f]/30 rounded-md text-xs sm:text-sm resize-none"
                    rows={3}
                    placeholder="Any specific topics or concerns you'd like to discuss..."
                    value={bookingDetails.notes}
                    onChange={(e) => setBookingDetails(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleBooking}
                  className="flex-1 bg-[#2d5a5a] hover:bg-[#1e3a3a] text-white text-sm"
                >
                  <CheckIcon className="w-4 h-4 mr-2" />
                  Confirm Appointment
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="text-center py-6 sm:py-8">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckIcon className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-[#2d5a5a] mb-2">
                Appointment Confirmed!
              </h3>
              <p className="text-muted-foreground mb-4 text-sm sm:text-base px-4">
                Your appointment with {counselor.name} has been scheduled for{' '}
                {selectedDateObj && formatDate(selectedDateObj)} at {selectedSlot?.time}.
              </p>
              <div className="bg-[#8fbc8f]/10 p-3 sm:p-4 rounded-lg border border-[#8fbc8f]/20">
                <p className="text-xs sm:text-sm text-[#2d5a5a]">
                  📧 A confirmation email has been sent to you with appointment details and preparation tips.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
