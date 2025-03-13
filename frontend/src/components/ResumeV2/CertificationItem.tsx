import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Certification } from '../OnBoarding/CertificationCard';

interface CertificationItemProps {
    certification: Certification;
    index: number;
    onChange: (index: number, field: keyof Certification, value: string) => void;
    onRemove: () => void;
}

const CertificationItem = ({ certification, index, onChange, onRemove }: CertificationItemProps) => {
  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Certification Name</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={certification.name}
            onChange={(e) => onChange(index, 'name', e.target.value)}
            placeholder="e.g., AWS Certified Solutions Architect"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Credential URL</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={certification.credentialUrl}
            onChange={(e) => onChange(index, 'credentialUrl', e.target.value)}
            placeholder="e.g., https://credential.verify.com/abc123"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-medium">Description</label>
          <textarea
            className="w-full p-2 border rounded min-h-24"
            value={certification.description}
            onChange={(e) => onChange(index, 'description', e.target.value)}
            placeholder="Describe the certification, skills demonstrated, and when you obtained it..."
          />
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button 
          variant="destructive" 
          size="sm"
          onClick={onRemove}
        >
          Remove
        </Button>
      </div>
    </Card>
  );
};

export default CertificationItem;