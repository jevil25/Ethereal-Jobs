import { Link } from 'react-router-dom';
import { Linkedin, Twitter, Facebook, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">Jobify</h3>
            <p className="text-gray-600">
              AI-powered job search platform connecting talented professionals with their dream careers.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-600">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-800">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-pink-600">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* For Job Seekers */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">For Job Seekers</h3>
            <ul className="space-y-3">
              <li><Link to="/jobs" className="text-gray-600 hover:text-blue-600">Browse Jobs</Link></li>
              <li><Link to="/companies" className="text-gray-600 hover:text-blue-600">Browse Companies</Link></li>
              <li><Link to="/salary" className="text-gray-600 hover:text-blue-600">Salary Guide</Link></li>
              <li><Link to="/resume-builder" className="text-gray-600 hover:text-blue-600">Resume Builder</Link></li>
              <li><Link to="/career-advice" className="text-gray-600 hover:text-blue-600">Career Advice</Link></li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">For Employers</h3>
            <ul className="space-y-3">
              <li><Link to="/post-job" className="text-gray-600 hover:text-blue-600">Post a Job</Link></li>
              <li><Link to="/pricing" className="text-gray-600 hover:text-blue-600">Pricing</Link></li>
              <li><Link to="/employer-resources" className="text-gray-600 hover:text-blue-600">Resources</Link></li>
              <li><Link to="/talent-search" className="text-gray-600 hover:text-blue-600">Search Talent</Link></li>
              <li><Link to="/employer-branding" className="text-gray-600 hover:text-blue-600">Employer Branding</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-gray-600 hover:text-blue-600">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-600 hover:text-blue-600">Contact</Link></li>
              <li><Link to="/press" className="text-gray-600 hover:text-blue-600">Press</Link></li>
              <li><Link to="/blog" className="text-gray-600 hover:text-blue-600">Blog</Link></li>
              <li><Link to="/careers" className="text-gray-600 hover:text-blue-600">Careers</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-600">
              © {new Date().getFullYear()} Jobify. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm text-gray-600">
              <Link to="/privacy" className="hover:text-blue-600">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-blue-600">Terms of Service</Link>
              <Link to="/cookies" className="hover:text-blue-600">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;