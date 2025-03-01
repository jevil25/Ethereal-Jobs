import { useState, useEffect } from 'react';
import logo from "../../assets/logo.png";

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            setIsScrolled(scrollPosition > 50); // Change background after 50px scroll
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (event: any, id: string) => {
        event.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    return (
        <nav 
            className={`flex items-center justify-between px-4 md:px-6 py-4 fixed top-0 left-0 right-0 z-10 transition-all duration-300
                ${isScrolled 
                    ? 'bg-white shadow-md' 
                    : 'bg-transparent'}`}
        >
            <div className="flex items-center space-x-2 hover:cursor-pointer" onClick={(e) => scrollToSection(e, "hero")}>
                <img src={logo} alt="Jobify Logo" className="w-10 h-10 md:w-14 md:h-14" />
                <span className={`text-lg md:text-xl font-bold ${isScrolled ? 'text-gray-800' : 'text-gray-900'}`}>
                    Jobify
                </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-4 md:space-x-6">
                <a 
                    onClick={(e) => scrollToSection(e, "features")} 
                    className={`hover:text-gray-600 hover:cursor-pointer transition-colors
                        ${isScrolled ? 'text-gray-700' : 'text-gray-800'}`}
                >
                    Features
                </a>
                <a 
                    onClick={(e) => scrollToSection(e, "resume")}
                    className={`hover:text-gray-600 hover:cursor-pointer transition-colors
                        ${isScrolled ? 'text-gray-700' : 'text-gray-800'}`}
                >
                    Resume
                </a>
                <a
                    onClick={(e) => scrollToSection(e, "insider-connections")}
                    className={`hover:text-gray-600 hover:cursor-pointer transition-colors
                        ${isScrolled ? 'text-gray-700' : 'text-gray-800'}`}
                >
                    Insider Connections
                </a>
                <a 
                    onClick={(e) => scrollToSection(e, "about")}
                    className={`hover:text-gray-600 hover:cursor-pointer transition-colors
                        ${isScrolled ? 'text-gray-700' : 'text-gray-800'}`}
                >
                    About Us
                </a>
            </div>

            <div className="flex items-center space-x-2 md:space-x-4">
                <button 
                    className={`px-2 md:px-4 py-2 hover:text-gray-900 hover:cursor-pointer transition-colors
                        ${isScrolled ? 'text-gray-700' : 'text-gray-800'}`}
                >
                    SIGN IN
                </button>
                <button className="px-2 md:px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 hover:cursor-pointer transition-colors">
                    JOIN NOW
                </button>
            </div>
        </nav>
    );
};

export default Navbar;