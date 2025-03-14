import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "../providers/useAuth";
import logo from "../assets/logo.png";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50); // Change background after 50px scroll
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <nav
      className={`flex items-center justify-between px-4 md:px-6 py-4 fixed top-0 left-0 right-0 z-10 transition-all duration-300
                ${isScrolled ? "bg-white shadow-md" : "bg-transparent"}`}
    >
      <div className="flex items-center space-x-2 hover:cursor-pointer">
        <Link to="/" className="flex items-center space-x-2">
          <img
            src={logo}
            alt="Jobify Logo"
            className="w-10 h-10 md:w-14 md:h-14"
          />
          <span
            className={`text-lg md:text-xl font-bold ${isScrolled ? "text-gray-800" : "text-gray-900"}`}
          >
            Jobify
          </span>
        </Link>
      </div>

      {/* Mobile Menu Button */}
      <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? (
          <X
            size={24}
            className={isScrolled ? "text-gray-700" : "text-gray-800"}
          />
        ) : (
          <Menu
            size={24}
            className={isScrolled ? "text-gray-700" : "text-gray-800"}
          />
        )}
      </button>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center space-x-4 md:space-x-6">
        <Link
          to="/"
          className={`hover:text-gray-600 transition-colors
                        ${isScrolled ? "text-gray-700" : "text-gray-800"}
                        ${location.pathname === "/" ? "font-medium" : ""}`}
        >
          Home
        </Link>
        <Link
          to="/resume"
          className={`hover:text-gray-600 transition-colors
                        ${isScrolled ? "text-gray-700" : "text-gray-800"}
                        ${location.pathname === "/resume" ? "font-medium" : ""}`}
        >
          Resume Builder
        </Link>
        <Link
          to="/jobs"
          className={`hover:text-gray-600 transition-colors
                        ${isScrolled ? "text-gray-700" : "text-gray-800"}
                        ${location.pathname === "/jobs" ? "font-medium" : ""}`}
        >
          Search Jobs
        </Link>
      </div>

      {/* Auth Controls */}
      <div className="flex items-center space-x-2 md:space-x-4">
        {isAuthenticated ? (
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700 hidden md:inline">
              Hello, {user?.name.split(" ")[0]}
            </span>
            <div className="relative">
              <Button
                type="button"
                className="px-4 py-2 rounded-full text-sm font-medium hover:cursor-pointer"
                onClick={handleLogout}
                variant="jobify"
              >
                Logout
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex space-x-4">
            <Button variant={"outline"}>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button variant={"jobify"}>
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-md p-4 space-y-4 z-20">
          <Link
            to="/"
            className={`block py-2 hover:text-gray-600 transition-colors ${location.pathname === "/" ? "font-medium" : ""}`}
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/resume"
            className={`block py-2 hover:text-gray-600 transition-colors ${location.pathname === "/resume" ? "font-medium" : ""}`}
            onClick={() => setIsOpen(false)}
          >
            Resume Builder
          </Link>
          <Link
            to="/jobs"
            className={`block py-2 hover:text-gray-600 transition-colors ${location.pathname === "/jobs" ? "font-medium" : ""}`}
            onClick={() => setIsOpen(false)}
          >
            Search Jobs
          </Link>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
