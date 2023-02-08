import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Inter } from "@next/font/google";
import { useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "../components/App/ErrorBoundary";
import { Model, Seance, User } from "../types";
import useLocalStorage from "../hooks/useLocalStorage";
const inter = Inter({ subsets: ["latin"] });
import { Toaster } from 'react-hot-toast';

function MyApp({ Component, pageProps }: AppProps) {
  const [, setModels] = useLocalStorage<Model[]>("models", []);
  const [, setUsers] = useLocalStorage<User[]>("users", []);
  const [, setSeances] = useLocalStorage<Seance[]>("tof-seance", []);

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
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => {
          setModels([]);
          setUsers([]);
          setSeances([]);
        }}
      >
        <Component {...pageProps} />
        <Toaster/>
      </ErrorBoundary>
    </>
  );
}

export default MyApp;
