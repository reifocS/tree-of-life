import { useCallback, useState } from "react";

export default function useHistory<T>(initialState: T) {
  const [historyState, setHistory] = useState<{
    history: T[];
    redoStack: T[];
  }>({
    history: [initialState],
    redoStack: [],
  });

  const addToRedoStack = (entry: T) => {
    setHistory((prev) => ({
      ...prev,
      redoStack: [...prev.redoStack, entry],
    }));
  };

  const pushEntry = useCallback((entry: T) => {
    setHistory((prev) => ({
      ...prev,
      history: [...prev.history, entry],
    }));
  }, []);
  const clearRedoStack = useCallback(() => {
    setHistory((prev) => ({
      ...prev,
      redoStack: [],
    }));
  }, []);

  const synchronize = useCallback(
    (entry: T) => {
      pushEntry(entry);
      clearRedoStack();
    },
    [clearRedoStack, pushEntry]
  );

  const redoOnce = (state: T) => {
    const redoStack = [...historyState.redoStack];
    const entryToRestore = redoStack.pop();
    if (entryToRestore !== undefined) {
      setHistory((prev) => ({
        ...prev,
        history: [...prev.history, state],
      }));
      return entryToRestore;
    }
  };

  const undoOnce = () => {
    if (historyState.history.length === 0) {
      return null;
    }
    const copyHistory = [...historyState.history];
    const currentEntry = copyHistory.pop();
    const entryToRestore = copyHistory[copyHistory.length - 1];

    if (currentEntry !== undefined) {
      addToRedoStack(currentEntry);
      setHistory((prev) => ({
        ...prev,
        history: prev.history.slice(0, -1),
      }));
      return entryToRestore;
    }

    return null;
  };

  return {
    undoOnce,
    redoOnce,
    historyState,
    addToRedoStack,
    clearRedoStack,
    pushEntry,
    synchronize,
  };
}
