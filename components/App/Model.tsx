import type { NextPage } from "next";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { read, utils } from "xlsx";
import { ErrorBoundary } from "react-error-boundary";
import { generateTreeFromModel, guidGenerator } from "../../drawing";
import useLocalStorage from "../../hooks/useLocalStorage";
import styles from "./Model.module.css";
import Link from "next/link";
import { useRouter } from "next/router";
import EditModelName from "./EditModelName";
import InfoIcon from "../InfoIcon";
import { generateCollaborationLink } from "../../utils/crypto";
import type { Model } from "../../types";
import getDefaultModel from "../../utils/defaultModel";

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
      <div className={styles.Background}>
        <section className={styles.Wrapper}>
          <h1 className={styles.h1}>L&apos;arbre de vie des reins</h1>
          {error && <p>Could not read file</p>}
          <canvas ref={ref} style={{ display: "none" }} />
          <div className={styles.Gen}>
            <div className={styles.DownloadBanner}>
              <div className={styles.InfoIcon}>
                <InfoIcon />
              </div>
              <p>
                Générer un nouvel arbre à partir d&apos;un fichier excel (⚠️ les
                en-têtes ne doivent pas être modifié, référez vous à{" "}
                <a download href="template.xlsx">
                  l&apos;exemple
                </a>
                )
              </p>
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
              />
              <button
                onClick={() => {
                  const modelByDefault = getDefaultModel(ref.current!);
                  setLocalStorage((prev) => [...prev, modelByDefault]);
                }}
              >
                Générer l&apos;arbre de base
              </button>
            </div>

            <div className={styles.ModelContainer}>
              <h2>Mes arbres</h2>
              <ul className={styles.ModelList}>
                {models.map((m) => (
                  <li key={m.id} className={styles.ModelItem}>
                    <EditModelName m={m} setLocalStorage={setLocalStorage} />
                    <div className={styles.ModelButtonContainer}>
                      <div className={styles.ButtonWrapper}>
                        <Link
                          className={styles.Link}
                          href={generateCollaborationLink(`/arbre/${m.id}`)}
                        >
                          Consulter
                        </Link>
                        <Link className={styles.Link} href={`/edition/${m.id}`}>
                          Editer
                        </Link>
                      </div>
                      <div className={styles.ButtonWrapper}>
                        <button
                          className={styles.ButtonDelete}
                          onClick={() => {
                            setLocalStorage((prev) =>
                              prev?.filter((mod) => mod.id !== m.id)
                            );
                          }}
                        >
                          Supprimer
                        </button>
                        <Link
                          className={styles.Link}
                          href={`/historique/${m.id}`}
                        >
                          Historique
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </ErrorBoundary>
  );
};

export default CreateModel;
