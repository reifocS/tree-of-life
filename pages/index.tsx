import { NextPage } from "next";
import Link from "next/link";
import { useEffect, useRef } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { Model } from "../types";
import getDefaultModel from "../utils/defaultModel";

const Models: NextPage = () => {
  const [models, setLocalStorage] = useLocalStorage<Model[]>("models", []);
  const ref = useRef<HTMLCanvasElement>(null);

  // Create a default tree when there is none
  useEffect(() => {
    if (models.length === 0) {
      const modelByDefault = getDefaultModel(ref.current!);
      setLocalStorage((prev) => [...prev, modelByDefault]);
    }
  }, [models, setLocalStorage]);

  return (
    <>
      <h1 className="mt-10 text-center mb-10 text-5xl font-extrabold">
        L&apos;arbre de vie
      </h1>
      <canvas ref={ref} style={{ display: "none" }} />
      <div className="flex items-center justify-center">
        <Link
          className="text-white inline-flex gap-2 font-extrabold text-xl bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 rounded-lg px-5 py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
          href="/patients"
        >
          Mes patients{" "}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
            />
          </svg>
        </Link>
        <Link
          className="inline-flex gap-2
           text-white font-extrabold text-xl bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300  rounded-lg px-5 py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
          href="/arbre/edit"
        >
          Mes arbres
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
            />
          </svg>
        </Link>
      </div>
    </>
  );
};

export default Models;
