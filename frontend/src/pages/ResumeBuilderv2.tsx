// import { useState, useRef } from 'react';
// import { ChevronRight, Check, X, Upload, FileText, RefreshCw } from 'lucide-react';
// import mammoth from 'mammoth';

// // Main Application
// function ResumeBuilder() {
//   const [resumeFile, setResumeFile] = useState(null);
//   const [jobDescription, setJobDescription] = useState('');
//   const [jobTitle, setJobTitle] = useState('');
//   const [resumeContent, setResumeContent] = useState(null);
//   const [originalMd, setOriginalMd] = useState('');
//   const [optimizedResume, setOptimizedResume] = useState(null);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [currentStep, setCurrentStep] = useState(1);
//   const [sections, setSections] = useState([]);
//   const fileInputRef = useRef(null);

//   // Handle file upload
//   const handleFileUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     setResumeFile(file);
//     setIsProcessing(true);
    
//     try {
//       // Convert the file to markdown based on its type
//       let markdown = '';
      
//       if (file.type === 'application/pdf') {
//         markdown = await convertPdfToMarkdown(file);
//       } else if (file.type.includes('word')) {
//         markdown = await convertDocToMarkdown(file);
//       } else if (file.type === 'text/plain') {
//         markdown = await file.text();
//       } else {
//         alert("Unsupported file format. Please upload a PDF, DOC/DOCX, or TXT file.");
//         setIsProcessing(false);
//         return;
//       }
      
//       setOriginalMd(markdown);
      
//       // Parse the markdown into sections
//       const parsedSections = parseResumeIntoSections(markdown);
//       setSections(parsedSections);
      
//       setResumeContent({
//         markdown,
//         sections: parsedSections
//       });
      
//       setCurrentStep(2);
//     } catch (error) {
//       console.error("Error processing file:", error);
//       alert("Error processing your resume file. Please try again.");
//     }
    
//     setIsProcessing(false);
//   };

//   // Mock function for PDF to Markdown conversion (in a real app, you'd use a library)
//   const convertPdfToMarkdown = async (file) => {
//     // Simulate PDF processing delay
//     await new Promise(resolve => setTimeout(resolve, 1500));
    
//     // In a real implementation, you would use a PDF parsing library
//     // For this demo, we'll return mock markdown content
//     return `# John Doe
// ## Contact
// email@example.com | (555) 123-4567 | linkedin.com/in/johndoe

// ## Summary
// Experienced software engineer with 5+ years of experience in full-stack development and a passion for creating efficient, scalable applications.

// ## Experience
// ### Senior Developer - ABC Company
// *January 2020 - Present*
// - Led development of company's flagship product, increasing performance by 40%
// - Mentored junior developers and implemented code review processes
// - Architected and implemented microservices infrastructure

// ### Software Engineer - XYZ Tech
// *March 2017 - December 2019*
// - Developed responsive web applications using React and Node.js
// - Collaborated with UX team to implement design systems
// - Reduced API response time by 25% through optimizations

// ## Education
// ### Master's in Computer Science
// *University of Technology - 2017*

// ### Bachelor's in Software Engineering
// *State University - 2015*

// ## Skills
// - Languages: JavaScript, TypeScript, Python, Java
// - Frameworks: React, Node.js, Express, Django
// - Tools: Git, Docker, AWS, CI/CD`;
//   };

//   // Mock function for DOCX to Markdown conversion
//   const convertDocToMarkdown = async (file) => {
//     try {
//       const arrayBuffer = await file.arrayBuffer();
//       const result = await mammoth.extractRawText({ arrayBuffer });
//       return result.value; // This would need formatting to proper markdown
//     } catch (error) {
//       console.error("Error converting DOCX:", error);
//       return "Error converting document";
//     }
//   };

//   // Parse resume markdown into sections
//   const parseResumeIntoSections = (markdown) => {
//     // Simple section parsing by headers
//     const lines = markdown.split('\n');
//     const sections = [];
//     let currentSection = null;
    
//     for (let i = 0; i < lines.length; i++) {
//       const line = lines[i];
      
//       if (line.startsWith('# ')) {
//         // This is the main title/name - treat as special
//         if (!currentSection) {
//           sections.push({
//             id: 'header',
//             title: 'Header/Name',
//             content: line.substring(2),
//             type: 'header',
//             originalContent: line,
//             optimizedContent: null
//           });
//         }
//       } else if (line.startsWith('## ')) {
//         // Save previous section if exists
//         if (currentSection) {
//           sections.push(currentSection);
//         }
        
//         // Create new section
//         currentSection = {
//           id: `section-${sections.length}`,
//           title: line.substring(3),
//           content: '',
//           type: 'section',
//           originalContent: line + '\n',
//           optimizedContent: null
//         };
//       } else if (currentSection) {
//         // Add to current section
//         currentSection.content += line + '\n';
//         currentSection.originalContent += line + '\n';
//       }
//     }
    
//     // Add the last section
//     if (currentSection) {
//       sections.push(currentSection);
//     }
    
//     return sections;
//   };

//   // Submit a section for optimization
//   const optimizeSection = async (sectionId) => {
//     const sectionIndex = sections.findIndex(s => s.id === sectionId);
//     if (sectionIndex === -1) return;
    
//     const section = sections[sectionIndex];
//     section.isOptimizing = true;
//     setSections([...sections]);
    
//     try {
//       // This is where you would make the API call to your backend
//       // For this demo, we'll simulate an API call with a timeout
//       await new Promise(resolve => setTimeout(resolve, 2000));
      
//       // Simulate an optimized response
//       const optimizedContent = await mockOptimizationAPI(
//         section.originalContent, 
//         jobDescription, 
//         jobTitle, 
//         section.title
//       );
      
//       // Update the section with optimized content
//       const updatedSections = [...sections];
//       updatedSections[sectionIndex] = {
//         ...section,
//         optimizedContent,
//         isOptimizing: false,
//         isOptimized: true
//       };
      
//       setSections(updatedSections);
//     } catch (error) {
//       console.error("Error optimizing section:", error);
//       // Reset optimization state
//       const updatedSections = [...sections];
//       updatedSections[sectionIndex] = {
//         ...section,
//         isOptimizing: false
//       };
//       setSections(updatedSections);
//     }
//   };

//   // Mock API call for optimization
//   const mockOptimizationAPI = async (content, jobDescription, jobTitle, sectionTitle) => {
//     // In a real implementation, this would be an API call to your backend
    
//     // Just for demonstration, we'll enhance the sections based on job title
//     if (sectionTitle === "Experience") {
//       if (jobTitle.toLowerCase().includes("data")) {
//         return `### Senior Data Scientist - ABC Analytics
// *January 2020 - Present*
// - Led development of predictive models increasing forecast accuracy by 45%
// - Mentored junior data scientists on machine learning best practices
// - Architected and implemented ETL pipelines processing 2TB+ data daily

// ### Data Analyst - XYZ Insights
// *March 2017 - December 2019*
// - Developed interactive dashboards using Python and Tableau
// - Collaborated with business teams to identify key performance metrics
// - Reduced data processing time by 35% through query optimizations`;
//       } else if (jobTitle.toLowerCase().includes("frontend")) {
//         return `### Senior Frontend Developer - ABC Interactive
// *January 2020 - Present*
// - Led development of responsive UI components increasing user engagement by 40%
// - Mentored junior developers on React best practices and optimization techniques
// - Implemented comprehensive testing strategy reducing production bugs by 65%

// ### Frontend Engineer - XYZ Digital
// *March 2017 - December 2019*
// - Developed modern SPAs using React, Redux, and TypeScript
// - Collaborated closely with designers to implement pixel-perfect interfaces
// - Reduced bundle size by 30% through code splitting and lazy loading`;
//       }
//     }
    
//     if (sectionTitle === "Skills") {
//       if (jobTitle.toLowerCase().includes("data")) {
//         return `- Languages: Python, R, SQL
// - Frameworks & Libraries: TensorFlow, PyTorch, scikit-learn, pandas
// - Tools: Jupyter, Docker, AWS, Airflow, Tableau
// - Skills: Machine Learning, Statistical Analysis, Data Visualization, ETL`;
//       } else if (jobTitle.toLowerCase().includes("frontend")) {
//         return `- Languages: JavaScript, TypeScript, HTML5, CSS3
// - Frameworks: React, Vue.js, Angular, Next.js
// - Tools: Webpack, Jest, Cypress, Git, CI/CD
// - Skills: Responsive Design, Web Performance Optimization, Accessibility, State Management`;
//       }
//     }
    
//     // Generic optimization if no specific keywords match
//     return content + "\n(Optimized for " + jobTitle + ")";
//   };

//   // Generate the final optimized resume
//   const generateFinalResume = () => {
//     let finalMarkdown = "";
    
//     sections.forEach(section => {
//       // Use the optimized content if available, otherwise use original
//       const contentToUse = section.optimizedContent || section.originalContent;
//       finalMarkdown += contentToUse + "\n";
//     });
    
//     setOptimizedResume(finalMarkdown);
//     setCurrentStep(3);
//   };

//   // Reset the application
//   const resetApp = () => {
//     setResumeFile(null);
//     setJobDescription('');
//     setJobTitle('');
//     setResumeContent(null);
//     setOriginalMd('');
//     setOptimizedResume(null);
//     setIsProcessing(false);
//     setCurrentStep(1);
//     setSections([]);
//     if (fileInputRef.current) {
//       fileInputRef.current.value = '';
//     }
//   };

//   return (
//     <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
//       <h1 className="text-3xl font-bold text-gray-800 mb-6">Smart Resume Builder</h1>
      
//       {/* Step 1: Upload resume and enter job details */}
//       <div className="mb-8">
//         <div className="flex items-center mb-4">
//           <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${currentStep >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
//             1
//           </div>
//           <h2 className="text-xl font-semibold">Upload Resume & Job Details</h2>
//         </div>
        
//         <div className={`border rounded-lg p-6 bg-white ${currentStep !== 1 ? 'opacity-70' : ''}`}>
//           <div className="mb-4">
//             <label className="block text-sm font-medium mb-2">Upload Your Resume</label>
//             <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
//               <input
//                 type="file"
//                 ref={fileInputRef}
//                 onChange={handleFileUpload}
//                 className="hidden"
//                 accept=".pdf,.doc,.docx,.txt"
//                 disabled={currentStep !== 1 || isProcessing}
//               />
//               {!resumeFile ? (
//                 <div>
//                   <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
//                   <p className="text-sm text-gray-500 mb-2">Drag and drop your resume file here, or</p>
//                   <button
//                     onClick={() => fileInputRef.current?.click()}
//                     className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
//                     disabled={isProcessing}
//                   >
//                     Browse Files
//                   </button>
//                   <p className="text-xs text-gray-400 mt-2">Supported formats: PDF, DOC, DOCX, TXT</p>
//                 </div>
//               ) : (
//                 <div className="flex items-center justify-center">
//                   <FileText className="h-6 w-6 text-blue-500 mr-2" />
//                   <span className="text-gray-700">{resumeFile.name}</span>
//                   {isProcessing ? (
//                     <RefreshCw className="ml-2 h-4 w-4 animate-spin text-blue-500" />
//                   ) : (
//                     <button 
//                       onClick={resetApp} 
//                       className="ml-2 text-red-500 hover:text-red-700"
//                       disabled={currentStep !== 1}
//                     >
//                       <X size={18} />
//                     </button>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
          
//           <div className="mb-4">
//             <label className="block text-sm font-medium mb-2">Job Title</label>
//             <input
//               type="text"
//               value={jobTitle}
//               onChange={(e) => setJobTitle(e.target.value)}
//               className="w-full p-2 border rounded-md"
//               placeholder="e.g., Senior Frontend Developer"
//               disabled={currentStep !== 1}
//             />
//           </div>
          
//           <div className="mb-4">
//             <label className="block text-sm font-medium mb-2">Job Description</label>
//             <textarea
//               value={jobDescription}
//               onChange={(e) => setJobDescription(e.target.value)}
//               className="w-full p-2 border rounded-md h-32"
//               placeholder="Paste the job description here..."
//               disabled={currentStep !== 1}
//             />
//           </div>
          
//           <button
//             onClick={() => resumeContent && setCurrentStep(2)}
//             className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
//             disabled={!resumeContent || isProcessing || !jobTitle || !jobDescription}
//           >
//             Continue to Optimization
//           </button>
//         </div>
//       </div>
      
//       {/* Step 2: Optimize resume sections */}
//       {currentStep >= 2 && (
//         <div className="mb-8">
//           <div className="flex items-center mb-4">
//             <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${currentStep >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
//               2
//             </div>
//             <h2 className="text-xl font-semibold">Optimize Resume Sections</h2>
//           </div>
          
//           <div className="border rounded-lg p-6 bg-white">
//             <p className="mb-4 text-sm text-gray-600">
//               Click on the "Optimize" button to tailor each section of your resume for the job: <strong>{jobTitle}</strong>
//             </p>
            
//             <div className="space-y-4">
//               {sections.map((section) => (
//                 <div key={section.id} className="border rounded-md overflow-hidden">
//                   <div className="bg-gray-100 p-3 flex justify-between items-center">
//                     <div className="flex items-center">
//                       {section.isOptimized ? (
//                         <Check className="h-5 w-5 text-green-500 mr-2" />
//                       ) : (
//                         <ChevronRight className="h-5 w-5 text-gray-500 mr-2" />
//                       )}
//                       <h3 className="font-medium">{section.title}</h3>
//                     </div>
                    
//                     <button
//                       onClick={() => optimizeSection(section.id)}
//                       className={`px-3 py-1 rounded-md text-sm focus:outline-none ${
//                         section.isOptimizing 
//                           ? 'bg-gray-300 text-gray-700' 
//                           : section.isOptimized
//                             ? 'bg-green-100 text-green-700 hover:bg-green-200'
//                             : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
//                       }`}
//                       disabled={section.isOptimizing}
//                     >
//                       {section.isOptimizing
//                         ? <RefreshCw className="h-4 w-4 animate-spin" />
//                         : section.isOptimized
//                           ? 'Optimized'
//                           : 'Optimize'
//                       }
//                     </button>
//                   </div>
                  
//                   {section.optimizedContent && (
//                     <div className="p-4 bg-white border-t">
//                       <div className="mb-2 text-xs font-medium text-gray-500">Changes Preview:</div>
//                       <div className="bg-gray-50 p-3 rounded-md overflow-x-auto">
//                         <pre className="text-sm whitespace-pre-wrap font-mono">
//                           <DiffView original={section.originalContent} modified={section.optimizedContent} />
//                         </pre>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
            
//             <div className="mt-6 flex justify-between">
//               <button
//                 onClick={() => setCurrentStep(1)}
//                 className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none"
//               >
//                 Back
//               </button>
              
//               <button
//                 onClick={generateFinalResume}
//                 className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
//                 disabled={!sections.some(s => s.isOptimized)}
//               >
//                 Generate Optimized Resume
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
      
//       {/* Step 3: Final Resume */}
//       {currentStep >= 3 && optimizedResume && (
//         <div className="mb-8">
//           <div className="flex items-center mb-4">
//             <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 bg-blue-500 text-white`}>
//               3
//             </div>
//             <h2 className="text-xl font-semibold">Your Optimized Resume</h2>
//           </div>
          
//           <div className="border rounded-lg p-6 bg-white">
//             <p className="mb-4 text-sm text-gray-600">
//               Here's your optimized resume tailored for <strong>{jobTitle}</strong>.
//               You can copy the markdown or download it.
//             </p>
            
//             <div className="bg-gray-100 p-4 rounded-lg mb-4 max-h-96 overflow-y-auto">
//               <pre className="whitespace-pre-wrap text-sm">{optimizedResume}</pre>
//             </div>
            
//             <div className="flex justify-between">
//               <button
//                 onClick={() => setCurrentStep(2)}
//                 className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none"
//               >
//                 Back
//               </button>
              
//               <div className="space-x-2">
//                 <button
//                   onClick={() => {
//                     navigator.clipboard.writeText(optimizedResume);
//                     alert("Resume copied to clipboard!");
//                   }}
//                   className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 focus:outline-none"
//                 >
//                   Copy Markdown
//                 </button>
                
//                 <button
//                   onClick={() => {
//                     const blob = new Blob([optimizedResume], { type: 'text/markdown' });
//                     const url = URL.createObjectURL(blob);
//                     const a = document.createElement('a');
//                     a.href = url;
//                     a.download = `optimized_resume_${jobTitle.replace(/\s+/g, '_')}.md`;
//                     document.body.appendChild(a);
//                     a.click();
//                     document.body.removeChild(a);
//                     URL.revokeObjectURL(url);
//                   }}
//                   className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
//                 >
//                   Download Resume
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // Simple diff view component
// function DiffView({ original, modified }) {
//   // This is a very simplified diff view for demonstration
//   // In a real application, you would use a more sophisticated diff algorithm
//   const originalLines = original.split('\n');
//   const modifiedLines = modified.split('\n');
  
//   return (
//     <div className="text-sm">
//       {modifiedLines.map((line, i) => {
//         const originalLine = originalLines[i] || '';
        
//         if (line === originalLine) {
//           return <div key={i} className="text-gray-700">{line}</div>;
//         }
        
//         if (!originalLine) {
//           return <div key={i} className="bg-green-100 text-green-800">+ {line}</div>;
//         }
        
//         if (!line) {
//           return <div key={i} className="bg-red-100 text-red-800">- {originalLine}</div>;
//         }
        
//         return (
//           <div key={i}>
//             <div className="bg-red-100 text-red-800">- {originalLine}</div>
//             <div className="bg-green-100 text-green-800">+ {line}</div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// export default ResumeBuilder;