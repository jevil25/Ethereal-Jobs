import React from "react";

export interface DiffSectionProps<T> {
  title: string;
  items: T[];
  diffInfo: {
    unchanged: T[];
    modified?: Array<{ original: T; updated: T }>;
    added?: T[];
    removed?: T[];
  };
  isOptimized: boolean;
  renderItem: (
    item: T,
    status: "unchanged" | "added" | "removed" | "modified",
    index: number,
    originalItem?: T,
  ) => React.ReactNode;
}

export function DiffSection<T>({
  title,
  items,
  diffInfo,
  isOptimized,
  renderItem,
}: DiffSectionProps<T>) {
  if (items.length === 0) return null;

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-3 text-gray-800">{title}</h2>

      {/* Unchanged items */}
      {diffInfo.unchanged.map((item, index) => (
        <div key={`unchanged-${index}`} className="mb-5">
          {renderItem(item, "unchanged", index)}
        </div>
      ))}

      {/* Modified items */}
      {diffInfo.modified &&
        diffInfo.modified.map(({ original, updated }, index) => (
          <div
            key={`modified-${index}`}
            className="mb-5 border-l-4 border-blue-400 pl-3"
          >
            {renderItem(
                isOptimized ? updated : original,
                "modified",
                index,
                isOptimized ? original : updated,
            )}
          </div>
        ))}

      {/* Added items (only in optimized view) */}
      {isOptimized &&
        diffInfo.added &&
        diffInfo.added.map((item, index) => (
          <div
            key={`added-${index}`}
            className="mb-5 border-l-4 border-green-500 pl-3 bg-green-50"
          >
            {renderItem(item, "added", index)}
          </div>
        ))}

      {/* Removed items (only in original view) */}
      {!isOptimized &&
        diffInfo.removed &&
        diffInfo.removed.map((item, index) => (
          <div
            key={`removed-${index}`}
            className="mb-5 border-l-4 border-red-500 pl-3 bg-red-50"
          >
            {renderItem(item, "removed", index)}
          </div>
        ))}
    </div>
  );
}
