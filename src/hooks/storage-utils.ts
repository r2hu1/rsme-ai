// Robust localStorage utilities with SSR compatibility and error handling
export class StorageManager {
  private static isClient = typeof window !== 'undefined';
  
  static setItem(key: string, value: any): boolean {
    if (!this.isClient) return false;
    
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      return false;
    }
  }

  static getItem<T>(key: string, defaultValue?: T): T | null {
    if (!this.isClient) return defaultValue ?? null;
    
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue ?? null;
      
      return JSON.parse(item);
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return defaultValue ?? null;
    }
  }

  static removeItem(key: string): boolean {
    if (!this.isClient) return false;
    
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
      return false;
    }
  }

  static clear(): boolean {
    if (!this.isClient) return false;
    
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
      return false;
    }
  }

  static isAvailable(): boolean {
    if (!this.isClient) return false;
    
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, 'test');
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
}

// Debounce utility for auto-save functionality
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
