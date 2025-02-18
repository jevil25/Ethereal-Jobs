import { ResumeForm } from "../components/ResumeForm";
import { Resume } from "../components/Resume";
import { useState } from "react";

export default function ResumeBuilder() {
  const [isLoading, setIsLoading] = useState(false);
  
  return (
    <main className="relative h-full w-full overflow-hidden">
      <div className="grid grid-cols-3 md:grid-cols-6">
        <div className="col-span-3">
          <ResumeForm
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        </div>
        <div className="col-span-3">
          <Resume
            isLoading={isLoading}
          />
        </div>
      </div>
    </main>
  );
}
