import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import useLocalStorage from "../../hooks/useLocalStorage";
import useModal from "../../hooks/useModal";
import { Model, Seance, User } from "../../types";
import { generateCollaborationLink } from "../../utils/crypto";

function EditPatientModal({
  onClose,
  user,
}: {
  onClose: (u: string, t: string) => void;
  user: User;
}) {
  const [name, setName] = useState(user.name);
  const [models] = useLocalStorage<Model[]>("models", []);
  const [selectedModel, setSelectedModel] = useState(user.modelId);

  function onClick() {
    if (name.trim() === "") return;
    onClose(name, selectedModel);
  }

  return (
    <div className="lg:w-[600px]">
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <div className="relative mb-4">
          <label
            htmlFor="name"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            name
          </label>
          <input
            value={name}
            required
            onChange={(e) => {
              const { value } = e.target;
              setName(value);
            }}
            id="name"
            name="name"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
        </div>
        <div className="relative mb-4">
          <label
            htmlFor="model"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            arbre associé
          </label>
          <select
            id="model"
            value={selectedModel}
            name="model"
            onChange={(e) => {
              setSelectedModel(e.target.value);
            }}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            {models.map((m) => (
              <option value={m.id} key={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end justify-end">
          <button
            onClick={onClick}
            className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
          >
            Sauvegarder
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Patient({ user }: { user: User }) {
  const [, setUsers] = useLocalStorage<User[]>("users", []);
  const [seances] = useLocalStorage<Seance>("tof-seance", {});
  const [modal, showModal] = useModal();
  let histo = Object.entries(seances).filter(([, v]) => {
    return v.userId === user.id;
  });
  const router = useRouter();

  histo.sort(function (a, b) {
    // Turn your strings into dates, and then subtract them
    // to get a value that is either negative, positive, or zero.
    const dateA = new Date(a[1].date).getTime();
    const dateB = new Date(b[1].date).getTime();
    return dateA < dateB ? 1 : -1;
  });

  const lastSeance = histo[0];

  return (
    <div className="flex flex-col flex-1 gap-3 p-3 items-center justify-center bg-gray-800 rounded">
      <h3 className="font-extrabold text-center text-xl">{user.name}</h3>
      <div className="grid grid-cols-3 gap-4">
        <Link
          href={generateCollaborationLink(`/arbre/${user.id}`)}
          className="inline-flex items-center justify-center h-14 box-border px-8 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent font-semibold bg-indigo-brand text-white bg-indigo-500 hover:bg-indigo-600 focus:ring-indigo-200 transition-colors duration-200 w-full"
        >
          Nouvelle séance
        </Link>
        <button
          disabled={lastSeance === undefined}
          onClick={() => {
            router.push(`/arbre/${lastSeance[1].userId}?room=${lastSeance[0]}`);
          }}
          className="disabled:opacity-70 inline-flex items-center justify-center h-14 box-border px-8 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent font-semibold bg-indigo-brand text-white bg-indigo-500 hover:bg-indigo-600 focus:ring-indigo-200 transition-colors duration-200 w-full"
        >
          Reprendre séance
        </button>
        <p className="font-bold inline-flex items-center justify-center">
          {lastSeance && new Date(lastSeance[1].date).toLocaleString()}
        </p>
        <Link
          href={`/historique/${user.id}`}
          className="inline-flex items-center justify-center h-14 box-border px-8 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent font-semibold bg-indigo-brand text-white bg-indigo-500 hover:bg-indigo-600 focus:ring-indigo-200 transition-colors duration-200 w-full"
        >
          Historique
        </Link>
        <button
          onClick={() => {
            showModal("Changer patient", (onClose) => (
              <EditPatientModal
                user={user}
                onClose={(userName: string, treeId: string) => {
                  setUsers((prev) =>
                    prev.map((u) => {
                      if (u.id === user.id) {
                        return {
                          ...u,
                          name: userName,
                          modelId: treeId,
                        };
                      }
                      return u;
                    })
                  );
                  onClose();
                }}
              />
            ));
          }}
          className="inline-flex items-center justify-center h-14 box-border px-8 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent font-semibold bg-indigo-brand text-white bg-indigo-500 hover:bg-indigo-600 focus:ring-indigo-200 transition-colors duration-200 w-full"
        >
          Changer d&apos;arbre
        </button>
        <button
          onClick={() => {
            setUsers((prev) => prev.filter((u) => u.id !== user.id));
          }}
          className="inline-flex items-center justify-center h-14 box-border px-8 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent font-semibold bg-indigo-brand text-white bg-red-500 hover:bg-red-600 focus:ring-red-200 transition-colors duration-200 w-full"
        >
          Supprimer patient
        </button>
      </div>
      {modal}
    </div>
  );
}
