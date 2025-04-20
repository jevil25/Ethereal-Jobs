import { useNavigate } from "react-router-dom";
import HeroSection from "../components/HomePage/HeroSection";
import Navbar from "../components/HomePage/Navbar";
import { Helmet } from "react-helmet-async";

const HomePage = () => {
  const navigate = useNavigate();
  
  // Schema.org structured data for the homepage
  const homePageSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Ethereal Jobs",
    "url": "https://www.etherealjobs.com/",
    "description": "AI-powered job matching platform connecting talent with opportunities. Find your dream job with personalized matches, resume optimization, and industry connections.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.etherealjobs.com/jobs?job_title={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <Helmet>
        <title>Ethereal Jobs - Find Your Dream Job with AI-Powered Matching</title>
        <meta name="description" content="Land interviews faster with personalized job matches, AI-crafted resumes, and warm introductions to industry insiders - all in under 60 seconds." />
        <meta name="keywords" content="job search, AI resume builder, career opportunities, job matching, professional networking, job recommendations" />
        <link rel="canonical" href="https://www.etherealjobs.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Ethereal Jobs - AI-Powered Job Matching" />
        <meta property="og:description" content="Connect with the perfect job opportunities using AI-driven matching and optimization." />
        <meta property="og:url" content="https://www.etherealjobs.com/" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Ethereal Jobs - Find Your Dream Job" />
        <meta name="twitter:description" content="AI-powered job matching platform for career success." />
        <script type="application/ld+json">
          {JSON.stringify(homePageSchema)}
        </script>
      </Helmet>
      
      <div className="w-full bg-gradient-to-b from-slate-50 to-white">
        <Navbar />
        <HeroSection navigate={navigate} />
      </div>
    </>
  );
};

export default HomePage;
