import { IconType } from "react-icons";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaTwitter,
  FaYoutube,
  FaTiktok,
  FaGlobe,
} from "react-icons/fa";

export type SocialPlatformType =
  | "facebook"
  | "instagram"
  | "linkedin"
  | "twitter"
  | "youtube"
  | "tiktok"
  | "generic";

export interface SocialPlatformDetails {
  type: SocialPlatformType;
  name: string;
  Icon: IconType;
  colorClass: string; // Dynamic Tailwind text color styles
}

/**
 * Checks a URL string and detects if it matches any major social media platform.
 * Returns information about the detected platform, including its brand icon and styling color class.
 */
export function detectSocialPlatform(url: string | undefined | null): SocialPlatformDetails {
  if (!url) {
    return {
      type: "generic",
      name: "Website",
      Icon: FaGlobe,
      colorClass: "text-blue-600 hover:text-blue-700",
    };
  }

  const normalizedUrl = url.toLowerCase().trim();

  if (normalizedUrl.includes("facebook.com") || normalizedUrl.includes("fb.com")) {
    return {
      type: "facebook",
      name: "Facebook",
      Icon: FaFacebook,
      colorClass: "text-blue-600 hover:text-blue-700",
    };
  }

  if (normalizedUrl.includes("instagram.com")) {
    return {
      type: "instagram",
      name: "Instagram",
      Icon: FaInstagram,
      colorClass: "text-pink-600 hover:text-pink-700",
    };
  }

  if (normalizedUrl.includes("linkedin.com")) {
    return {
      type: "linkedin",
      name: "LinkedIn",
      Icon: FaLinkedin,
      colorClass: "text-blue-700 hover:text-blue-800",
    };
  }

  if (normalizedUrl.includes("twitter.com") || normalizedUrl.includes("x.com")) {
    return {
      type: "twitter",
      name: "Twitter / X",
      Icon: FaTwitter,
      colorClass: "text-gray-900 hover:text-black dark:text-gray-100 dark:hover:text-white",
    };
  }

  if (normalizedUrl.includes("youtube.com") || normalizedUrl.includes("youtu.be")) {
    return {
      type: "youtube",
      name: "YouTube",
      Icon: FaYoutube,
      colorClass: "text-red-600 hover:text-red-700",
    };
  }

  if (normalizedUrl.includes("tiktok.com")) {
    return {
      type: "tiktok",
      name: "TikTok",
      Icon: FaTiktok,
      colorClass: "text-black hover:text-gray-800 dark:text-white dark:hover:text-gray-200",
    };
  }

  return {
    type: "generic",
    name: "Website",
    Icon: FaGlobe,
    colorClass: "text-blue-600 hover:text-blue-700",
  };
}

/**
 * Ensures that a URL begins with a protocol (http:// or https://)
 * so it resolves as an absolute link instead of a relative route within the app.
 */
export function formatUrl(url: string | undefined | null): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}
