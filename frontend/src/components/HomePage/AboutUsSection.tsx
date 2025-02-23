import { Building, Users, Sparkles, Trophy } from 'lucide-react';

const AboutUsSection = () => {
  const features = [
    {
      icon: <Sparkles className="w-8 h-8 text-blue-600" />,
      title: "AI-Powered Matching",
      description: "Our advanced algorithms analyze thousands of jobs to find your perfect match, considering skills, culture fit, and career goals."
    },
    {
      icon: <Users className="w-8 h-8 text-blue-600" />,
      title: "Network Intelligence",
      description: "Connect with industry insiders and leverage warm introductions to unlock hidden job opportunities in your desired field."
    },
    {
      icon: <Trophy className="w-8 h-8 text-blue-600" />,
      title: "Proven Success",
      description: "Join thousands of professionals who've accelerated their careers through our platform, with a 78% interview success rate."
    },
    {
      icon: <Building className="w-8 h-8 text-blue-600" />,
      title: "Top Employers",
      description: "Partner with Fortune 500 companies and fast-growing startups looking for talented professionals like you."
    }
  ];

  return (
    <section className="py-24 bg-gray-50" id="about">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Revolutionizing Your Job Search Journey
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            We're not just another job board - we're your career acceleration partner. Our AI-powered platform combines cutting-edge technology with human expertise to help you land your dream job faster than ever.
          </p>
          <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of successful professionals who've transformed their careers with our AI-powered platform. We're committed to making your job search smarter, faster, and more effective.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutUsSection;