import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { guidGenerator } from "../../drawing";
import useLocalStorage from "../../hooks/useLocalStorage";
import useModal from "../../hooks/useModal";
import { Model, User } from "../../types";

const Patients = dynamic(import("../../components/App/Patients"), {
  ssr: false,
});

function CreatePatientModal({
  onClose,
}: {
  onClose: (u: string, t: string) => void;
}) {
  const [name, setName] = useState("");
  const [models] = useLocalStorage<Model[]>("models", []);
  const [selectedModel, setSelectedModel] = useState(models[0]?.id);

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

export default function PatientPage() {
  const [modal, showModal] = useModal();
  const [, setUsers] = useLocalStorage<User[]>("users", []);

  return (
    <div className="flex flex-col flex-1 h-full">
      <div className="h-8"></div>
      <div className="px-6 sm:px-8 flex flex-col w-full items-center justify-center gap-8">
        <div className="w-full relative">
          <div className="flex">
            <Link
              href="/"
              className="mb-2 inline-flex items-center justify-center xl:text-xl h-14 t box-border px-8 rounded bg-transparent text-white border-current hover:border-blue-brand focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-blue-200 focus:ring-opacity-80 font-semibold border-2"
            >
              Accueil
            </Link>
            <Link
              href="/arbre/edit"
              className="ml-auto mb-2 inline-flex items-center justify-center xl:text-xl h-14 t box-border px-8 rounded bg-transparent text-white border-current hover:border-blue-brand focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-blue-200 focus:ring-opacity-80 font-semibold border-2"
            >
              Gérer mes arbres
            </Link>
          </div>
          <h1 className="font-extrabold text-3xl text-center">Mes patients</h1>
        </div>

        <button
          onClick={() => {
            showModal("Nouveau patient", (onClose) => (
              <CreatePatientModal
                onClose={(userName: string, treeId: string) => {
                  setUsers((prev) => [
                    ...prev,
                    {
                      modelId: treeId,
                      name: userName,
                      id: guidGenerator(),
                    },
                  ]);
                  onClose();
                }}
              />
            ));
          }}
          className="inline-flex items-center justify-center xl:text-xl h-14 xl:h-16 box-border px-8 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent font-semibold bg-blue-brand text-white bg-indigo-500 hover:bg-indigo-600 focus:ring-indigo-200 transition-colors duration-200 w-full xl:w-60"
        >
          Nouveau patient
        </button>
        <hr className="w-full"></hr>
        <div className="grid lg:grid-cols-2 sm:grid-cols-1 gap-4 mb-4">
          <Patients />
        </div>
      </div>
      {modal}
    </div>
  );
}
