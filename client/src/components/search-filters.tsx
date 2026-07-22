import { useState } from "react";
import { MapPin, Palette, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SearchFilters() {
  const [filters, setFilters] = useState({
    location: "",
    category: "",
    skillLevel: "",
    priceRange: "",
    timeOfDay: {
      morning: false,
      afternoon: false,
      evening: false,
    },
    duration: {
      short: false,
      medium: false,
      long: false,
    },
    availability: {
      today: false,
      thisWeek: false,
    },
  });

  const [sortBy, setSortBy] = useState("relevance");

  const clearFilters = () => {
    setFilters({
      location: "",
      category: "",
      skillLevel: "",
      priceRange: "",
      timeOfDay: { morning: false, afternoon: false, evening: false },
      duration: { short: false, medium: false, long: false },
      availability: { today: false, thisWeek: false },
    });
  };

  const applyFilters = () => {
    // In a real app, this would trigger a search with the current filters
    console.log("Applying filters:", filters);
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display font-bold text-primary-900 mb-4">Find Your Perfect Class</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Use our advanced filters to discover classes tailored to your schedule, skill level, and interests</p>
        </div>
        
        {/* Advanced Filter Panel */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Enter city or zip code"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-colors duration-200"
                />
              </div>
            </div>
            
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
                <SelectTrigger className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-colors duration-200">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="painting">Painting</SelectItem>
                  <SelectItem value="pottery">Pottery</SelectItem>
                  <SelectItem value="sculpture">Sculpture</SelectItem>
                  <SelectItem value="drawing">Drawing</SelectItem>
                  <SelectItem value="photography">Photography</SelectItem>
                  <SelectItem value="digital-art">Digital Art</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Skill Level Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Skill Level</label>
              <Select value={filters.skillLevel} onValueChange={(value) => setFilters({ ...filters, skillLevel: value })}>
                <SelectTrigger className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-colors duration-200">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Price Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <Select value={filters.priceRange} onValueChange={(value) => setFilters({ ...filters, priceRange: value })}>
                <SelectTrigger className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-colors duration-200">
                  <SelectValue placeholder="Any Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Price</SelectItem>
                  <SelectItem value="under-50">Under $50</SelectItem>
                  <SelectItem value="50-100">$50 - $100</SelectItem>
                  <SelectItem value="100-200">$100 - $200</SelectItem>
                  <SelectItem value="over-200">Over $200</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Additional Filters */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Time Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time of Day</label>
                <div className="flex flex-wrap gap-2">
                  {["morning", "afternoon", "evening"].map((time) => (
                    <Button
                      key={time}
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters({
                        ...filters,
                        timeOfDay: {
                          ...filters.timeOfDay,
                          [time]: !filters.timeOfDay[time as keyof typeof filters.timeOfDay]
                        }
                      })}
                      className={`px-4 py-2 border border-gray-200 rounded-full text-sm transition-colors duration-200 ${
                        filters.timeOfDay[time as keyof typeof filters.timeOfDay]
                          ? "bg-accent-50 border-accent-300 text-accent-600"
                          : "hover:bg-accent-50 hover:border-accent-300"
                      }`}
                    >
                      {time.charAt(0).toUpperCase() + time.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Duration Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: "short", label: "Under 2 hours" },
                    { key: "medium", label: "2-4 hours" },
                    { key: "long", label: "Full day" }
                  ].map(({ key, label }) => (
                    <Button
                      key={key}
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters({
                        ...filters,
                        duration: {
                          ...filters.duration,
                          [key]: !filters.duration[key as keyof typeof filters.duration]
                        }
                      })}
                      className={`px-4 py-2 border border-gray-200 rounded-full text-sm transition-colors duration-200 ${
                        filters.duration[key as keyof typeof filters.duration]
                          ? "bg-accent-50 border-accent-300 text-accent-600"
                          : "hover:bg-accent-50 hover:border-accent-300"
                      }`}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Availability Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <Checkbox
                      checked={filters.availability.today}
                      onCheckedChange={(checked) => setFilters({
                        ...filters,
                        availability: { ...filters.availability, today: checked as boolean }
                      })}
                      className="w-4 h-4 text-accent-600 focus:ring-accent-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Today</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox
                      checked={filters.availability.thisWeek}
                      onCheckedChange={(checked) => setFilters({
                        ...filters,
                        availability: { ...filters.availability, thisWeek: checked as boolean }
                      })}
                      className="w-4 h-4 text-accent-600 focus:ring-accent-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">This Week</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Filter Actions */}
          <div className="mt-6 flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
            >
              Clear All Filters
            </Button>
            <Button
              onClick={applyFilters}
              className="bg-accent-600 text-white hover:bg-accent-700 transition-colors duration-200 font-semibold"
            >
              Apply Filters
            </Button>
          </div>
        </div>
        
        {/* Search Results Summary */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-gray-600">
            <span>147 classes</span> found in <span>"San Francisco, CA"</span>
          </div>
          <div className="flex items-center space-x-4">
            <label className="text-sm text-gray-600">Sort by:</label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-500 focus:border-transparent w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="distance">Distance</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </section>
  );
}
