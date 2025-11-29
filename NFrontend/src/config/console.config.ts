/**
 * Console configuration for production
 * Suppresses console.log in production while keeping errors visible
 */

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  // Suppress console.log in production
  console.log = () => {};
  
  // Keep console.warn and console.error for critical issues
  // but you can suppress them too if needed:
  // console.warn = () => {};
  // console.error = () => {};
}

export {};
