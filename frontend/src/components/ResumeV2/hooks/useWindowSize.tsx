import { useEffect } from "react";

export const useWindowSize = (callback: (width: number) => void) => {
  useEffect(() => {
    const handleResize = () => {
      callback(window.innerWidth);
    };

    // Initial call
    handleResize();

    // Set up event listener
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => window.removeEventListener("resize", handleResize);
  }, [callback]);
};
