import { FileText, Search, Users, MessageSquare } from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate} from 'react-router-dom';

interface FeatureCardProps {
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    title: string;
    description: string;
}

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => (
  <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-indigo-200 shadow-sm hover:shadow-md transition-all duration-300">
    <div className="h-12 w-12 rounded-lg bg-indigo-50 flex items-center justify-center mb-4">
      <Icon className="h-6 w-6 text-indigo-600" />
    </div>
    <h3 className="text-xl font-semibold text-slate-800 mb-3">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{description}</p>
  </div>
);

const FeaturesSection = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: FileText,
      title: "AI Resume Builder",
      description: "Transform your experience into a compelling resume in seconds. Our AI tailors your resume to match job requirements, highlighting your most relevant skills and achievements."
    },
    {
      icon: Search,
      title: "Smart Job Matching",
      description: "Get personalized job recommendations based on your skills, experience, and preferences. Our algorithm finds positions where you'll have the highest chance of success."
    },
    {
      icon: Users,
      title: "Network Connections",
      description: "Discover valuable LinkedIn connections at your target companies. We identify the most relevant professionals who can help advance your application."
    },
    {
      icon: MessageSquare,
      title: "Outreach Templates",
      description: "Connect with confidence using our professionally crafted message templates. Personalized outreach messages that increase your chances of getting a response."
    }
  ];

  return (
    <section className="py-20 bg-slate-50" id="features">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Everything You Need to Land Your Next Role
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Our comprehensive toolkit streamlines your job search from resume to interview
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-slate-600 mb-6">
            Ready to accelerate your job search?
          </p>
          <Button onClick={() => navigate('/jobs')} variant={"jobify"} size={"xxl"} className="rounded-4xl">
            Get Started
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;