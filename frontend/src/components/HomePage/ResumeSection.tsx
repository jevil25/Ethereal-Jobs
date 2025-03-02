import { CheckCircle, FileText } from 'lucide-react';
import Button from './Button';
import { useNavigate } from 'react-router-dom';

const ResumeSection = () => {
    const navigate = useNavigate();
    const benefits = [
        "Customized for each job application",
        "Keyword-optimized for ATS systems",
        "Professional formatting that stands out",
        "Industry-specific templates"
    ];

    return (
        <section id="resume" className="py-20 bg-gradient-to-br from-indigo-50 via-white to-blue-50 scroll-mt-16">
            <div className="container mx-auto px-4">
                {/* Main Headline */}
                <div className="text-center mb-12">
                    <h2 className="text-6xl md:text-7xl lg:text-8xl font-bold text-slate-800 mb-6">
                        Generates
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
                            ATS-Friendly
                        </span>
                        Resumes
                    </h2>
                </div>

                {/* Resume Preview */}
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12 max-w-6xl mx-auto">
                    <div className="w-full lg:w-1/2 space-y-8">
                        <p className="text-2xl md:text-3xl text-slate-600 font-light leading-relaxed">
                            Turn your experience into an
                            <span className="font-semibold text-indigo-600"> interview-winning </span>
                            resume in seconds
                        </p>

                        <div className="space-y-4">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <CheckCircle className="h-6 w-6 text-green-500" />
                                    <span className="text-lg text-slate-700">{benefit}</span>
                                </div>
                            ))}
                        </div>

                        <Button text='Create Your Resume Now' onClick={() => {navigate("/resume")}} />
                    </div>

                    {/* Resume Preview Card */}
                    <div className="w-full lg:w-1/2">
                        <div className="relative">
                            {/* Background decorative elements */}
                            <div className="absolute -top-6 -left-6 w-24 h-24 bg-indigo-100 rounded-full opacity-50"></div>
                            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-100 rounded-full opacity-50"></div>
                            
                            {/* Resume Card */}
                            <div className="relative bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
                                <div className="flex items-center gap-4 mb-6">
                                    <FileText className="h-8 w-8 text-indigo-600" />
                                    <h3 className="text-2xl font-semibold text-slate-800">Your Perfect Resume</h3>
                                </div>
                                
                                {/* Resume Preview Content */}
                                <div className="space-y-4">
                                    <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                                    <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                                    <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                                    <div className="h-4 bg-slate-100 rounded w-2/3"></div>
                                    <div className="h-4 bg-slate-100 rounded w-4/5"></div>
                                </div>

                                {/* Status Indicator */}
                                <div className="mt-8 flex items-center gap-2">
                                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    <span className="text-sm text-green-600 font-medium">ATS-Optimized</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ResumeSection;