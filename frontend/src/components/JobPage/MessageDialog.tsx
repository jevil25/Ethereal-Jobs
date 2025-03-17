import React from "react";
import Markdown from "react-markdown";
import { JobData, LinkedInProfile } from "../../types/data";
import Dropdown from "../DropDown";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Copy, Linkedin, Loader2 } from "lucide-react";
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui/tooltip";
import { ScrollArea } from "../ui/scroll-area";
import { NavigateFunction } from "react-router-dom";

const MessageDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  generatingMessage: boolean;
  noResumeFound: boolean;
  generatedMessage: string;
  linkedinName: string;
  setLinkedinName: React.Dispatch<React.SetStateAction<string>>;
  job: JobData;
  handleMessageGeneration: (newMessage?: boolean) => void;
  navigate: NavigateFunction;
  linkedInProfiles: LinkedInProfile[];
}> = ({
  isOpen,
  onClose,
  generatingMessage,
  noResumeFound,
  generatedMessage,
  linkedinName,
  setLinkedinName,
  job,
  handleMessageGeneration,
  navigate,
  linkedInProfiles,
}) => {
  const reg = new RegExp("\\[[^\\]]*\\]|\\{\\{[^}]*\\}\\}|\\{[^}]*\\}", "g");

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(generatedMessage.replace(reg, linkedinName));
  };

  const selectedProfile = linkedInProfiles.find(
    (profile) => profile.name === linkedinName,
  );

  const handleRegenerate = () => {
    handleMessageGeneration(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl">
        <DialogHeader>
          <DialogTitle>Customized Message</DialogTitle>
          <DialogDescription>
            {!noResumeFound && !generatingMessage && (
              <p className="text-sm text-gray-600">
                Use the below message to contact the hiring managers from{" "}
                {job?.company} on LinkedIn.
              </p>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="prose max-w-none">
          {generatingMessage ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
              <div className="ml-4">
                Our backend is generating your message, It might take a few
                seconds please wait....
              </div>
            </div>
          ) : !noResumeFound ? (
            <div className="flex flex-col gap-4">
              <ScrollArea className="max-h-60 mb-8">
                <div className="mb-4 bg-white p-4 rounded-lg border border-blue-300 shadow-md transition-all">
                  <Markdown>
                    {generatedMessage.replace(reg, linkedinName)}
                  </Markdown>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 h-7 px-2 text-xs"
                          onClick={handleCopyMessage}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy Message
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copy to clipboard</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </ScrollArea>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="linkedinName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Select LinkedIn Name
                  </label>
                  <Dropdown
                    value={linkedinName}
                    list={
                      linkedInProfiles.map(
                        (profile) => profile.name,
                      ) as string[]
                    }
                    onChange={setLinkedinName}
                    selectionText="Select LinkedIn Name"
                    noSelectionText="No Such LinkedIn Name Found"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleRegenerate} variant="secondary">
                    Regenerate Message
                  </Button>
                  {selectedProfile && (
                    <Button asChild className="bg-blue-600 hover:bg-blue-700">
                      <a
                        href={selectedProfile.profile_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Linkedin className="h-4 w-4 mr-2" />
                        Visit {linkedinName}'s Profile
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center border border-red-200 p-6 rounded-lg shadow-md">
              <p className="text-red-500 font-semibold mb-4">
                No resume found. Please create a resume first.
              </p>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate("/resume")}
              >
                Create Resume
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessageDialog;
