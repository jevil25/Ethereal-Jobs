import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";

interface ConfirmationModalProps {
  onRemove: () => void;
  setShowRemoveModal: (show: boolean) => void;
  confirmationMessage: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  onRemove,
  setShowRemoveModal,
  confirmationMessage,
}) => {
  const [isOpen, _] = useState(true);

  return (
    <Dialog open={isOpen} onOpenChange={() => setShowRemoveModal(false)}>
      <DialogContent className="sm:max-w-md p-6 bg-white">
        <DialogTitle className="text-lg font-semibold mb-2">
          Confirmation
        </DialogTitle>
        <DialogDescription className="mb-4 text-lg text-black">
          {confirmationMessage}
        </DialogDescription>
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRemoveModal(false)}
          >
            Cancel
          </Button>
          <Button variant="destructive" size="sm" onClick={onRemove}>
            Remove
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationModal;
