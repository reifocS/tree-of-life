import { useSyncExternalStore } from "react";
import history from "history/browser";
import {
  getCurrentIndex,
  getMaxIndex,
  subscribeToHistory,
} from "../../utils/history";
import styles from "./UndoRedo.module.css";
function getSnapshot() {
  // Stringify as a lazy way of avoiding invalidating snapshot via new array/object wrapper.
  return JSON.stringify([getCurrentIndex(), getMaxIndex()]);
}

function undo() {
  history.back();
}

function redo() {
  history.forward();
}

//Work In Progress
export default function UndoRedo() {
  const snapshot = useSyncExternalStore(subscribeToHistory, getSnapshot);
  const [currentIndex, maxIndex] = JSON.parse(snapshot);

  return (
    <div className={styles.IconContainer}>
      <button
        className={styles.ButtonOrLink}
        onClick={undo}
        disabled={currentIndex <= 0}
        title="Undo change"
      >
        <UndoIcon />
      </button>
      <button
        className={styles.ButtonOrLink}
        onClick={redo}
        disabled={currentIndex >= maxIndex}
        title="Redo change"
      >
        <RedoIcon />
      </button>
    </div>
  );
}

// https://materialdesignicons.com/
const RedoIcon = () => (
  <svg className={styles.Icon} viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M20 16L14.5 21.5L13.08 20.09L16.17 17H10.5C6.91 17 4 14.09 4 10.5S6.91 4 10.5 4H18V6H10.5C8 6 6 8 6 10.5S8 15 10.5 15H16.17L13.09 11.91L14.5 10.5L20 16Z"
    />
  </svg>
);

// https://materialdesignicons.com/
const UndoIcon = () => (
  <svg className={styles.Icon} viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M20 10.5C20 14.09 17.09 17 13.5 17H7.83L10.92 20.09L9.5 21.5L4 16L9.5 10.5L10.91 11.91L7.83 15H13.5C16 15 18 13 18 10.5S16 6 13.5 6H6V4H13.5C17.09 4 20 6.91 20 10.5Z"
    />
  </svg>
);
