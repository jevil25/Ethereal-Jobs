import React, { useState, useRef, useEffect } from "react";

interface EditableTextProps {
  initialValue: string;
  onSave: (value: string) => void;
  className?: string;
  multiline?: boolean;
  placeholder?: string;
}

const EditableText: React.FC<EditableTextProps> = ({
  initialValue,
  onSave,
  className = "",
  multiline = false,
  placeholder = "Click to edit",
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const editableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && editableRef.current) {
      editableRef.current.focus();
    }
  }, [isEditing]);

  const handleClick = () => {
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    const newValue = editableRef.current?.textContent || "";
    if (newValue !== initialValue) {
      setValue(newValue);
      onSave(newValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      setIsEditing(false);
      const newValue = editableRef.current?.textContent || "";
      setValue(newValue);
      onSave(newValue);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsEditing(false);
      if (editableRef.current) {
        editableRef.current.textContent = initialValue;
      }
    }
  };

  return (
    <div
      ref={editableRef}
      contentEditable={isEditing}
      onClick={handleClick}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`
        hover: cursor-text
        ${className}
        ${isEditing ? "cursor-text bg-gray-100" : ""}
        ${!value && !isEditing ? "text-gray-400 italic" : ""}
        outline-none cursor-text rounded px-1 inline-block
      `}
      suppressContentEditableWarning={true}
    >
      {value || placeholder}
    </div>
  );
};

export default EditableText;