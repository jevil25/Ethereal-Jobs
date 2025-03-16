import React from "react";
import { FormData } from "../../api/types";

interface MainResumeProps {
  name: string | undefined;
  resumeData: FormData;
}

const MainResume = React.forwardRef<HTMLDivElement, MainResumeProps>(
  ({ name, resumeData }, ref) => {
    return (
      <div className="p-8 bg-white rounded-lg" ref={ref}>
        <div className="mb-10 border-b pb-6">
          <h1 className="text-4xl font-bold mb-3">{name || ""}</h1>
          <p className="text-gray-600 text-xl">
            {resumeData.personalInfo.headline || "Professional Resume"}
          </p>
          <div className="flex flex-wrap gap-4 text-gray-600">
            {resumeData.personalInfo.location && (
              <span className="flex items-center gap-1">
                📍 {resumeData.personalInfo.location}
              </span>
            )}
            {resumeData.personalInfo.phone && (
              <span className="flex items-center gap-1">
                📱 {resumeData.personalInfo.phone}
              </span>
            )}
            {resumeData.personalInfo.website && (
              <span className="flex items-center gap-1">
                🔗 {resumeData.personalInfo.website}
              </span>
            )}
          </div>
        </div>

        {/* Skills Section */}
        {resumeData.skills.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {resumeData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Experience Section */}
        {resumeData.experience.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Work Experience
            </h2>
            {resumeData.experience.map((exp, index) => (
              <div key={index} className="mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">{exp.title}</h3>
                    <p className="text-gray-700 font-medium">{exp.company}</p>
                  </div>
                  <div className="text-gray-600 text-sm">
                    {exp.startDate} - {exp.endDate || "Present"}
                  </div>
                </div>
                <p className="text-gray-600 mt-2">{exp.location}</p>
                <ul className="mt-2 list-disc pl-5">
                  {exp.description.split("\n").map((line, index) => (
                    <li
                      className="whitespace-pre-line text-justify mb-1"
                      key={index}
                    >
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Education Section */}
        {resumeData.education.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Education</h2>
            {resumeData.education.map((edu, index) => (
              <div key={index} className="mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">{edu.degree}</h3>
                    <p className="text-gray-700 font-medium">{edu.school}</p>
                  </div>
                  <div className="text-gray-600 text-sm">
                    {edu.startDate} - {edu.endDate || "Present"}
                  </div>
                </div>
                <p className="mt-2">{edu.fieldOfStudy}</p>
              </div>
            ))}
          </div>
        )}

        {/* Projects Section */}
        {resumeData.projects.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Projects</h2>
            {resumeData.projects.map((project, index) => (
              <div key={index} className="mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">{project.title}</h3>
                  </div>
                </div>
                <ul className="mt-2 list-disc pl-5">
                  {project.description.split("\n").map((line, index) => (
                    <li
                      className="whitespace-pre-line mb-1 text-justify"
                      key={index}
                    >
                      {line}
                    </li>
                  ))}
                </ul>
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline mt-1 inline-block"
                  >
                    View Project
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Certifications Section */}
        {resumeData.certifications.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Certifications
            </h2>
            {resumeData.certifications.map((cert, index) => (
              <div key={index} className="mb-4">
                <h3 className="text-xl font-semibold">{cert.name}</h3>
                <p className="text-gray-700 text-justify">{cert.description}</p>
                {cert.credentialUrl && (
                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline mt-1 inline-block"
                  >
                    View Certificate
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Job Preferences (optional in preview, can be hidden) */}
        {/* {resumeData.jobPreferences && resumeData.jobPreferences.jobTypes.length > 0 && (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-bold mb-2 text-gray-800">Job Preferences</h2>
            <div className="grid grid-cols-2 gap-4">
                {resumeData.jobPreferences.jobTypes.length > 0 && (
                <div>
                    <p className="text-gray-600 font-medium">Job Types</p>
                    <p>{resumeData.jobPreferences.jobTypes.join(', ')}</p>
                </div>
                )}
                {resumeData.jobPreferences.locations.length > 0 && (
                <div>
                    <p className="text-gray-600 font-medium">Preferred Locations</p>
                    <p>{resumeData.jobPreferences.locations.join(', ')}</p>
                </div>
                )}
                {resumeData.jobPreferences.remotePreference && (
                <div>
                    <p className="text-gray-600 font-medium">Remote Work</p>
                    <p>{resumeData.jobPreferences.remotePreference}</p>
                </div>
                )}
                {resumeData.jobPreferences.salaryExpectation && (
                <div>
                    <p className="text-gray-600 font-medium">Salary Expectation</p>
                    <p>{resumeData.jobPreferences.salaryExpectation}</p>
                </div>
                )}
                <div>
                <p className="text-gray-600 font-medium">Availability</p>
                <p>{resumeData.jobPreferences.immediateStart ? 'Available immediately' : 'Notice period required'}</p>
                </div>
            </div>
            </div>
        )} */}
      </div>
    );
  },
);

export default MainResume;
