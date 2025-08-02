/**
 * Utility functions for handling Ethereum provider injection
 * Prevents "Cannot redefine property: ethereum" errors
 */

declare global {
  interface Window {
    ethereum?: any;
  }
}

/**
 * Safely initializes the Ethereum provider
 * Prevents multiple injections and handles existing providers
 */
export const initEthereumProvider = () => {
  if (typeof window === 'undefined') {
    return; // Skip in SSR/SSG
  }

  // Check if ethereum is already defined
  if (window.ethereum) {
    console.log('Ethereum provider already exists');
    return window.ethereum;
  }

  try {
    // Only define if not already present
    if (!window.ethereum) {
      Object.defineProperty(window, 'ethereum', {
        value: {},
        writable: true,
        configurable: true,
        enumerable: true,
      });
      console.log('Initialized empty Ethereum provider');
    }
    
    return window.ethereum;
  } catch (error) {
    console.error('Error initializing Ethereum provider:', error);
    return null;
  }
};

/**
 * Gets the Ethereum provider, initializing it if necessary
 */
export const getEthereumProvider = () => {
  if (typeof window === 'undefined') return null;
  return window.ethereum || initEthereumProvider();
};
