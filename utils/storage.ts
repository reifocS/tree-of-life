export function localStorageGetItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }
  
  export function localStorageRemoveItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {}
  }
  
  export function localStorageSetItem(key: string, value: string): void {
    try {
      return localStorage.setItem(key, value);
    } catch (error) {}
  }
  