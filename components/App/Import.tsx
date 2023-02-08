import { useRef } from "react";
import useLocalStorage from "../../hooks/useLocalStorage";
import { Model, Seance, User } from "../../types";
import toast from "react-hot-toast";
import { z } from "zod";

const schemaModel = z.array(
  z.object({
    name: z.string(),
    elements: z.array(z.any()),
    id: z.string(),
  })
);

const schemaUser = z.array(
  z.object({
    name: z.string(),
    modelId: z.string(),
    id: z.string(),
  })
);

const schemaSeance = z.record(z.string(), z.any());

const dataModel = z.object({
  models: schemaModel,
  seances: schemaSeance,
  users: schemaUser,
});

export default function Import() {
  const [, setModels] = useLocalStorage<Model[]>("models", []);
  const [, setUsers] = useLocalStorage<User[]>("users", []);
  const [, setSeances] = useLocalStorage<Seance>("tof-seance", {});
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <form
      className="flex flex-col"
      onSubmit={(e) => {
        e.preventDefault();
        const file = fileRef.current?.files?.item(0);
        if (!file) return;
        const reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function (evt) {
          if (typeof evt.target?.result === "string") {
            try {
              const data = JSON.parse(evt.target?.result);
              const parsed = dataModel.parse(data);
              setModels(parsed.models);
              setUsers(parsed.users);
              setSeances(parsed.seances);
              toast("Données importées.");
            } catch (e) {
              toast(
                "Erreur dans l'importation des données, le format est probablement invalide."
              );
            }
          }
        };
      }}
    >
      <button
        title="Importer les données à partir des données téléchargées"
        className="inline-flex justify-between
      text-white font-extrabold text-xl bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300  rounded-lg px-5 py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
      >
        Importer les données
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
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
      </button>
      <input
        required
        ref={fileRef}
        type="file"
        accept=".json"
        placeholder="Importer les données"
      ></input>
    </form>
  );
}
