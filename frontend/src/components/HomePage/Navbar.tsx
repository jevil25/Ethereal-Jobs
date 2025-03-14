import { useState, useEffect } from "react";
import logo from "../../assets/logo.png";
import AuthForms from "../Auth/AuthForms";
import { useAuth } from "../../providers/useAuth";
import { useSearchParams } from "react-router-dom";
import { Button } from "../ui/button";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSignIn, setIsSignIn] = useState(true);
  const { user, isAuthenticated, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchParams] = useSearchParams();
  const [showPleaseLogin, setShowPleaseLogin] = useState(false);

  const handleLogout = () => {
    setShowPleaseLogin(false);
    logout();
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50); // Change background after 50px scroll
    };

    const login = searchParams.get("login");
    const featureBox = searchParams.get("feature-box");
    if (login === "true") {
      handleAuthClick(true);
      if (featureBox === "true") setShowPleaseLogin(true);
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [searchParams]);

  const scrollToSection = (
    event: React.MouseEvent<HTMLAnchorElement | HTMLDivElement, MouseEvent>,
    id: string,
  ) => {
    event.preventDefault();
    // check if home page
    if (window.location.pathname !== "/") {
      window.location.href = `/#${id}`;
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleAuthClick = (signIn: boolean) => {
    setShowPleaseLogin(false);
    setIsSignIn(signIn);
    setShowAuthModal(true);
  };

  return (
    <>
      <nav
        className={`flex items-center justify-between px-4 md:px-6 py-4 fixed top-0 left-0 right-0 z-10 transition-all duration-300
                    ${isScrolled ? "bg-white shadow-md" : "bg-transparent"}`}
      >
        <div
          className="flex items-center space-x-2 hover:cursor-pointer"
          onClick={(e) => scrollToSection(e, "hero")}
        >
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
        </div>

        <div className="hidden md:flex items-center space-x-4 md:space-x-6">
          <a
            onClick={(e) => scrollToSection(e, "features")}
            className={`hover:text-gray-600 hover:cursor-pointer transition-colors
                            ${isScrolled ? "text-gray-700" : "text-gray-800"}`}
          >
            Features
          </a>
          <a
            onClick={(e) => scrollToSection(e, "resume")}
            className={`hover:text-gray-600 hover:cursor-pointer transition-colors
                            ${isScrolled ? "text-gray-700" : "text-gray-800"}`}
          >
            Resume
          </a>
          <a
            onClick={(e) => scrollToSection(e, "insider-connections")}
            className={`hover:text-gray-600 hover:cursor-pointer transition-colors
                            ${isScrolled ? "text-gray-700" : "text-gray-800"}`}
          >
            Insider Connections
          </a>
          <a
            onClick={(e) => scrollToSection(e, "about")}
            className={`hover:text-gray-600 hover:cursor-pointer transition-colors
                            ${isScrolled ? "text-gray-700" : "text-gray-800"}`}
          >
            About Us
          </a>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
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
              <Button onClick={() => handleAuthClick(true)} variant={"outline"}>
                Sign In
              </Button>
              <Button onClick={() => handleAuthClick(false)} variant={"jobify"}>
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Render auth forms modal when showAuthForms is true */}
      {showAuthModal && !isAuthenticated && (
        <AuthForms
          isSignIn={isSignIn}
          setIsSignIn={setIsSignIn}
          onClose={() => setShowAuthModal(false)}
          showPleaseLogin={showPleaseLogin}
        />
      )}
    </>
  );
};

export default Navbar;
