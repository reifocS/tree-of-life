import type { NextPage } from "next";
import { Dispatch, useState } from "react";
import { read, utils } from "xlsx";
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
        console.log(json_object);
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
  return (
    <>
      <h1>
        <input
          onChange={(evt) => {
            const files = evt.target.files; // FileList object
            if (files && files.length > 0) {
              const parseExcel = excelToJSON(setModel);
              parseExcel(files[0]);
            }
          }}
          type="file"
        />
      </h1>
      <h2>Branches</h2>
      <p>{Object.keys(model).join(", ")}</p>
      <pre>{JSON.stringify(model, null, 2)}</pre>
    </>
  );
};

export default CreateModel;
