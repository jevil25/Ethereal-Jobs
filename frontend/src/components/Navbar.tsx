import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NavBar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-blue-600 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="text-2xl font-bold">
                    Jobify
                </Link>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
                </button>

                {/* Desktop & Mobile Menu */}
                <ul
                    className={`md:flex md:space-x-6 absolute md:static left-0 w-full md:w-auto bg-blue-600 md:bg-transparent transition-all duration-300 ease-in ${
                        isOpen ? "top-16 p-4 space-y-4 md:space-y-0" : "top-[-200px]"
                    }`}
                >
                    <li>
                        <Link to="/" className="block px-4 py-2 md:p-0 hover:underline transition-all duration-300 ease-in">
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link to="/resume" className="block px-4 py-2 md:p-0 hover:underline transition-all duration-300 ease-in">
                            Resume Builder
                        </Link>
                    </li>
                    <li>
                        <Link to="/" className="block px-4 py-2 md:p-0 hover:underline transition-all duration-300 ease-in">
                            Search Jobs
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default NavBar;
