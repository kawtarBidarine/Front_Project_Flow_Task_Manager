/**
 * Load data from localStorage
 * @param {string} key - The storage key
 * @returns {any|null} - Parsed data or null if not found
 */
export function loadFromStorage(key) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error loading from localStorage (${key}):`, error);
    return null;
  }
}

/**
 * Save data to localStorage
 * @param {string} key - The storage key
 * @param {any} data - The data to store
 * @returns {boolean} - Success status
 */
export function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`Data saved to localStorage (${key})`);
    return true;
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
    return false;
  }
}

/**
 * Remove data from localStorage
 * @param {string} key - The storage key
 * @returns {boolean} - Success status
 */
export function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
    console.log(`Data removed from localStorage (${key})`);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
    return false;
  }
}

/**
 * Clear all data from localStorage
 * @returns {boolean} - Success status
 */
export function clearStorage() {
  try {
    localStorage.clear();
    console.log('localStorage cleared');
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
}