import { useDrag } from "@use-gesture/react";
import { useRouter } from "next/router";
import { useState } from "react";
import RichTextEditor from "./RichTextEditor";

export default function Editor() {
  const [offset, setOffset] = useState({
    x: 0,
    y: 0,
  });
  const router = useRouter();
  const { room } = router.query;
  const [hide, setHide] = useState(true);
  const bind = useDrag(({ offset: [x, y] }) => {
    setOffset({ x, y });
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        userSelect: "none",
        width: "400px",
        right: 0,
        padding: 10,
        transform: `translate(${offset.x}px, ${offset.y}px)`,
      }}
    >
      <div
        style={{
          backgroundColor: "#eee",
          textAlign: "center",
          cursor: "move",
          fontSize: "1.5rem",
          fontWeight: "600",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          {...bind()}
          style={{
            width: "85%",
            touchAction: "none",
          }}
        >
          <svg
            width="20"
            height="10"
            viewBox="0 0 28 14"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="2" cy="2" r="2"></circle>
            <circle cx="14" cy="2" r="2"></circle>
            <circle cx="26" cy="2" r="2"></circle>
            <circle cx="2" cy="12" r="2"></circle>
            <circle cx="14" cy="12" r="2"></circle>
            <circle cx="26" cy="12" r="2"></circle>
          </svg>
        </div>
        <div
          onClick={() => {
            setHide((prev) => !prev);
          }}
          style={{
            textAlign: "center",
            cursor: "pointer",
            touchAction: "none",
            fontSize: "1rem",
            fontWeight: "600",
            width: "15%",
          }}
        >
          <svg
            width="12"
            height="8"
            viewBox="0 0 9 5"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              transform: `rotate(${hide ? "90" : "0"}deg)`,
              transition: "transform 150ms linear",
            }}
          >
            <path d="M3.8 4.4c.4.3 1 .3 1.4 0L8 1.7A1 1 0 007.4 0H1.6a1 1 0 00-.7 1.7l3 2.7z"></path>
          </svg>
        </div>
      </div>

      <RichTextEditor shouldHide={hide} id={room as string} />
    </div>
  );
}
