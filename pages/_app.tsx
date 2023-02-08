import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Inter } from '@next/font/google'
import { useEffect } from "react";
const inter = Inter({ subsets: ['latin'] })


function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const version = "1.0.6"; // remember to update this
    if (localStorage.getItem("version") != version) {
      localStorage.clear();
      localStorage.setItem("version", version);
    }
  });
  return (
    <>
      <style jsx global>{`
        html {
          font-family: ${inter.style.fontFamily};
        }
      `}</style>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
