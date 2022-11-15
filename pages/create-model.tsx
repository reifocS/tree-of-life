import type { NextPage } from "next";
import Image from "next/image";
import { Dispatch, SetStateAction, useMemo, useRef, useState } from "react";
import { read, utils } from "xlsx";
import CanvasComponentWrapper from "../components/App";
import { ErrorBoundary } from "react-error-boundary";
import { generateTreeFromModel } from "../drawing";

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

const CreateModel: NextPage = () => {
  const [model, setModel] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [showModel, setShow] = useState(false);
  const [modelName, setModelName] = useState("");

  const ref = useRef<HTMLCanvasElement>(null);
  let treeFromModel = useMemo(() => {
    if (model && ref.current) {
      const branches = Object.keys(model);
      const leafs = branches.map((k) =>
        model[k].map((v: any) => ({ text: v["Texte"], icon: v["Icône"] }))
      );
      return generateTreeFromModel(ref.current, branches, leafs);
    }
    return null;
  }, [model]);

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        setModel(undefined);
        setError(false);
        setLoading(false);
        setShow(false);
        setModelName("");
      }}
    >
      <div className="wrapper">
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
              onClick={() => setShow((prev) => !prev)}
            >
              {showModel ? "hide model" : "show model"}
            </button>
          </>
        )}
        {!treeFromModel && (
          <>
            <p>
              Générer à partir d&apos;un fichier (⚠️ les en tête ne doivent pas
              être modifié !) 
            </p>
            <p>télécharger un{" "}
              <a download href="template.xlsx">
                exemple
              </a></p>
            <input
              onChange={(evt) => {
                const files = evt.target.files;
                if (files && files.length > 0) {
                  //Todo faire le parsing de fichier côté serveur
                  const parseExcel = excelToJSON(
                    setModel,
                    setLoading,
                    setError,
                    setModelName
                  );
                  parseExcel(files[0]);
                  setShow(true);
                }
              }}
              type="file"
              accept=".xlsx"
            />
            <p>Générer à partir de l&apos;interface (todo)</p>
          </>
        )}
        {model && !loading && showModel && (
          <>
            <CanvasComponentWrapper
              treeFromModel={treeFromModel}
              nbOfBranches={Object.keys(model).length}
              modelName={modelName}
            />
          </>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default CreateModel;
