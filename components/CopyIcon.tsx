import { useState } from "react";

export default function CopyIcon() {
  const [copied, setCopied] = useState(false);
  function onCopy() {
    if (copied) return;
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  return (
    <div
      onClick={onCopy}
      style={{
        position: "absolute",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        top: 40,
        boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.01)",
        backgroundColor: "#eee",
        borderRadius: 6,
        padding: "10px",
        left: 20,
        fontSize: "small",
        userSelect: "none",
        cursor: "pointer",
      }}
    >
      Copier le lien dans le presse papier
      <svg
        aria-hidden="true"
        focusable="false"
        role="img"
        viewBox="0 0 384 512"
        width={20}
        fill={"#eee"}
        height={20}
      >
        <path
          fill="currentColor"
          d="M384 112v352c0 26.51-21.49 48-48 48H48c-26.51 0-48-21.49-48-48V112c0-26.51 21.49-48 48-48h80c0-35.29 28.71-64 64-64s64 28.71 64 64h80c26.51 0 48 21.49 48 48zM192 40c-13.255 0-24 10.745-24 24s10.745 24 24 24 24-10.745 24-24-10.745-24-24-24m96 114v-20a6 6 0 0 0-6-6H102a6 6 0 0 0-6 6v20a6 6 0 0 0 6 6h180a6 6 0 0 0 6-6z"
        ></path>
      </svg>
      {copied && <div>✔️</div>}
    </div>
  );
}
