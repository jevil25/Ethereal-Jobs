// Utility functions for comparing resume data

const compareArrays = (original: string[], updated: string[]) => {
    // Create frequency maps instead of simple Sets
    const originalFreq = new Map();
    const updatedFreq = new Map();

    if (!original || !updated) {
        return {
            removed: original,
            added: updated,
            unchanged: [],
        };
    }
    
    // Count occurrences in original array
    original.forEach(item => {
      originalFreq.set(item, (originalFreq.get(item) || 0) + 1);
    });
    
    // Count occurrences in updated array
    updated.forEach(item => {
      updatedFreq.set(item, (updatedFreq.get(item) || 0) + 1);
    });
    
    // Calculate removed items (in original but not in updated or fewer occurrences)
    const removed = original.filter(item => {
      const originalCount = originalFreq.get(item);
      const updatedCount = updatedFreq.get(item) || 0;
      return originalCount > updatedCount;
    });
    
    // Calculate added items (in updated but not in original or more occurrences)
    const added = updated.filter(item => {
      const originalCount = originalFreq.get(item) || 0;
      const updatedCount = updatedFreq.get(item);
      return updatedCount > originalCount;
    });
    
    // Calculate unchanged items (equal number of occurrences)
    const unchanged = original.filter(item => {
      const originalCount = originalFreq.get(item);
      const updatedCount = updatedFreq.get(item) || 0;
      return originalCount === updatedCount;
    });
        
    return {
      removed,
      added,
      unchanged,
    };
  };

// Helper to compare array objects by a key field
const compareObjectArrays = <T extends Record<string, any>>(
  original: T[],
  updated: T[],
  keyFn: (item: T) => string,
) => {
  const originalKeys = new Set(original.map(keyFn));
  const updatedKeys = new Set(updated.map(keyFn));

  const removed = original.filter((item) => !updatedKeys.has(keyFn(item)));
  const added = updated.filter((item) => !originalKeys.has(keyFn(item)));

  // For unchanged items, we need to find matches and check if any properties changed
  const possiblyChanged = original.filter((item) =>
    updatedKeys.has(keyFn(item)),
  );
  const unchanged: T[] = [];
  const modified: { original: T; updated: T }[] = [];

  possiblyChanged.forEach((origItem) => {
    const updatedItem = updated.find((item) => keyFn(item) === keyFn(origItem));
    if (updatedItem) {
      // Check if any properties differ
      let hasChanges = false;
      for (const key in origItem) {
        if (origItem[key] !== updatedItem[key]) {
          hasChanges = true;
          break;
        }
      }

      if (hasChanges) {
        modified.push({ original: origItem, updated: updatedItem });
      } else {
        unchanged.push(origItem);
      }
    }
  });

  return {
    removed,
    added,
    unchanged,
    modified,
  };
};

// Compare bullet points in description
const compareBulletPoints = (original: string, updated: string) => {
  const originalBullets = original.split("\n").filter((line) => line.trim());
  const updatedBullets = updated.split("\n").filter((line) => line.trim());

  return compareArrays(originalBullets, updatedBullets);
};

export const compareData = {
  compareArrays,
  compareObjectArrays,
  compareBulletPoints,
};
