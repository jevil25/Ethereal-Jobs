import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "../ui/sheet";
import { Download, RefreshCw } from "lucide-react";
import ResumeComparison from "../ResumeV2/ResumeComparision";
import { useResumeData } from "../ResumeV2/hooks/useResumeData";
import { useAuth } from "../../providers/useAuth";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Loader2 } from "lucide-react";

interface ResumeDrawerProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    jobId: string;
}

const ResumeDrawer = ({ isOpen, setIsOpen, jobId }: ResumeDrawerProps) => {
    const [isParsing, setIsParsing] = useState(false);
    const {
        generatedResume,
        resumeData,
        setIsMainResume,
        setJobId,
        isLoading,
        saveStatus,
        updateResumeSection,
        generateResume,
        downloadOptimizedResume,
      } = useResumeData();

      useEffect(() => {
        setJobId(jobId);
        setIsMainResume(false);
      }, []);

      const handleResumeGeneration = async () => {
        setIsParsing(true);
        await generateResume(true, false, jobId);
        setIsParsing(false);
      }

      const { user } = useAuth();
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full sm:max-w-xl md:max-w-3xl lg:max-w-4xl xl:max-w-6xl overflow-y-auto">
        <SheetHeader className="mb-6">
            <SheetTitle>Your Optimized Resume</SheetTitle>
            <SheetClose className="absolute right-4 top-4" />
        </SheetHeader>
        
        {generatedResume && (
            <>
            <div className="pb-6">
                <ResumeComparison 
                    name={user?.name} 
                    optimizedResume={generatedResume}
                    originalResume={resumeData}
                    updateResumeSection={updateResumeSection}
                />
            </div>

            {
                isParsing && (
                    <Dialog open={isParsing} onOpenChange={setIsParsing}>
                        <DialogContent className="sm:max-w-md p-6 bg-white">
                            <DialogTitle className="text-lg font-semibold mb-2">
                            Generating Resume
                            </DialogTitle>
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                            Please wait while we generate your resume...
                        </DialogContent>
                    </Dialog>
                )
            }
            
            <div className="flex gap-4 mt-6 sticky bottom-0 bg-background py-4 border-t px-3">
                <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={() => {
                        setIsParsing(true);
                        handleResumeGeneration();
                    }}
                >
                    <RefreshCw className="h-4 w-4" />
                    Regenerate
                </Button>
                <Button 
                    className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => downloadOptimizedResume()}
                >
                    <Download className="h-4 w-4" />
                    Download Job Optimized Resume
                </Button>
            </div>
            </>
        )}
        </SheetContent>
    </Sheet>
  );
};

export default ResumeDrawer;