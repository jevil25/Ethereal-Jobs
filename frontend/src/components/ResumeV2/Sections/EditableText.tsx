import React, { useState, useRef, useEffect } from "react";

interface EditableTextProps {
  initialValue: string;
  onSave: (value: string) => void;
  isEditable?: boolean;
  className?: string;
  multiline?: boolean;
  placeholder?: string;
}

const EditableText: React.FC<EditableTextProps> = ({
  initialValue,
  onSave,
  isEditable = true,
  className = "",
  multiline = false,
  placeholder = "Click to edit",
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const editableRef = useRef<HTMLDivElement>(null);
  const shouldUpdateRef = useRef(false);
  
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (isEditing && editableRef.current) {
      editableRef.current.focus();
      
      if (!shouldUpdateRef.current) {
        const selection = window.getSelection();
        const range = document.createRange();
        if (editableRef.current.childNodes.length > 0) {
          range.setStart(
            editableRef.current.childNodes[0],
            editableRef.current.textContent?.length || 0,
          );
          range.collapse(true);
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      }
    }
  }, [isEditing]);

  const handleClick = () => {
    if (isEditable && !isEditing) {
      setIsEditing(true);
      shouldUpdateRef.current = false;
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    shouldUpdateRef.current = false;
    if (!isEditable) return;
    const newValue = editableRef.current?.textContent || "";
    setValue(newValue);
    onSave(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isEditable) return;
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      setIsEditing(false);
      shouldUpdateRef.current = false;
      const newValue = editableRef.current?.textContent || "";
      setValue(newValue);
      onSave(newValue);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsEditing(false);
      shouldUpdateRef.current = false;
      if (editableRef.current) {
        editableRef.current.textContent = value;
      }
    }
  };

  const handleInput = () => {
    if (!isEditable) return;
    shouldUpdateRef.current = true;
  };

  return (
    <div
      ref={editableRef}
      contentEditable={isEditable && isEditing}
      onClick={handleClick}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onInput={handleInput}
      className={`
        ${className}
        ${isEditing ? "cursor-text bg-gray-100" : "hover:cursor-text"}
        ${!value && !isEditing ? "text-gray-400 italic" : ""}
        outline-none rounded px-1 inline-block
      `}
      suppressContentEditableWarning={true}
    >
      {value || placeholder}
    </div>
  );
};

export default EditableText;