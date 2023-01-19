import { Dispatch, SetStateAction, useMemo, useSyncExternalStore } from "react";
import history from "history/browser";
import { saveSearchToHistory, subscribeToHistory } from "../utils/history";
import useEventCallback from "./useEventCallback";

function getSnapshot() {
  try {
    const search = history.location.search;
    if (search) {
      return decodeURIComponent(escape(window.atob(search.substr(1))));
    }
  } catch (error) {
    console.error(error);
  }
  return null;
}

type SetValue<T> = Dispatch<SetStateAction<T>>;

// Params defaultData and validateCallback should both be stable/memoized
export default function useURLData<T>(
  defaultData: T
): [data: T, setData: SetValue<T>] {
  const snapshot = useSyncExternalStore(subscribeToHistory, getSnapshot);
  const data: T = useMemo(() => {
    try {
      const parsed = JSON.parse(snapshot!);
      return parsed || defaultData;
    } catch (error) {
      console.error(error);
    } finally {
    }
    return defaultData;
  }, [defaultData, snapshot]);

  // No need to mirror in React state; just save to the location.
  // This will trigger a re-render via the useSyncExternalStore subscription.

  const setValue: SetValue<T> = useEventCallback((value) => {
    // Prevent build error "window is undefined" but keeps working
    if (typeof window === "undefined") {
      console.warn(
        `Tried setting url value even though environment is not a client`
      );
    }

    try {
      // Allow value to be a function so we have the same API as useState
      const newValue = value instanceof Function ? value(data) : value;

      // Save to local storage

      // Save state
      const string = JSON.stringify(newValue);
      const encoded = btoa(unescape(encodeURIComponent(string)));

      saveSearchToHistory(encoded);

      // We dispatch a custom event so every useLocalStorage hook are notified
      window.dispatchEvent(new Event("local-storage"));
    } catch (error) {
      console.warn(`Error setting url data”:`, error);
    }
  });
  return [data, setValue];
}
