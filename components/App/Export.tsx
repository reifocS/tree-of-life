import { useRef } from "react";
import useReadLocalStorage from "../../hooks/useReadLocalStorage";
import { Model, Seance, User } from "../../types";

export default function Export() {
  const models = useReadLocalStorage<Model[]>("models");
  const users = useReadLocalStorage<User[]>("users");
  const seances = useReadLocalStorage<Seance[]>("tof-seance");
  const downloadRef = useRef<HTMLAnchorElement>(null);

  function download() {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify({ models, users, seances }));
    const dlAnchorElem = downloadRef.current!;
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "arbre-de-vie.json");
    dlAnchorElem.click();
  }
  return (
    <>
      <button
        onClick={() => {
          download();
        }}
        type="button"
        title="Télécharger les données pour les importer dans une autre session"
        className="inline-flex gap-2
      text-white font-extrabold text-xl bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300  rounded-lg px-5 py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
      >
        Télécharger les données
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
          />
        </svg>
        <span className="sr-only">Exporter les données</span>
      </button>
      <a ref={downloadRef} className="hidden"></a>
    </>
  );
}
