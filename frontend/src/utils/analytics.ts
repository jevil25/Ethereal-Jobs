import axios from 'axios';

interface AnalyticsData {
  source: string;
  device: string;
  browser: string;
  timeSpent: number; // in milliseconds
  pageName: string;
  userId?: string; // Optional: User ID for logged-in users
  isNewUser?: boolean; // Optional: Flag for new users
  country?: string; // Optional, as it requires backend IP lookup
}

let pageEntryTime: number | null = null;

export const startTracking = () => {
  pageEntryTime = performance.now();
  console.log("Analytics tracking started.");
};

export const stopTracking = async (pageName: string, userId?: string, isNewUser?: boolean) => {
  if (pageEntryTime === null) {
    console.warn("Tracking not started. Cannot stop tracking.");
    return;
  }

  const timeSpent = performance.now() - pageEntryTime;
  pageEntryTime = null; // Reset for next page view

  const userAgent = navigator.userAgent;
  const device = getDeviceType(userAgent);
  const browser = getBrowserType(userAgent);
  const source = document.referrer || "direct";

  const analyticsData: AnalyticsData = {
    source,
    device,
    browser,
    timeSpent,
    pageName,
    ...(userId && { userId }),
    ...(isNewUser !== undefined && { isNewUser }),
    // country: '' // Will be added by backend or a separate service
  };

  try {
    // Replace with your actual backend analytics endpoint
    await axios.post('/api/analytics', analyticsData);
    console.log("Analytics data sent:", analyticsData);
  } catch (error) {
    console.error("Failed to send analytics data:", error);
  }
};

const getDeviceType = (userAgent: string): string => {
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
    return "tablet";
  }
  if (
    /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|LRX|Mobi|Palm|CriOS/i.test(
      userAgent,
    )
  ) {
    return "mobile";
  }
  return "desktop";
};

const getBrowserType = (userAgent: string): string => {
  if (userAgent.indexOf("Firefox") > -1) {
    return "Firefox";
  }
  if (userAgent.indexOf("SamsungBrowser") > -1) {
    return "SamsungBrowser";
  }
  if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) {
    return "Opera";
  }
  if (userAgent.indexOf("Trident") > -1) {
    return "IE";
  }
  if (userAgent.indexOf("Edge") > -1) {
    return "Edge";
  }
  if (userAgent.indexOf("Chrome") > -1) {
    return "Chrome";
  }
  if (userAgent.indexOf("Safari") > -1) {
    return "Safari";
  }
  return "Unknown";
};
