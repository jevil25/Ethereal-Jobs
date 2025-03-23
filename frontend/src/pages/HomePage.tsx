import { useNavigate } from "react-router-dom";
import HeroSection from "../components/HomePage/HeroSection";
import Navbar from "../components/HomePage/Navbar";

const HomePage = () => {
  const navigate = useNavigate();
  return (
    <div className="w-full bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      <HeroSection navigate={navigate} />
    </div>
  );
};

export default HomePage;
