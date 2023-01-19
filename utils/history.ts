import history from "history/browser";

const CUSTOM_CHANGE_EVENT_TYPE = "sync-external-store-changed";

// Max index is an in-memory value,
// because it shouldn't change as we step backwards in history-
// only as we push new items to history.
let maxIndex = getCurrentIndex();

export function getCurrentIndex() {
  if ((history.location as any).state?.index >= 0) {
    return (history.location as any).state?.index;
  } else {
    return 0;
  }
}

export function getMaxIndex() {
  return maxIndex;
}

export function saveSearchToHistory(search: string) {
  const currentIndex = getCurrentIndex();

  // Saving a new URL always throws away history after the current state.
  maxIndex = currentIndex + 1;

  history.push({ search }, { index: currentIndex + 1 });

  // History API events aren't dispatched when JS changes the history,
  // so we use our own event type to signal a re-render is needed.
  window.dispatchEvent(new Event(CUSTOM_CHANGE_EVENT_TYPE));
}

export function subscribeToHistory(callback: (...args: any) => void) {
  return history.listen(callback);
}
