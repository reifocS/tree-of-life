import { useDrag } from "@use-gesture/react";
import { useState } from "react";
import RichTextEditor from "./RichTextEditor";

export default function Editor() {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const bind = useDrag(({ offset: [x, y] }) => {
    setOffset({ x, y });
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        userSelect: "none",
        right: 0,
        padding: 10,
        transform: `translate(${offset.x}px, ${offset.y}px)`,
      }}
    >
      <div
        {...bind()}
        style={{
          backgroundColor: "#eee",
          textAlign: "center",
          cursor: "move",
          touchAction: "none",
          fontSize: "1.5rem",
          fontWeight: "600",
        }}
      >
        ...
      </div>
      <RichTextEditor />
    </div>
  );
}
