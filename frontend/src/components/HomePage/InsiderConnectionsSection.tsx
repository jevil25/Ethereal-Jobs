import { Users, MessageSquare, Building, CheckCircle } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

const InsiderConnectionsSection = () => {
  const navigate = useNavigate();
  return (
    <section className="py-24 bg-white" id="insider-connections">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Unlock Your Network's Potential
            </h2>
            <p className="text-xl text-gray-600">
              Find the right connections at your dream companies and reach out
              with AI-crafted personalized messages.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    Smart Connection Finding
                  </h3>
                  <p className="text-gray-600">
                    Automatically discover relevant connections at your target
                    companies
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    Perfect Messages
                  </h3>
                  <p className="text-gray-600">
                    Get customized outreach messages that get responses
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Building className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Inside Access</h3>
                  <p className="text-gray-600">
                    Turn cold applications into warm referrals
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-xl shadow-sm p-6">
              <div className="flex items-start gap-4 mb-4">
                <img
                  src="https://randomuser.me/api/portraits/women/85.jpg"
                  alt="Sarah Chen"
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="font-semibold">Sarah Chen</h3>
                  <p className="text-gray-600 text-sm">
                    Senior Software Engineer at Google
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <Users className="w-4 h-4" />
                    <span>12 mutual connections</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                  <p className="text-sm text-gray-600">
                    AI-crafted message based on your profile, the job, and your
                    connection
                  </p>
                </div>
                <p className="text-sm text-gray-700">
                  "Hi Sarah, I noticed you work at Google as a Senior Software
                  Engineer. I'm really interested in the Software Engineer role
                  and would love to learn more about your experience. Would you
                  be open to a quick chat about the team and culture?"
                </p>
              </div>

              <div className="flex justify-end">
                <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:cursor-pointer">
                  <MessageSquare className="w-4 h-4" />
                  Send Message
                </button>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button
              onClick={() => navigate("/jobs")}
              variant={"jobify"}
              size={"xxl"}
              className="rounded-4xl"
            >
              Find Your Connections
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InsiderConnectionsSection;
