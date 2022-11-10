import type { NextPage } from "next";
import { Dispatch, useRef, useState } from "react";
import { read, utils } from "xlsx";
import CanvasComponentWrapper from "../components/App";
import { generateTreeFromModel } from "../drawing";
const excelToJSON = function (setState: Dispatch<any>) {
  const parseExcel = function (file: any) {
    const reader = new FileReader();

    reader.onload = function (e) {
      const data = e.target!.result;
      const workbook = read(data, {
        type: "binary",
      });
      const jsons = workbook.SheetNames.map(function (sheetName) {
        // Here is your object
        const json_object = utils.sheet_to_json(workbook.Sheets[sheetName]);
        return json_object;
      });
      const json = jsons[0] as any[];
      setState(groupBy(json, "Branche"));
    };

    reader.onerror = function (ex) {
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

const CreateModel: NextPage = () => {
  const [model, setModel] = useState<any>();
  const [showModel, setShow] = useState(false);

  const ref = useRef<HTMLCanvasElement>(null);
  let treeFromModel = null;
  if (model && ref.current) {
    const branches = Object.keys(model);
    const leafs = branches.map((k) =>
      model[k].map((v: any) => ({ text: v["Texte"], icon: v["Icône"] }))
    );
    treeFromModel = generateTreeFromModel(ref.current, branches, leafs);
  }
  return (
    <>
      <canvas ref={ref} style={{ display: "none" }} />
      {model && (
        <>
          <button
            style={{ position: "absolute", top: 30, left: 30 }}
            onClick={() => setShow((prev) => !prev)}
          >
            {showModel ? "hide model" : "show model"}
          </button>
        </>
      )}
      {!model && (
        <>
          <p>
            Generate from file{" "}
            <a download href="template.xlsx">
              example
            </a>
          </p>

          <input
            onChange={(evt) => {
              const files = evt.target.files; // FileList object
              if (files && files.length > 0) {
                const parseExcel = excelToJSON(setModel);
                parseExcel(files[0]);
                setShow(true);
              }
            }}
            type="file"
          />
        </>
      )}
      {model && showModel && (
        <>
          <CanvasComponentWrapper
            treeFromModel={treeFromModel}
            nbOfBranches={Object.keys(model).length}
          />
        </>
      )}
    </>
  );
};

export default CreateModel;
