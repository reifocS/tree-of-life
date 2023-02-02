import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
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
