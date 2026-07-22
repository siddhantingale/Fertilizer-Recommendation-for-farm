import { useState } from "react";
import { Search, Calendar, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function BookingInterface() {
  const [bookingData, setBookingData] = useState({
    spots: 1,
    experience: "",
    fullName: "",
    email: "",
    specialRequests: "",
  });

  const classFee = 65.00;
  const serviceFee = 5.00;
  const total = classFee + serviceFee;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display font-bold text-primary-900 mb-4">Easy Booking Process</h2>
          <p className="text-gray-600">Reserve your spot in just a few simple steps</p>
        </div>
        
        {/* Booking Steps */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-accent-600 w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-primary-900 mb-2">1. Find Your Class</h3>
            <p className="text-gray-600">Browse our extensive catalog or use filters to find the perfect art class for your skill level and interests.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="text-orange-600 w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-primary-900 mb-2">2. Select Date & Time</h3>
            <p className="text-gray-600">Choose from available time slots with real-time availability updates to secure your preferred schedule.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="text-green-600 w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-primary-900 mb-2">3. Complete Payment</h3>
            <p className="text-gray-600">Secure payment processing with confirmation and class details sent directly to your email.</p>
          </div>
        </div>
        
        {/* Sample Booking Card */}
        <div className="bg-gray-50 rounded-2xl p-8">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start space-x-4">
                  <img 
                    src="https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=120" 
                    alt="Watercolor Fundamentals class" 
                    className="w-20 h-20 rounded-lg object-cover" 
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-primary-900 mb-2">Watercolor Fundamentals</h3>
                    <p className="text-gray-600 mb-2">with Sarah Johnson</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Tomorrow, 2:00 PM</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <i className="fas fa-clock" />
                        <span>2 hours</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <i className="fas fa-map-marker-alt" />
                        <span>0.8 mi away</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary-900">${classFee}</div>
                  <div className="text-sm text-gray-500">per session</div>
                </div>
              </div>
              
              {/* Booking Form */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-semibold text-primary-900 mb-4">Booking Details</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Number of Spots</label>
                    <Select value={bookingData.spots.toString()} onValueChange={(value) => setBookingData({ ...bookingData, spots: parseInt(value) })}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 spot</SelectItem>
                        <SelectItem value="2">2 spots</SelectItem>
                        <SelectItem value="3">3 spots</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                    <Select value={bookingData.experience} onValueChange={(value) => setBookingData({ ...bookingData, experience: value })}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select your level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="complete-beginner">Complete Beginner</SelectItem>
                        <SelectItem value="some-experience">Some Experience</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Contact Information */}
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <Input
                      type="text"
                      placeholder="Enter your full name"
                      value={bookingData.fullName}
                      onChange={(e) => setBookingData({ ...bookingData, fullName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={bookingData.email}
                      onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                    />
                  </div>
                </div>
                
                {/* Special Requests */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests (Optional)</label>
                  <Textarea
                    placeholder="Any special accommodations or questions?"
                    value={bookingData.specialRequests}
                    onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
                    rows={3}
                  />
                </div>
                
                {/* Booking Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mt-6">
                  <h5 className="font-semibold text-primary-900 mb-3">Booking Summary</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Class fee ({bookingData.spots} spot{bookingData.spots > 1 ? 's' : ''})</span>
                      <span>${(classFee * bookingData.spots).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service fee</span>
                      <span>${serviceFee.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
                      <span>Total</span>
                      <span>${((classFee * bookingData.spots) + serviceFee).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-4 mt-6">
                  <Button 
                    variant="outline"
                    className="flex-1"
                  >
                    Save for Later
                  </Button>
                  <Button 
                    className="flex-1 bg-accent-600 text-white hover:bg-accent-700 transition-colors duration-200 font-semibold"
                  >
                    Complete Booking
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
