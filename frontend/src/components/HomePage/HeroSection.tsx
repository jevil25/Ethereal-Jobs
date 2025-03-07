import { NavigateFunction } from "react-router-dom";
import { Button } from "../ui/button";

interface HeroSectionProps {
    navigate: NavigateFunction;
}

const HeroSection = ({ navigate }: HeroSectionProps) => {
    return (
      <main className="container mx-auto px-4 pt-24 text-center flex flex-col items-center justify-center min-h-screen" id="hero">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center bg-yellow-50 border border-yellow-200 rounded-full px-4 py-2 mb-8">
            <span className="flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
            </span>
            <p className="text-yellow-800 text-sm font-medium">
              Currently in Development
            </p>
          </div>
            
          <h1 className="text-4xl md:text-6xl font-bold mb-4 md:mb-6">
            Your Dream Job Is One Connection Away
          </h1>
          <h2 className="text-3xl md:text-5xl font-black mb-6 md:mb-8 bg-gradient-to-r from-blue-600 to-blue-400 text-transparent bg-clip-text">
            AI-Powered Job Search & Networking
          </h2>
          <p className="text-xl md:text-xl mb-8 md:mb-12 max-w-2xl mx-auto">
            Land interviews faster with personalized job matches, AI-crafted resumes, and warm introductions to industry insiders - all in under 60 seconds.
          </p>
          <div className="flex flex-col gap-4 justify-center items-center">
            <Button onClick={() => navigate('/jobs')} variant={"jobify"} size={"xxl"} className="rounded-4xl">
              Launch Your Career
            </Button>
            <p className="text-sm text-gray-600">
              Join thousands of successful job seekers
            </p>
          </div>
        </div>
      </main>
    );
};

export default HeroSection;