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
