/**
 * Avatar utility functions
 * Generates consistent, colorful avatars based on user names
 */

const AVATAR_COLORS = [
  { bg: '3b82f6', text: 'fff', name: 'blue' },      // Blue
  { bg: '8b5cf6', text: 'fff', name: 'purple' },    // Purple
  { bg: 'ec4899', text: 'fff', name: 'pink' },      // Pink
  { bg: 'f59e0b', text: 'fff', name: 'amber' },     // Amber
  { bg: '10b981', text: 'fff', name: 'emerald' },   // Emerald
  { bg: '06b6d4', text: 'fff', name: 'cyan' },      // Cyan
  { bg: 'ef4444', text: 'fff', name: 'red' },       // Red
  { bg: '6366f1', text: 'fff', name: 'indigo' },    // Indigo
  { bg: 'f97316', text: 'fff', name: 'orange' },    // Orange
  { bg: '14b8a6', text: 'fff', name: 'teal' },      // Teal
  { bg: 'a855f7', text: 'fff', name: 'violet' },    // Violet
  { bg: 'eab308', text: 'fff', name: 'yellow' },    // Yellow
];

/**
 * Generate a consistent hash from a string
 * @param {string} str - Input string
 * @returns {number} Hash value
 */
function stringToHash(str) {
  let hash = 0;
  if (!str || str.length === 0) return hash;
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash);
}

/**
 * Get a consistent color based on a name
 * @param {string} name - User's name or identifier
 * @returns {object} Color object with bg and text properties
 */
export function getColorForName(name) {
  const hash = stringToHash(name || 'User');
  const colorIndex = hash % AVATAR_COLORS.length;
  return AVATAR_COLORS[colorIndex];
}

/**
 * Generate avatar URL using UI Avatars service
 * @param {string} name - User's name
 * @param {string} email - User's email (fallback)
 * @param {number} size - Avatar size in pixels (default: 128)
 * @returns {string} Avatar URL
 */
export function generateAvatarUrl(name, email, size = 128) {
  const displayName = name || email || 'User';
  const color = getColorForName(displayName);
  
  const params = new URLSearchParams({
    name: displayName,
    background: color.bg,
    color: color.text,
    size: size.toString(),
    bold: 'true',
    rounded: 'false'
  });
  
  return `https://ui-avatars.com/api/?${params.toString()}`;
}

/**
 * Get avatar URL for a user object
 * Checks if user has custom avatar, otherwise generates one
 * @param {object} user - User object with name, email, and avatar properties
 * @param {number} size - Avatar size in pixels (default: 128)
 * @returns {string} Avatar URL
 */
export function getUserAvatar(user, size = 128) {
  if (!user) {
    return generateAvatarUrl('User', null, size);
  }
  
  // Return custom avatar if exists
  if (user.avatar) {
    return user.avatar;
  }
  
  // Generate avatar from name or email
  return generateAvatarUrl(user.name, user.email, size);
}

/**
 * Get initials from name
 * @param {string} name - User's name
 * @returns {string} Initials (max 2 characters)
 */
export function getInitials(name) {
  if (!name) return 'U';
  
  const parts = name.trim().split(' ').filter(Boolean);
  
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Generate CSS background color for avatar
 * Useful for custom avatar components
 * @param {string} name - User's name
 * @returns {string} CSS color string
 */
export function getAvatarBackgroundColor(name) {
  const color = getColorForName(name);
  return `#${color.bg}`;
}

/**
 * Generate CSS text color for avatar
 * @param {string} name - User's name
 * @returns {string} CSS color string
 */
export function getAvatarTextColor(name) {
  const color = getColorForName(name);
  return `#${color.text}`;
}

export default {
  generateAvatarUrl,
  getUserAvatar,
  getColorForName,
  getInitials,
  getAvatarBackgroundColor,
  getAvatarTextColor
};