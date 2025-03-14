import SkillsCard from "../OnBoarding/SkillsCard";

interface SkillsCardProps {
  skills: string[];
  updateData: (data: string[]) => void;
}

const SkillsTab = ({ skills, updateData }: SkillsCardProps) => {
  return (
    <div className="p-6">
      <SkillsCard data={skills} updateData={updateData} />
    </div>
  );
};

export default SkillsTab;
