import { useRef, useState } from "react";
import { Model } from "../../types";
import EditIcon from "../EditIcon";

interface Props {
  m: Model;
  setLocalStorage: (value: Model[] | ((prevValue: Model[]) => Model[])) => void;
}

export default function EditModelName({ m, setLocalStorage }: Props) {
  const [editMode, setEditMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit() {
    setEditMode(false);
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: "10px",
        gap: 5,
      }}
    >
      {!editMode && (
        <EditIcon
          onClick={() => {
            setEditMode(true);
            setTimeout(() => {
              inputRef.current!.select();
            });
          }}
        />
      )}
      {editMode && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          onClick={handleSubmit}
        >
          ✔️
        </div>
      )}
      {editMode && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <input
            ref={inputRef}
            value={m.name}
            onBlur={handleSubmit}
            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
        </form>
      )}
      {!editMode && (
        <div
          style={{
            justifyContent: "center",
            display: "inline-flex",
          }}
        >
          {m.name}
        </div>
      )}
    </div>
  );
}
