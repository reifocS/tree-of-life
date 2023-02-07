import type { NextPage } from "next";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { read, utils } from "xlsx";
import { ErrorBoundary } from "react-error-boundary";
import { generateTreeFromModel, guidGenerator } from "../../drawing";
import useLocalStorage from "../../hooks/useLocalStorage";
import Link from "next/link";
import { useRouter } from "next/router";
import EditModelName from "./EditModelName";
import type { Model, User } from "../../types";
import getDefaultModel from "../../utils/defaultModel";
import useReadLocalStorage from "../../hooks/useReadLocalStorage";

const excelToJSON = function (
  setState: Dispatch<any>,
  setError: Dispatch<SetStateAction<boolean>>,
  setModelName: Dispatch<SetStateAction<string>>
) {
  const parseExcel = function (file: any) {
    const reader = new FileReader();

    reader.onload = function (e) {
      const data = e.target!.result;
      const workbook = read(data, {
        type: "binary",
      });
      const jsons = workbook.SheetNames.map(function (sheetName) {
        setModelName(sheetName);
        const json_object = utils.sheet_to_json(workbook.Sheets[sheetName]);
        return json_object;
      });
      const json = jsons[0] as any[];
      setState(groupBy(json, "Branche"));
    };

    reader.onerror = function (ex) {
      setError(true);
      console.log(ex);
    };

    reader.readAsBinaryString(file);
  };
  return parseExcel;
};

export function groupBy<T>(xs: Array<T>, key: keyof T): Record<string, any> {
  return xs.reduce(function (rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {} as any);
}

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

const CreateModel: NextPage = () => {
  const [fileData, setFileData] = useState<any>();
  const [error, setError] = useState(false);
  const [modelName, setModelName] = useState("");
  const [models, setLocalStorage] = useLocalStorage<Model[]>("models", []);
  const users = useReadLocalStorage<User[]>("users");
  const router = useRouter();

  const ref = useRef<HTMLCanvasElement>(null);

  // Create a default tree when there is none
  useEffect(() => {
    if (models.length === 0) {
      const modelByDefault = getDefaultModel(ref.current!);
      setLocalStorage((prev) => [...prev, modelByDefault]);
    }
  }, [models, setLocalStorage]);

  useEffect(() => {
    if (fileData && ref.current) {
      const branches = Object.keys(fileData);
      // We make sure leafs are in correct order for generateTreeModel
      const leafs = branches.map((k) =>
        fileData[k].map((v: any) => ({
          text: v["Texte"],
          icon: v["Icône"],
          categoryTitle: k,
        }))
      );
      const treeModel = generateTreeFromModel(ref.current, branches, leafs);
      const id = guidGenerator();
      const newModel = {
        name: modelName,
        elements: treeModel,
        id,
      };
      setLocalStorage((prev) => [...prev, newModel]);
      router.push(`/edition/${id}`);
    }
  }, [fileData, setLocalStorage, modelName, router]);

  function reset() {
    setFileData(undefined);
    setError(false);
    setModelName("");
  }

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        reset();
      }}
    >
      <div className="flex flex-col flex-1 h-full">
        <div className="h-8"></div>
        <div className="px-6 sm:px-8 flex flex-col w-full items-center justify-center gap-8">
          <Link
            href="/patients"
            className="mr-auto mb-2 inline-flex items-center justify-center xl:text-xl h-14 t box-border px-8 rounded bg-transparent text-white border-current hover:border-blue-brand focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-blue-200 focus:ring-opacity-80 font-semibold border-2"
          >
            Gérer mes patients
          </Link>
          <h1 className="font-extrabold text-3xl mb-2 text-center">
            Mes arbres
          </h1>
          {error && <p>Could not read file</p>}
          <canvas ref={ref} style={{ display: "none" }} />
          <div
            className="p-4 mb-4 text-center text-sm text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400"
            role="alert"
          >
            Générer un nouvel arbre à partir d&apos;un fichier excel (⚠️ les
            en-têtes ne doivent pas être modifié, référez vous à{" "}
            <Link type="download" locale={false} className="underline" href="/template.xlsx">
              l&apos;exemple
            </Link>
            )
            <br />
            <label
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              htmlFor="file_input"
            >
              Générer depuis un fichier excel
            </label>
            <input
              onChange={(evt) => {
                const files = evt.target.files;
                if (files && files.length > 0) {
                  //Todo faire le parsing de fichier côté serveur
                  const parseExcel = excelToJSON(
                    setFileData,
                    setError,
                    setModelName
                  );
                  parseExcel(files[0]);
                }
              }}
              type="file"
              accept=".xlsx"
              className="text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
              id="file_input"
            ></input>
          </div>
          <button
            onClick={() => {
              const modelByDefault = getDefaultModel(ref.current!);
              setLocalStorage((prev) => [...prev, modelByDefault]);
            }}
            className="w-full lg:w-[300px] font-extrabold text-white bg-indigo-700 hover:bg-indigo-800 focus:ring-4 focus:ring-indigo-300 rounded-lg text-xl px-5 py-2.5 mr-2 mb-2 dark:bg-indigo-600 dark:hover:bg-indigo-700 focus:outline-none dark:focus:ring-indigo-800"
          >
            Générer l&apos;arbre de base
          </button>
          <hr className="w-full mb-2"></hr>

          <div className="grid lg:grid-cols-3 sm:grid-cols-1 gap-4 mb-4">
            {models.map((m) => (
              <div
                key={m.id}
                className="flex flex-col flex-1 gap-3 p-3 items-center justify-center bg-gray-800 rounded"
              >
                <EditModelName m={m} setLocalStorage={setLocalStorage} />
                <div className="grid grid-cols-2 gap-4">
                  <Link
                    className="inline-flex items-center justify-center h-14 box-border px-8 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent font-semibold bg-indigo-brand text-white bg-indigo-500 hover:bg-indigo-600 focus:ring-indigo-200 transition-colors duration-200 w-full"
                    href={`/edition/${m.id}`}
                  >
                    Editer
                  </Link>
                  <button
                    disabled={models.length === 1}
                    className="inline-flex disabled:opacity-70 items-center justify-center h-14 box-border px-8 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent font-semibold bg-indigo-brand text-white bg-red-500 hover:bg-red-600 focus:ring-red-200 transition-colors duration-200 w-full"
                    onClick={() => {
                      if (users?.find((u) => u.modelId === m.id)) {
                        alert(
                          "Cet arbre est lié à un utilisateur, vous ne pouvez pas le supprimer"
                        );
                      } else
                        setLocalStorage((prev) =>
                          prev?.filter((mod) => mod.id !== m.id)
                        );
                    }}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default CreateModel;
