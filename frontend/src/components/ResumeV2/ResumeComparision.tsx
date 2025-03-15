import React from "react";
import { FormData } from "../../api/types";
import { Card, CardContent } from "../ui/card";

interface ResumeComparisonProps {
  name: string | undefined;
  originalResume: FormData;
  optimizedResume: FormData;
  resumeRef: React.RefObject<HTMLDivElement | null>;
}

const ResumeComparison = ({
  name,
  originalResume,
  optimizedResume,
  resumeRef
}: ResumeComparisonProps) => {
    const [viewMode, setViewMode] = React.useState<"split" | "optimized" | "original">("split");

  // Function to identify added, removed, and unchanged items
  const compareArrays = (original: string[], updated: string[]) => {
    const removed = original.filter(item => !updated.includes(item));
    const added = updated.filter(item => !original.includes(item));
    const unchanged = original.filter(item => updated.includes(item));
    
    return {
      removed,
      added,
      unchanged
    };
  };

  // Compare sections for differences
  const skillsDiff = compareArrays(originalResume.skills, optimizedResume.skills);

  // Helper to compare array objects by a key field
  const compareObjectArrays = <T extends Record<string, any>>(
    original: T[], 
    updated: T[], 
    keyFn: (item: T) => string
  ) => {
    const originalKeys = new Set(original.map(keyFn));
    const updatedKeys = new Set(updated.map(keyFn));
    
    const removed = original.filter(item => !updatedKeys.has(keyFn(item)));
    const added = updated.filter(item => !originalKeys.has(keyFn(item)));
    
    // For unchanged items, we need to find matches and check if any properties changed
    const possiblyChanged = original.filter(item => updatedKeys.has(keyFn(item)));
    const unchanged: T[] = [];
    const modified: {original: T, updated: T}[] = [];
    
    possiblyChanged.forEach(origItem => {
      const updatedItem = updated.find(item => keyFn(item) === keyFn(origItem));
      if (updatedItem) {
        // Check if any properties differ
        let hasChanges = false;
        for (const key in origItem) {
          if (origItem[key] !== updatedItem[key]) {
            hasChanges = true;
            break;
          }
        }
        
        if (hasChanges) {
          modified.push({original: origItem, updated: updatedItem});
        } else {
          unchanged.push(origItem);
        }
      }
    });
    
    return {
      removed,
      added,
      unchanged,
      modified
    };
  };

  // Compare experience by company + title (as unique key)
  const experienceDiff = compareObjectArrays(
    originalResume.experience, 
    optimizedResume.experience,
    item => `${item.company}-${item.title}`
  );

  // Compare education by school + degree
  const educationDiff = compareObjectArrays(
    originalResume.education, 
    optimizedResume.education,
    item => `${item.school}-${item.degree}`
  );

  // Compare projects by title
  const projectsDiff = compareObjectArrays(
    originalResume.projects, 
    optimizedResume.projects,
    item => item.title
  );

  // Compare certifications by name
  const certificationsDiff = compareObjectArrays(
    originalResume.certifications, 
    optimizedResume.certifications,
    item => item.name
  );

  // Compare bullet points in description
  const compareBulletPoints = (original: string, updated: string) => {
    const originalBullets = original.split("\n").filter(line => line.trim());
    const updatedBullets = updated.split("\n").filter(line => line.trim());
    
    return compareArrays(originalBullets, updatedBullets);
  };

  const ResumeContent = ({ resumeData, isOptimized = false }: { resumeData: FormData; isOptimized?: boolean }) => (
    <div className="p-6 bg-white rounded-lg">
      <div className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold mb-2">{name || ""}</h1>
        <p className="text-gray-600 text-lg">
          {resumeData.personalInfo.headline || "Professional Resume"}
        </p>
        <div className="flex flex-wrap gap-3 text-gray-600 text-sm mt-2">
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

      {/* Skills Section with Diff */}
      {resumeData.skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3 text-gray-800">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {isOptimized ? (
              // Optimized view - show added skills in green, unchanged in neutral
              <>
                {skillsDiff.unchanged.map((skill, index) => (
                  <span key={`unchanged-${index}`} className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
                    {skill}
                  </span>
                ))}
                {skillsDiff.added.map((skill, index) => (
                  <span key={`added-${index}`} className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 border border-green-300">
                    + {skill}
                  </span>
                ))}
              </>
            ) : (
              // Original view - show removed skills in red, unchanged in neutral
              <>
                {skillsDiff.unchanged.map((skill, index) => (
                  <span key={`unchanged-${index}`} className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
                    {skill}
                  </span>
                ))}
                {skillsDiff.removed.map((skill, index) => (
                  <span key={`removed-${index}`} className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-800 border border-red-300">
                    - {skill}
                  </span>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* Experience Section with Diff */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3 text-gray-800">Work Experience</h2>
        
        {isOptimized ? (
          // Optimized view
          <>
            {/* Show unchanged experiences */}
            {experienceDiff.unchanged.map((exp, index) => (
              <div key={`unchanged-exp-${index}`} className="mb-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{exp.title}</h3>
                    <p className="text-gray-700">{exp.company}</p>
                  </div>
                  <div className="text-gray-600 text-sm">
                    {exp.startDate} - {exp.endDate || "Present"}
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{exp.location}</p>
                <ul className="mt-2 list-disc pl-5 text-sm">
                  {exp.description.split("\n").map((line, i) => (
                    <li className="mb-1" key={i}>{line}</li>
                  ))}
                </ul>
              </div>
            ))}
            
            {/* Show modified experiences with changes */}
            {experienceDiff.modified.map(({original, updated}, index) => {
              const bulletDiff = compareBulletPoints(original.description, updated.description);
              
              return (
                <div key={`modified-exp-${index}`} className="mb-5 border-l-4 border-blue-400 pl-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{updated.title}</h3>
                      <p className="text-gray-700">{updated.company}</p>
                    </div>
                    <div className="text-gray-600 text-sm">
                      {updated.startDate} - {updated.endDate || "Present"}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">{updated.location}</p>
                  <ul className="mt-2 list-disc pl-5 text-sm">
                    {bulletDiff.unchanged.map((line, i) => (
                      <li className="mb-1" key={`unchanged-${i}`}>{line}</li>
                    ))}
                    {bulletDiff.added.map((line, i) => (
                      <li className="mb-1 bg-green-50 text-green-800 px-1 rounded" key={`added-${i}`}>+ {line}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
            
            {/* Show newly added experiences */}
            {experienceDiff.added.map((exp, index) => (
              <div key={`added-exp-${index}`} className="mb-5 border-l-4 border-green-500 pl-3 bg-green-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{exp.title}</h3>
                    <p className="text-gray-700">{exp.company}</p>
                  </div>
                  <div className="text-gray-600 text-sm">
                    {exp.startDate} - {exp.endDate || "Present"}
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{exp.location}</p>
                <ul className="mt-2 list-disc pl-5 text-sm">
                  {exp.description.split("\n").map((line, i) => (
                    <li className="mb-1" key={i}>{line}</li>
                  ))}
                </ul>
              </div>
            ))}
          </>
        ) : (
          // Original view
          <>
            {/* Show unchanged experiences */}
            {experienceDiff.unchanged.map((exp, index) => (
              <div key={`unchanged-exp-${index}`} className="mb-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{exp.title}</h3>
                    <p className="text-gray-700">{exp.company}</p>
                  </div>
                  <div className="text-gray-600 text-sm">
                    {exp.startDate} - {exp.endDate || "Present"}
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{exp.location}</p>
                <ul className="mt-2 list-disc pl-5 text-sm">
                  {exp.description.split("\n").map((line, i) => (
                    <li className="mb-1" key={i}>{line}</li>
                  ))}
                </ul>
              </div>
            ))}
            
            {/* Show modified experiences with changes */}
            {experienceDiff.modified.map(({original, updated}, index) => {
              const bulletDiff = compareBulletPoints(original.description, updated.description);
              
              return (
                <div key={`modified-exp-${index}`} className="mb-5 border-l-4 border-blue-400 pl-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{original.title}</h3>
                      <p className="text-gray-700">{original.company}</p>
                    </div>
                    <div className="text-gray-600 text-sm">
                      {original.startDate} - {original.endDate || "Present"}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">{original.location}</p>
                  <ul className="mt-2 list-disc pl-5 text-sm">
                    {bulletDiff.unchanged.map((line, i) => (
                      <li className="mb-1" key={`unchanged-${i}`}>{line}</li>
                    ))}
                    {bulletDiff.removed.map((line, i) => (
                      <li className="mb-1 bg-red-50 text-red-800 px-1 rounded" key={`removed-${i}`}>- {line}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
            
            {/* Show removed experiences */}
            {experienceDiff.removed.map((exp, index) => (
              <div key={`removed-exp-${index}`} className="mb-5 border-l-4 border-red-500 pl-3 bg-red-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{exp.title}</h3>
                    <p className="text-gray-700">{exp.company}</p>
                  </div>
                  <div className="text-gray-600 text-sm">
                    {exp.startDate} - {exp.endDate || "Present"}
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{exp.location}</p>
                <ul className="mt-2 list-disc pl-5 text-sm">
                  {exp.description.split("\n").map((line, i) => (
                    <li className="mb-1" key={i}>{line}</li>
                  ))}
                </ul>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Education Section with Diff */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3 text-gray-800">Education</h2>
        
        {isOptimized ? (
          // Optimized view
          <>
            {educationDiff.unchanged.map((edu, index) => (
              <div key={`unchanged-edu-${index}`} className="mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{edu.school}</h3>
                    <p className="text-gray-700">{edu.degree}</p>
                  </div>
                  <div className="text-gray-600 text-sm">
                    {edu.startDate} - {edu.endDate || "Present"}
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{edu.fieldOfStudy}</p>
              </div>
            ))}
            
            {educationDiff.modified.map(({original, updated}, index) => (
              <div key={`modified-edu-${index}`} className="mb-4 border-l-4 border-blue-400 pl-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{updated.school}</h3>
                    <p className="text-gray-700">{updated.degree}</p>
                  </div>
                  <div className="text-gray-600 text-sm">
                    {updated.startDate} - {updated.endDate || "Present"}
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{updated.fieldOfStudy}</p>
              </div>
            ))}
            
            {educationDiff.added.map((edu, index) => (
              <div key={`added-edu-${index}`} className="mb-4 border-l-4 border-green-500 pl-3 bg-green-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{edu.school}</h3>
                    <p className="text-gray-700">{edu.degree}</p>
                  </div>
                  <div className="text-gray-600 text-sm">
                    {edu.startDate} - {edu.endDate || "Present"}
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{edu.fieldOfStudy}</p>
              </div>
            ))}
          </>
        ) : (
          // Original view
          <>
            {educationDiff.unchanged.map((edu, index) => (
              <div key={`unchanged-edu-${index}`} className="mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{edu.school}</h3>
                    <p className="text-gray-700">{edu.degree}</p>
                  </div>
                  <div className="text-gray-600 text-sm">
                    {edu.startDate} - {edu.endDate || "Present"}
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{edu.fieldOfStudy}</p>
              </div>
            ))}
            
            {educationDiff.modified.map(({original, updated}, index) => (
              <div key={`modified-edu-${index}`} className="mb-4 border-l-4 border-blue-400 pl-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{original.school}</h3>
                    <p className="text-gray-700">{original.degree}</p>
                  </div>
                  <div className="text-gray-600 text-sm">
                    {original.startDate} - {original.endDate || "Present"}
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{original.fieldOfStudy}</p>
              </div>
            ))}
            
            {educationDiff.removed.map((edu, index) => (
              <div key={`removed-edu-${index}`} className="mb-4 border-l-4 border-red-500 pl-3 bg-red-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{edu.school}</h3>
                    <p className="text-gray-700">{edu.degree}</p>
                  </div>
                  <div className="text-gray-600 text-sm">
                    {edu.startDate} - {edu.endDate || "Present"}
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{edu.fieldOfStudy}</p>
              </div>
            ))}
          </>
        )}
      </div>

        {resumeData.projects.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-3 text-gray-800">Projects</h2>
            
            {isOptimized ? (
            // Optimized view
            <>
              {projectsDiff.unchanged.map((project, index) => (
                <div key={`unchanged-project-${index}`} className="mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{project.title}</h3>
                  </div>
                  {project.url && (
                    <a href={project.url} className="text-blue-600 text-sm" target="_blank" rel="noopener noreferrer">{project.url}</a>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {project.technologies.map((tech, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-200 rounded text-sm">{tech}</span>
                  ))}
                </div>
                </div>
              ))}
              
              {projectsDiff.modified.map(({original, updated}, index) => {
                const bulletDiff = compareBulletPoints(original.description, updated.description);
                
                return (
                <div key={`modified-project-${index}`} className="mb-4 border-l-4 border-blue-400 pl-3">
                  <div className="flex justify-between items-start">
                    <div>
                    <h3 className="text-lg font-semibold">{updated.title}</h3>
                    </div>
                    {updated.url && (
                    <a href={updated.url} className="text-blue-600 text-sm" target="_blank" rel="noopener noreferrer">{updated.url}</a>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {updated.technologies.map((tech, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-200 rounded text-sm">{tech}</span>
                    ))}
                  </div>
                  <div className="text-gray-600 text-sm mt-1">
                    {bulletDiff.unchanged.map((line, i) => (
                    <p key={`unchanged-${i}`} className="mb-1">{line}</p>
                    ))}
                    {bulletDiff.added.map((line, i) => (
                    <p key={`added-${i}`} className="mb-1 bg-green-50 text-green-800 px-1 rounded">+ {line}</p>
                    ))}
                  </div>
                </div>
                );
              })}
              
              {projectsDiff.added.map((project, index) => (
                <div key={`added-project-${index}`} className="mb-4 border-l-4 border-green-500 pl-3 bg-green-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{project.title}</h3>
                  </div>
                  {project.url && (
                    <a href={project.url} className="text-blue-600 text-sm" target="_blank" rel="noopener noreferrer">{project.url}</a>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {project.technologies.map((tech, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-200 rounded text-sm">{tech}</span>
                  ))}
                </div>
                </div>
              ))}
            </>
            ) : (
            // Original view
            <>
              {projectsDiff.unchanged.map((project, index) => (
                <div key={`unchanged-project-${index}`} className="mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{project.title}</h3>
                  </div>
                  {project.url && (
                    <a href={project.url} className="text-blue-600 text-sm" target="_blank" rel="noopener noreferrer">{project.url}</a>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {project.technologies.map((tech, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-200 rounded text-sm">{tech}</span>
                  ))}
                </div>
                </div>
              ))}
              
              {projectsDiff.modified.map(({original, updated}, index) => {
                const bulletDiff = compareBulletPoints(original.description, updated.description);
                
                return (
                <div key={`modified-project-${index}`} className="mb-4 border-l-4 border-blue-400 pl-3">
                  <div className="flex justify-between items-start">
                    <div>
                    <h3 className="text-lg font-semibold">{original.title}</h3>
                    </div>
                    {original.url && (
                    <a href={original.url} className="text-blue-600 text-sm" target="_blank" rel="noopener noreferrer">{original.url}</a>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {original.technologies.map((tech, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-200 rounded text-sm">{tech}</span>
                    ))}
                  </div>
                  <div className="text-gray-600 text-sm mt-1">
                    {bulletDiff.unchanged.map((line, i) => (
                    <p key={`unchanged-${i}`} className="mb-1">{line}</p>
                    ))}
                    {bulletDiff.removed.map((line, i) => (
                    <p key={`removed-${i}`} className="mb-1 bg-red-50 text-red-800 px-1 rounded">- {line}</p>
                    ))}
                  </div>
                </div>
                );
              })}
              
              {projectsDiff.removed.map((project, index) => (
                <div key={`removed-project-${index}`} className="mb-4 border-l-4 border-red-500 pl-3 bg-red-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{project.title}</h3>
                  </div>
                  {project.url && (
                    <a href={project.url} className="text-blue-600 text-sm" target="_blank" rel="noopener noreferrer">{project.url}</a>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {project.technologies.map((tech, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-200 rounded text-sm">{tech}</span>
                  ))}
                </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Certifications Section with Diff */}
      {resumeData.certifications.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3 text-gray-800">Certifications</h2>
          
          {isOptimized ? (
            // Optimized view
            <>
              {certificationsDiff.unchanged.map((cert, index) => (
                <div key={`unchanged-cert-${index}`} className="mb-3">
                  <h3 className="text-lg font-semibold">{cert.name}</h3>
                  {cert.description && <p className="text-gray-600 text-sm">{cert.description}</p>}
                  {cert.credentialUrl && <a href={cert.credentialUrl} className="text-blue-600 text-sm" target="_blank" rel="noopener noreferrer">{cert.credentialUrl}</a>}
                </div>
              ))}
              
              {certificationsDiff.modified.map(({original, updated}, index) => (
                <div key={`modified-cert-${index}`} className="mb-3 border-l-4 border-blue-400 pl-3">
                  <h3 className="text-lg font-semibold">{updated.name}</h3>
                  {updated.description && <p className="text-gray-600 text-sm">{updated.description}</p>}
                  {updated.credentialUrl && <a href={updated.credentialUrl} className="text-blue-600 text-sm" target="_blank" rel="noopener noreferrer">{updated.credentialUrl}</a>}
                </div>
              ))}
              
              {certificationsDiff.added.map((cert, index) => (
                <div key={`added-cert-${index}`} className="mb-3 border-l-4 border-green-500 pl-3 bg-green-50">
                  <h3 className="text-lg font-semibold">{cert.name}</h3>
                  {cert.description && <p className="text-gray-600 text-sm">{cert.description}</p>}
                  {cert.credentialUrl && <a href={cert.credentialUrl} className="text-blue-600 text-sm" target="_blank" rel="noopener noreferrer">{cert.credentialUrl}</a>}
                </div>
              ))}
            </>
          ) : (
            // Original view
            <>
              {certificationsDiff.unchanged.map((cert, index) => (
                <div key={`unchanged-cert-${index}`} className="mb-3">
                  <h3 className="text-lg font-semibold">{cert.name}</h3>
                  {cert.description && <p className="text-gray-600 text-sm">{cert.description}</p>}
                  {cert.credentialUrl && <a href={cert.credentialUrl} className="text-blue-600 text-sm" target="_blank" rel="noopener noreferrer">{cert.credentialUrl}</a>}
                </div>
              ))}
              
              {certificationsDiff.modified.map(({original, updated}, index) => (
                <div key={`modified-cert-${index}`} className="mb-3 border-l-4 border-blue-400 pl-3">
                  <h3 className="text-lg font-semibold">{original.name}</h3>
                  {original.description && <p className="text-gray-600 text-sm">{original.description}</p>}
                  {original.credentialUrl && <a href={original.credentialUrl} className="text-blue-600 text-sm" target="_blank" rel="noopener noreferrer">{original.credentialUrl}</a>}
                </div>
              ))}
              
              {certificationsDiff.removed.map((cert, index) => (
                <div key={`removed-cert-${index}`} className="mb-3 border-l-4 border-red-500 pl-3 bg-red-50">
                  <h3 className="text-lg font-semibold">{cert.name}</h3>
                  {cert.description && <p className="text-gray-600 text-sm">{cert.description}</p>}
                  {cert.credentialUrl && <a href={cert.credentialUrl} className="text-blue-600 text-sm" target="_blank" rel="noopener noreferrer">{cert.credentialUrl}</a>}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div ref={resumeRef} className="font-sans">
        <div className="flex gap-2 p-4">
            {["split", "optimized", "original"].map((mode) => (
                <button
                    key={mode}
                    onClick={() => setViewMode(mode as 'split' | 'optimized' | 'original')}
                    className={`px-4 py-2 rounded-full font-semibold transition-colors duration-200 ${
                        viewMode === mode
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)} {mode === "split" ? "View" : "Resume"}
                </button>
            ))}
        </div>
        <Card className="shadow-md">
            <CardContent className="p-0">
            {viewMode === "split" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                    <div>
                        <h2 className="text-xl font-bold mb-4 flex items-center">
                            <span className="mr-2 p-1 bg-gray-200 rounded-full">
                                <span className="block h-4 w-4 rounded-full bg-gray-500"></span>
                            </span>
                            Original Resume
                        </h2>
                        <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                            <ResumeContent resumeData={originalResume} />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold mb-4 flex items-center">
                            <span className="mr-2 p-1 bg-green-200 rounded-full">
                                <span className="block h-4 w-4 rounded-full bg-green-500"></span>
                            </span>
                            Optimized Resume
                        </h2>
                        <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                            <ResumeContent resumeData={optimizedResume} isOptimized={true} />
                        </div>
                    </div>
                </div>            
                ) : viewMode === "optimized" ? (
                <div className="p-4">
                    <div className="mb-6">
                    <h2 className="text-xl font-bold mb-3">Optimized Resume</h2>
                    <div className="flex items-center space-x-6 mb-4">
                        {/* <div className="flex items-center">
                        <span className="mr-2 p-1 bg-red-200 rounded-full">
                            <span className="block h-3 w-3 rounded-full bg-red-500"></span>
                        </span>
                        <span className="text-sm">Removed</span>
                        </div> */}
                        <div className="flex items-center">
                        <span className="mr-2 p-1 bg-green-200 rounded-full">
                            <span className="block h-3 w-3 rounded-full bg-green-500"></span>
                        </span>
                        <span className="text-sm">Added</span>
                        </div>
                        <div className="flex items-center">
                        <span className="mr-2 p-1 bg-blue-200 rounded-full">
                            <span className="block h-3 w-3 rounded-full bg-blue-500"></span>
                        </span>
                        <span className="text-sm">Modified</span>
                        </div>
                    </div>
                    </div>
                    <div className="border rounded-lg overflow-hidden">
                    <ResumeContent resumeData={optimizedResume} isOptimized={true} />
                    </div>
                </div>
                ) : (
                <div className="p-4">
                    <div className="mb-6">
                    <h2 className="text-xl font-bold mb-3">Original Resume</h2>
                    <div className="flex items-center space-x-6 mb-4">
                        <div className="flex items-center">
                        <span className="mr-2 p-1 bg-red-200 rounded-full">
                            <span className="block h-3 w-3 rounded-full bg-red-500"></span>
                        </span>
                        <span className="text-sm">Removed</span>
                        </div>
                        {/* <div className="flex items-center">
                        <span className="mr-2 p-1 bg-green-200 rounded-full">
                            <span className="block h-3 w-3 rounded-full bg-green-500"></span>
                        </span>
                        <span className="text-sm">Added</span>
                        </div> */}
                        <div className="flex items-center">
                        <span className="mr-2 p-1 bg-blue-200 rounded-full">
                            <span className="block h-3 w-3 rounded-full bg-blue-500"></span>
                        </span>
                        <span className="text-sm">Modified</span>
                        </div>
                    </div>
                    </div>
                    <div className="border rounded-lg overflow-hidden">
                    <ResumeContent resumeData={originalResume} isOptimized={false} />
                    </div>
                </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
};

export default ResumeComparison;