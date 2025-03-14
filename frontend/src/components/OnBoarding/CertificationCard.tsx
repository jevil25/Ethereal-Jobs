import React, { useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { X, Plus } from "lucide-react";
import { Card, CardContent } from "../ui/card";

export interface Certification {
  id: string;
  name: string;
  description: string;
  credentialUrl: string;
}

interface CertificationCardProps {
  data: Certification[];
  updateData: (data: Certification[]) => void;
}

const CertificationCard: React.FC<CertificationCardProps> = ({
  data,
  updateData,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCertification, setCurrentCertification] =
    useState<Certification>({
      id: "",
      name: "",
      description: "",
      credentialUrl: "",
    });
  const [editingCertification, setEditingCertification] =
    useState<Certification>();

  const resetForm = () => {
    setCurrentCertification({
      id: "",
      name: "",
      description: "",
      credentialUrl: "",
    });
    setEditingCertification(undefined);
    setIsFormOpen(false);
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentCertification({
      ...currentCertification,
      [name]: value,
    });
  };

  const saveCertification = () => {
    if (currentCertification.name) {
      if (isEditing) {
        // Update existing certification
        updateData(
          data.map((item) =>
            item.id === currentCertification.id ? currentCertification : item,
          ),
        );
        setEditingCertification(undefined);
      } else {
        // Add new certification
        const certificationToAdd = {
          ...currentCertification,
          id: Date.now().toString(),
        };
        updateData([...data, certificationToAdd]);
      }
      resetForm();
    }
  };

  const startEditing = (certification: Certification) => {
    setCurrentCertification({ ...certification });
    setEditingCertification(certification);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const addNew = () => {
    resetForm();
    setIsFormOpen(true);
    setIsEditing(false);
  };

  const removeCertification = (id: string) => {
    updateData(data.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-4">
      {data.length > 0 && (
        <div className="space-y-4">
          {data
            .filter((value) => value.id != editingCertification?.id)
            .map((cert) => (
              <Card key={cert.id} className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 left-2"
                  onClick={() => startEditing(cert)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => removeCertification(cert.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <CardContent className="pt-6">
                  <div className="font-medium">{cert.name}</div>
                  {cert.description && (
                    <div className="text-sm text-gray-500">
                      {cert.description}
                    </div>
                  )}
                  {cert.credentialUrl && (
                    <div className="mt-1 text-xs">
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        View Credential
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {!isFormOpen ? (
        <Button onClick={addNew} variant="outline" className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Certification
        </Button>
      ) : (
        <div className="space-y-4 border p-4 rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="name">Certification Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g., AWS Certified Solutions Architect"
              value={currentCertification.name}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              name="description"
              placeholder="e.g., Advanced cloud computing certification"
              value={currentCertification.description}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="credentialUrl">Credential URL</Label>
            <Input
              id="credentialUrl"
              name="credentialUrl"
              placeholder="e.g., https://www.credly.com/badges/..."
              value={currentCertification.credentialUrl}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button variant="jobify" onClick={saveCertification}>
              {isEditing ? "Update Certification" : "Add Certification"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificationCard;
