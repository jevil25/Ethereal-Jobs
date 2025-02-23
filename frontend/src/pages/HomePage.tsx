import { useNavigate } from "react-router-dom";
import HeroSection from "../components/HomePage/HeroSection";
import FeaturesSection from "../components/HomePage/FeaturesSection";
import ResumeSection from "../components/HomePage/ResumeSection";
import Navbar from "../components/HomePage/Navbar";
import AboutUsSection from "../components/HomePage/AboutUsSection";
import InsiderConnectionsSection from "../components/HomePage/InsiderConnectionsSection";
import Footer from "../components/HomePage/Footer";

const HomePage = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-white">
            <Navbar />
            <HeroSection navigate={navigate} />
            <FeaturesSection />
            <ResumeSection />
            <InsiderConnectionsSection />
            <AboutUsSection />
            <Footer />
        </div>
    );
};

export default HomePage;