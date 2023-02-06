import { Html, Head, Main, NextScript } from "next/document";
import { useEffect } from "react";

export default function Document() {
  useEffect(() => {
    const version = "1.0.4"; // remember to update this
    if (localStorage.getItem("version") != version) {
      localStorage.clear();
      localStorage.setItem("version", version);
    }
  });
  return (
    <Html lang="en-us" className="h-full">
      <Head />
      <body className="min-h-screen flex flex-col w-full overflow-x-hidden bg-gray-900 text-gray-200">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
