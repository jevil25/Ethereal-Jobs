import { JSX, useState } from "react";
import {
  useAppSelector,
  useSaveStateToDatabaseOnChange,
  useSetInitialStore,
} from "../../lib/redux/hooks";
import { ShowForm, selectFormsOrder } from "../../lib/redux/settingsSlice";
import { ProfileForm } from "./ProfileForm";
import { WorkExperiencesForm } from "./WorkExperiencesForm";
import { EducationsForm } from "./EducationsForm";
import { ProjectsForm } from "./ProjectsForm";
import { SkillsForm } from "./SkillsForm";
import { ThemeForm } from "./ThemeForm";
import { CustomForm } from "./CustomForm";
import { FlexboxSpacer } from "../FlexboxSpacer";
import { cx } from "../../lib/cx";

const formTypeToComponent: { [type in ShowForm]: () => JSX.Element } = {
  workExperiences: WorkExperiencesForm,
  educations: EducationsForm,
  projects: ProjectsForm,
  skills: SkillsForm,
  custom: CustomForm,
};

interface ResumeFormProps {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

export const ResumeForm = ({ isLoading, setIsLoading }: ResumeFormProps) => {
  const [isHover, setIsHover] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useSetInitialStore(setIsLoading);
  useSaveStateToDatabaseOnChange(setIsSaving);

  const formsOrder = useAppSelector(selectFormsOrder);

  if (isLoading) {
    return (
    <div>
        <div className="flex justify-center items-center h-screen">Loading...</div>
        <FlexboxSpacer maxWidth={50} className="hidden md:block" />
    </div>
    )
  }

  return (
    <div
      className={cx(
        "flex justify-center scrollbar-thin scrollbar-track-gray-100 md:h-[calc(100vh-var(--top-nav-bar-height))] md:justify-end md:overflow-y-scroll",
        isHover ? "scrollbar-thumb-gray-200" : "scrollbar-thumb-gray-100"
      )}
      onMouseOver={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      {isSaving && (
        <div className="fixed bottom-4 right-4 bg-white bg-opacity-70 p-2 rounded-md shadow-md flex flex-row justify-center items-center gap-2">
          <div className="w-4 h-4 border-2 border-t-[transparent] border-blue-500 rounded-full animate-spin"></div>
          Saving...
        </div>
      )}
      <section className="flex max-w-2xl flex-col gap-8 p-[var(--resume-padding)] pt-10">
        <ProfileForm />
        {formsOrder.map((form) => {
          const Component = formTypeToComponent[form];
          return <Component key={form} />;
        })}
        <ThemeForm />
        <br />
      </section>
      <FlexboxSpacer maxWidth={50} className="hidden md:block" />
    </div>
  );
};
