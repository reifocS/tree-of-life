import { PopupPickerController, createPopup } from "@picmo/popup-picker";
import { Dispatch, SetStateAction, useRef, useEffect } from "react";
import {
  AppState,
  updateText,
  guidGenerator,
  Element,
  FONT_TEXT_LEAF,
} from "../../drawing";

export default function SidePanel({
  selectedElement,
  elements,
  ctx,
  setAppState,
  appState,
  startRecording,
  stopRecording,
}: {
  setAppState: Dispatch<SetStateAction<AppState>>;
  selectedElement: Element;
  elements: Element[];
  ctx: CanvasRenderingContext2D;
  appState: AppState;
  stopRecording: () => boolean;
  startRecording: () => boolean;
}) {
  const emojiRef = useRef<HTMLButtonElement>(null);
  const emojiPickerRef = useRef<PopupPickerController | null>(null);
  useEffect(() => {
    const container = emojiRef.current!;
    if (!container || !selectedElement) return;
    const picker = createPopup(
      {},
      {
        referenceElement: container,
        triggerElement: container,
      }
    );
    emojiPickerRef.current = picker;

    function onSelect(event: any) {
      setAppState((prev) => ({
        ...prev,
        elements: prev.elements.map((el) =>
          el.id === selectedElement?.id ? { ...el, icon: event.emoji } : el
        ),
      }));
    }
    picker.addEventListener("emoji:select", onSelect);

    () => {
      picker.toggle();
      picker.removeEventListener("emoji:select", onSelect);
      picker.destroy();
    };
  }, [selectedElement, setAppState]);

  return (
    <div className="sidePanel bg-slate-800">
      <div className="panelColumn">
        <>
          {selectedElement.type !== "category" && (
            <>
              size
              <input
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                onChange={(e) => {
                  setAppState((prev) => ({
                    ...prev,
                    elements: prev.elements.map((el) => {
                      if (el.id === selectedElement.id) {
                        return {
                          ...el,
                          width: +e.target.value,
                          height: +e.target.value,
                        };
                      }
                      return el;
                    }),
                  }));
                }}
                type="range"
                min={50}
                max={350}
                value={
                  elements.find((el) => el.id === selectedElement.id)?.width
                }
              ></input>
              emoji
              <button
                className={`emojiSelector ${
                  elements.find((el) => el.id === selectedElement.id)?.icon !==
                    "" && "withEmoji"
                }`}
                onClick={() => emojiPickerRef.current?.toggle()}
                ref={emojiRef}
              >
                {elements.find((el) => el.id === selectedElement.id)?.icon}
              </button>
            </>
          )}
          texte de la feuille
          <textarea
            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            key={selectedElement.id}
            onChange={(e) => {
              setAppState((prev) => ({
                ...prev,
                elements: prev.elements.map((el) => {
                  if (el.id === selectedElement.id) {
                    if (el.type !== "category")
                      return {
                        ...el,
                        text: e.target.value,
                      };
                    return {
                      ...updateText(ctx!, e.target.value ?? "", el),
                    };
                  }
                  return el;
                }),
              }));
            }}
            value={elements.find((el) => el.id === selectedElement.id)?.text!}
          ></textarea>
          {selectedElement.type === "leaf" && (
            <>
              <label
                htmlFor="fontSize"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Taille du texte
              </label>
              <select
                value={
                  elements.find((el) => el.id === selectedElement.id)?.font ??
                  24
                }
                id="fontSize"
                name="fontSize"
                onChange={(e) => {
                  setAppState((prev) => ({
                    ...prev,
                    elements: prev.elements.map((el) => {
                      if (el.id === selectedElement.id) {
                        return { ...el, font: e.target.value };
                      }
                      return el;
                    }),
                  }));
                }}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                <option value={18}>Petit</option>
                <option value={24}>Moyen</option>
                <option value={34}>Grand</option>
              </select>
            </>
          )}
          {selectedElement.type === "category" && (
            <>
              police
              <input
                className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                value={
                  elements.find((el) => el.id === selectedElement.id)?.font!
                }
                onChange={(e) => {
                  setAppState((prev) => ({
                    ...prev,
                    elements: prev.elements.map((el) => {
                      if (el.id === selectedElement.id) {
                        return updateText(ctx!, el.text, el, e.target.value);
                      }
                      return el;
                    }),
                  }));
                }}
              ></input>
              couleur
              <input
                className="w-full"
                value={
                  elements.find((el) => el.id === selectedElement.id)?.color!
                }
                type="color"
                onChange={(e) => {
                  setAppState((prev) => ({
                    ...prev,
                    elements: prev.elements.map((el) => {
                      if (el.id === selectedElement.id) {
                        return { ...el, color: e.target.value };
                      }
                      return el;
                    }),
                  }));
                }}
              ></input>
            </>
          )}
          angle
          <input
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            onChange={(e) => {
              setAppState((prev) => ({
                ...prev,
                elements: prev.elements.map((el) => {
                  if (el.id === selectedElement.id) {
                    return {
                      ...el,
                      angle: +e.target.value,
                    };
                  }
                  return el;
                }),
              }));
            }}
            type="range"
            min={0}
            max={2 * Math.PI}
            step={0.0001}
            value={
              elements.find((el) => el.id === selectedElement.id)?.angle ?? 0
            }
          ></input>
          <button
            className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
            onClick={() => {
              startRecording();
              setAppState((prev) => ({
                ...prev,
                elements: prev.elements.filter(
                  (e) => e.id !== selectedElement.id
                ),
                selectedElement: null,
                draggedElement: null,
              }));
            }}
          >
            delete
          </button>
          <button
            className="text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
            onClick={() => {
              startRecording();
              setAppState((prev) => ({
                ...prev,
                elements: [
                  ...prev.elements,
                  {
                    ...elements.find((el) => el.id === selectedElement.id)!,
                    id: guidGenerator(),
                    x: selectedElement.x + 20,
                    y: selectedElement.y + 20,
                  },
                ],
                selectedElement: null,
                draggedElement: null,
              }));
            }}
          >
            copy
          </button>
          <button
            className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-700 dark:border-blue-700"
            onClick={() => {
              setAppState((prev) => ({
                ...prev,
                selectedElement: null,
                draggedElement: null,
              }));
            }}
          >
            Valider
          </button>
        </>
      </div>
    </div>
  );
}
