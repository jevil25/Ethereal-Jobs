import { useState, useEffect } from "react";
import FontsZhCSR from "./FontsZh";
import { getAllFontFamiliesToLoad } from "./lib";

/**
 * Empty component to lazy load non-english fonts CSS conditionally
 *
 * Reference: https://prawira.medium.com/react-conditional-import-conditional-css-import-110cc58e0da6
 */
export const NonEnglishFontsCSSLazyLoader = () => {
  const [shouldLoadFontsZh, setShouldLoadFontsZh] = useState(false);

  useEffect(() => {
    if (getAllFontFamiliesToLoad().includes("NotoSansSC")) {
      setShouldLoadFontsZh(true);
    }
  }, []);

  return <>{shouldLoadFontsZh && <FontsZhCSR />}</>;
};
