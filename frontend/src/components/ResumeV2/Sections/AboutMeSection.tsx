import { DiffSection } from "../DiffSection";
import EditableText from "./EditableText";

interface AboutMeProps {
  aboutMe: string;
  aboutMeDiff: { removed: string[]; added: string[]; unchanged: string[]; };
  isOptimized: boolean;
  onSave: (value: string) => void;
}

export const AboutMeSection: React.FC<AboutMeProps> = ({
  aboutMe,
  aboutMeDiff,
  isOptimized,
  onSave,
}) => {
  const renderAboutMe = (
    content: string,
    _status: "unchanged" | "added" | "removed" | "modified",
    _index: number,
  ) => (
    <div className="prose">
      <EditableText
        initialValue={content}
        onSave={onSave}
        multiline={true}
      />
    </div>
  );

  return (
    <DiffSection<string>
      title="About Me"
      items={aboutMe ? [aboutMe] : []}
      diffInfo={{ 
        added: aboutMeDiff.added, 
        removed: aboutMeDiff.removed, 
        unchanged: aboutMeDiff.unchanged,
        modified: []
      }}
      isOptimized={isOptimized}
      renderItem={renderAboutMe}
    />
  );
};