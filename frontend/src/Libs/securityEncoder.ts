/**
 * Pure data encoding/decoding helper for client-side security.
 * Follows Vertical Slice Architecture & project security constraints.
 */

/**
 * Encodes sensitive strings or element tokens into Base64 representation.
 * @param raw - The string to encode
 * @returns Base64 encoded string
 */
export const encodeData = (raw: string): string => {
  try {
    return btoa(encodeURIComponent(raw));
  } catch (e) {
    return "";
  }
};

/**
 * Safely decodes data in client memory when needed.
 * @param encoded - The Base64 encoded string
 * @returns Decoded raw string
 */
export const decodeData = (encoded: string): string => {
  try {
    return decodeURIComponent(atob(encoded));
  } catch (e) {
    return "";
  }
};

/**
 * Masks public email addresses in the DOM to prevent web scrapers from harvesting campus emails.
 * e.g. "library@jrmsu.edu.ph" -> "lib***@jrmsu.edu.ph"
 * @param email - The email to mask
 * @returns Masked email string
 */
export const maskEmail = (email: string): string => {
  if (!email || !email.includes("@")) return email;
  
  const [localPart, domain] = email.split("@");
  if (localPart.length <= 3) {
    return `${localPart[0]}***@${domain}`;
  }
  
  const visible = localPart.slice(0, 3);
  return `${visible}***@${domain}`;
};
