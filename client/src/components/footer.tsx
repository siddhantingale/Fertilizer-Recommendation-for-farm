import { Link } from "wouter";
import { Palette, Facebook, Instagram, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Footer() {
  return (
    <footer className="bg-primary-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-accent-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Palette className="text-white w-4 h-4" />
              </div>
              <span className="text-xl font-display font-semibold">ArtisanFind</span>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Connecting art enthusiasts with talented local instructors. Discover your creative potential through hands-on learning experiences.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          {/* Classes Column */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Browse Classes</h3>
            <ul className="space-y-3">
              <li><Link href="/classes/painting" className="text-gray-300 hover:text-white transition-colors duration-200">Painting Classes</Link></li>
              <li><Link href="/classes/pottery" className="text-gray-300 hover:text-white transition-colors duration-200">Pottery & Ceramics</Link></li>
              <li><Link href="/classes/sculpture" className="text-gray-300 hover:text-white transition-colors duration-200">Sculpture Workshops</Link></li>
              <li><Link href="/classes/drawing" className="text-gray-300 hover:text-white transition-colors duration-200">Drawing & Sketching</Link></li>
              <li><Link href="/classes/photography" className="text-gray-300 hover:text-white transition-colors duration-200">Photography</Link></li>
              <li><Link href="/classes/digital-art" className="text-gray-300 hover:text-white transition-colors duration-200">Digital Art</Link></li>
              <li><Link href="/classes" className="text-accent-400 hover:text-accent-300 transition-colors duration-200">View All Classes</Link></li>
            </ul>
          </div>
          
          {/* Company Column */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Company</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-gray-300 hover:text-white transition-colors duration-200">About ArtisanFind</Link></li>
              <li><Link href="/instructors" className="text-gray-300 hover:text-white transition-colors duration-200">Meet Our Instructors</Link></li>
              <li><Link href="/locations" className="text-gray-300 hover:text-white transition-colors duration-200">Locations</Link></li>
              <li><Link href="/teach" className="text-gray-300 hover:text-white transition-colors duration-200">Teach on ArtisanFind</Link></li>
              <li><Link href="/blog" className="text-gray-300 hover:text-white transition-colors duration-200">Art Blog</Link></li>
              <li><Link href="/careers" className="text-gray-300 hover:text-white transition-colors duration-200">Careers</Link></li>
            </ul>
          </div>
          
          {/* Support Column */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Support</h3>
            <ul className="space-y-3">
              <li><Link href="/help" className="text-gray-300 hover:text-white transition-colors duration-200">Help Center</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-white transition-colors duration-200">Contact Us</Link></li>
              <li><Link href="/safety" className="text-gray-300 hover:text-white transition-colors duration-200">Safety Guidelines</Link></li>
              <li><Link href="/cancellation" className="text-gray-300 hover:text-white transition-colors duration-200">Cancellation Policy</Link></li>
              <li><Link href="/accessibility" className="text-gray-300 hover:text-white transition-colors duration-200">Accessibility</Link></li>
              <li><Link href="/sitemap" className="text-gray-300 hover:text-white transition-colors duration-200">Sitemap</Link></li>
            </ul>
          </div>
        </div>
        
        {/* Newsletter Signup */}
        <div className="border-t border-primary-800 pt-8 mb-8">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-lg font-semibold mb-4">Stay Creative</h3>
            <p className="text-gray-300 mb-6">Get weekly inspiration, class recommendations, and exclusive offers.</p>
            <div className="flex space-x-3">
              <Input 
                type="email" 
                placeholder="Enter your email"
                className="flex-1 bg-primary-800 border-primary-700 text-white placeholder-gray-400 focus:ring-accent-500 focus:border-transparent"
              />
              <Button className="bg-accent-600 text-white hover:bg-accent-700 transition-colors duration-200 font-semibold">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
        
        {/* Legal Links */}
        <div className="border-t border-primary-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2024 ArtisanFind. All rights reserved.
          </div>
          <div className="flex space-x-6 text-sm">
            <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors duration-200">Privacy Policy</Link>
            <Link href="/terms" className="text-gray-400 hover:text-white transition-colors duration-200">Terms of Service</Link>
            <Link href="/cookies" className="text-gray-400 hover:text-white transition-colors duration-200">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
