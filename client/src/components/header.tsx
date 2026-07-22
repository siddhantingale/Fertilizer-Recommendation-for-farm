import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Menu, X, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: "Browse Classes", href: "/classes" },
    { name: "Workshops", href: "/classes?type=workshop" },
    { name: "Instructors", href: "/instructors" },
    { name: "Locations", href: "/locations" },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-accent-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Palette className="text-white w-4 h-4" />
              </div>
              <span className="text-xl font-display font-semibold text-primary-800">
                ArtisanFind
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`font-medium transition-colors duration-200 ${
                  location === item.href || location.startsWith(item.href.split('?')[0])
                    ? "text-accent-600"
                    : "text-gray-700 hover:text-accent-600"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <button className="text-gray-700 hover:text-accent-600 transition-colors duration-200 font-medium hidden sm:block">
              Teach on ArtisanFind
            </button>
            <Button className="bg-accent-600 text-white hover:bg-accent-700 transition-colors duration-200 font-medium">
              Sign In
            </Button>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-accent-600 transition-colors duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  location === item.href || location.startsWith(item.href.split('?')[0])
                    ? "text-accent-600 bg-accent-50"
                    : "text-gray-700 hover:text-accent-600 hover:bg-gray-50"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <button className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-accent-600 hover:bg-gray-50 transition-colors duration-200">
              Teach on ArtisanFind
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
