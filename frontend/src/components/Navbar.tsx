import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "../providers/useAuth";
import logo from "../assets/logo.png";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen || userMenuOpen) {
        const nav = document.getElementById("main-nav");
        if (nav && event.target && !nav.contains(event.target as Node)) {
          setIsOpen(false);
          setUserMenuOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, userMenuOpen]);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
  };

  const getTextColor = (isActive = false) => {
    let baseColor = isScrolled ? "text-gray-700" : "text-gray-800";
    return isActive ? `${baseColor} font-medium` : baseColor;
  };

  return (
    <nav
      id="main-nav"
      className={`flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4 fixed top-0 left-0 right-0 z-50 transition-all duration-300
                ${isScrolled ? "bg-white shadow-md" : "bg-transparent"}`}
    >
      {/* Logo and Brand */}
      <div className="flex items-center">
        <Link to="/" className="flex items-center space-x-2">
          <img
            src={logo}
            alt="Jobify Logo"
            className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
          />
          <span
            className={`text-base sm:text-lg md:text-xl font-bold ${getTextColor()}`}
          >
            Jobify
          </span>
        </Link>
      </div>

      {/* Mobile Menu Button */}
      <div className="flex items-center lg:hidden">
        <button 
          className="p-2 ml-3 rounded-md hover:bg-gray-100" 
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <X size={22} className={getTextColor()} />
          ) : (
            <Menu size={22} className={getTextColor()} />
          )}
        </button>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center justify-between flex-grow mx-8">
        <div className="flex items-center space-x-6 xl:space-x-8">
          <Link
            to="/"
            className={`hover:text-gray-600 transition-colors ${location.pathname === "/" ? getTextColor(true) : getTextColor()}`}
          >
            Home
          </Link>
          <Link
            to="/resume"
            className={`hover:text-gray-600 transition-colors ${location.pathname === "/resume" ? getTextColor(true) : getTextColor()}`}
          >
            Resume Builder
          </Link>
          <Link
            to="/jobs"
            className={`hover:text-gray-600 transition-colors ${location.pathname === "/jobs" ? getTextColor(true) : getTextColor()}`}
          >
            Search Jobs
          </Link>
        </div>
      
        {/* Auth Controls - Desktop */}
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="relative">
              <div 
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700">
                  {user?.name?.charAt(0) || "U"}
                </div>
                <span className="text-sm hidden md:inline">
                  {user?.name?.split(" ")[0]}
                </span>
                {userMenuOpen ? 
                  <ChevronUp size={16} className={getTextColor()} /> : 
                  <ChevronDown size={16} className={getTextColor()} />
                }
              </div>
              
              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <Link 
                    to="/profile" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex space-x-3">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Link to="/login">Sign In</Link>
              </Button>
              <Button variant="jobify" size="sm">
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-lg z-40 border-t border-gray-100">
          <div className="px-4 py-3 space-y-3">
            <Link
              to="/"
              className={`block py-2 px-3 rounded-md ${location.pathname === "/" ? "bg-gray-100 font-medium" : ""}`}
            >
              Home
            </Link>
            <Link
              to="/resume"
              className={`block py-2 px-3 rounded-md ${location.pathname === "/resume" ? "bg-gray-100 font-medium" : ""}`}
            >
              Resume Builder
            </Link>
            <Link
              to="/jobs"
              className={`block py-2 px-3 rounded-md ${location.pathname === "/jobs" ? "bg-gray-100 font-medium" : ""}`}
            >
              Search Jobs
            </Link>
            
            {/* Auth Controls - Mobile */}
            {isAuthenticated ? (
              <div className="pt-2 border-t border-gray-200">
                {user?.name && (
                  <p className="text-sm text-gray-600 px-3 py-1">
                    Signed in as {user.name}
                  </p>
                )}
                <Link
                  to="/profile"
                  className="block py-2 px-3 rounded-md"
                >
                  Profile
                </Link>
                <button
                  className="w-full text-left py-2 px-3 rounded-md text-red-600"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-3 pt-3 border-t border-gray-200">
                <Button variant="outline" className="w-full justify-center">
                  <Link to="/login" className="w-full text-center">Sign In</Link>
                </Button>
                <Button variant="jobify" className="w-full justify-center">
                  <Link to="/signup" className="w-full text-center">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;