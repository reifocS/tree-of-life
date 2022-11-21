import type { NextPage } from "next";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { read, utils } from "xlsx";
import CanvasComponentWrapper from "../App";
import { ErrorBoundary } from "react-error-boundary";
import { Element, generateTreeFromModel, guidGenerator } from "../../drawing";
import useLocalStorage from "../../hooks/useLocalStorage";
import CanvasPreview from "../App/Preview";
import styles from "./Model.module.css";

const LOADING_TIME = 2000;
const excelToJSON = function (
  setState: Dispatch<any>,
  setLoading: Dispatch<SetStateAction<boolean>>,
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
      setLoading(true);
      const jsons = workbook.SheetNames.map(function (sheetName) {
        setModelName(sheetName);
        const json_object = utils.sheet_to_json(workbook.Sheets[sheetName]);
        return json_object;
      });
      const json = jsons[0] as any[];
      setState(groupBy(json, "Branche"));
      //Simulate loading time
      setTimeout(() => setLoading(false), LOADING_TIME);
    };

    reader.onerror = function (ex) {
      setLoading(false);
      setError(true);
      console.log(ex);
    };

    reader.readAsBinaryString(file);
  };
  return parseExcel;
};

function groupBy<T>(xs: Array<T>, key: keyof T) {
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

export type Model = {
  name: string;
  elements: Element[];
  id: string;
  nbOfBranches: number;
};

const CreateModel: NextPage = () => {
  const [fileData, setFileData] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [modelName, setModelName] = useState("");
  const [models, setLocalStorage] = useLocalStorage<Model[]>("models", []);
  const [model, setModel] = useState<Model | null>(null);
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (fileData && ref.current) {
      const branches = Object.keys(fileData);
      const leafs = branches.map((k) =>
        fileData[k].map((v: any) => ({ text: v["Texte"], icon: v["Icône"] }))
      );
      const treeModel = generateTreeFromModel(ref.current, branches, leafs);
      const id = guidGenerator();
      const newModel = {
        name: modelName,
        elements: treeModel,
        id,
        nbOfBranches: branches.length,
      };
      setLocalStorage((prev) => [...prev, newModel]);
      setModel(newModel);
    }
  }, [fileData, setLocalStorage, modelName]);

  function reset() {
    setFileData(undefined);
    setError(false);
    setLoading(false);
    setModelName("");
    setModel(null);
  }
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        reset();
      }}
    >
      <div
        className="wrapper"
        style={
          model
            ? {}
            : {
                overscrollBehavior: "auto",
                height: "100vh",
                overflow: "scroll",
              }
        }
      >
        {error && <p>Could not read file</p>}
        <>
          <div
            className="loadingModel"
            style={{
              display: loading ? "block" : "none",
            }}
          >
            <div className="loadingGif">
              <Image
                priority
                src="/growingplant.gif"
                width={300}
                height={300}
                alt="growing plant"
              ></Image>
              <p>Génération de l&apos;arbre...</p>
            </div>
          </div>
        </>

        <canvas ref={ref} style={{ display: "none" }} />
        {model && !loading && (
          <>
            <button
              style={{ position: "absolute", top: 30, left: 30 }}
              onClick={() => reset()}
            >
              back
            </button>
          </>
        )}
        {!model && (
          <>
            <div className={styles.Gen}>
              <div>
                <p>
                  Générer à partir d&apos;un fichier (⚠️ les en tête ne doivent
                  pas être modifié !)
                </p>
                <p>
                  télécharger un{" "}
                  <a download href="template.xlsx">
                    exemple
                  </a>
                </p>
                <input
                  onChange={(evt) => {
                    const files = evt.target.files;
                    if (files && files.length > 0) {
                      //Todo faire le parsing de fichier côté serveur
                      const parseExcel = excelToJSON(
                        setFileData,
                        setLoading,
                        setError,
                        setModelName
                      );
                      parseExcel(files[0]);
                    }
                  }}
                  type="file"
                  accept=".xlsx"
                />
              </div>
              <div>
                <p>Modèles</p>
                <ul className="modelList">
                  {models.map((m) => (
                    <li key={m.id}>
                      <input
                        value={m.name}
                        onChange={(e) => {
                          setLocalStorage((prev) =>
                            prev?.map((mod) => {
                              if (mod.id === m.id) {
                                return {
                                  ...mod,
                                  name: e.target.value,
                                };
                              }
                              return mod;
                            })
                          );
                        }}
                      ></input>
                      <button
                        onClick={() => {
                          setModel(m);
                        }}
                      >
                        view
                      </button>
                      <button
                        onClick={() => {
                          setLocalStorage((prev) =>
                            prev?.filter((mod) => mod.id !== m.id)
                          );
                        }}
                      >
                        delete
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <h2 className={styles.Viz}>Visualisation</h2>
            <div
              style={{
                display: "flex",
                gap: 10,
                padding: 30,
                justifyContent: "center",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              {models.map((m) => (
                <div key={m.id}>
                  <p>{m.name}</p>
                  <CanvasPreview treeFromModel={m} />
                </div>
              ))}
            </div>
          </>
        )}
        {model && !loading && (
          <>
            <CanvasComponentWrapper treeFromModel={model} />
          </>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default CreateModel;
