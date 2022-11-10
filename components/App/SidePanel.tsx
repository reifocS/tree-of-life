import { PopupPickerController, createPopup } from "@picmo/popup-picker";
import { Dispatch, SetStateAction, useRef, useEffect } from "react";
import { AppState, addText, updateText, guidGenerator, Element } from "../../drawing";

export default function SidePanel({
    selectedElement,
    elements,
    appState,
    ctx,
    setAppState,
  }: {
    setAppState: Dispatch<SetStateAction<AppState>>;
    selectedElement: Element;
    elements: Element[];
    appState: AppState;
    ctx: CanvasRenderingContext2D;
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
      <div className="sidePanel">
        <div className="panelColumn">
          <button
            onClick={() => {
              const el = addText(ctx);
              if (!el) return;
              setAppState((prev) => ({
                ...prev,
                elements: [...prev.elements, el],
              }));
            }}
          >
            Add text
          </button>
          <>
            {selectedElement.type !== "category" && (
              <>
                width
                <input
                  onChange={(e) => {
                    setAppState((prev) => ({
                      ...prev,
                      elements: prev.elements.map((el) => {
                        if (el.id === selectedElement.id) {
                          return {
                            ...el,
                            width: +e.target.value,
                          };
                        }
                        return el;
                      }),
                    }));
                  }}
                  type="range"
                  min={0}
                  max={360}
                  value={
                    elements.find((el) => el.id === selectedElement.id)?.width
                  }
                ></input>
                {selectedElement.type === "leaf" && (
                  <>
                    height
                    <input
                      onChange={(e) => {
                        setAppState((prev) => ({
                          ...prev,
                          elements: prev.elements.map((el) => {
                            if (el.id === selectedElement.id) {
                              return {
                                ...el,
                                height: +e.target.value,
                              };
                            }
                            return el;
                          }),
                        }));
                      }}
                      type="range"
                      min={50}
                      max={300}
                      value={
                        elements.find((el) => el.id === selectedElement.id)
                          ?.height!
                      }
                    ></input>
                  </>
                )}
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
                emoji fontSize
                <input
                  type="number"
                  value={
                    elements.find((el) => el.id === selectedElement.id)?.iconSize
                  }
                  onChange={(e) => {
                    setAppState((prev) => ({
                      ...prev,
                      elements: prev.elements.map((el) => {
                        if (el.id === selectedElement.id) {
                          return { ...el, iconSize: +e.target.value };
                        }
                        return el;
                      }),
                    }));
                  }}
                ></input>
              </>
            )}
            text
            <textarea
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
            {selectedElement.type === "category" && (
              <>
                font
                <input
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
                color
                <input
                  value={
                    elements.find((el) => el.id === selectedElement.id)?.color!
                  }
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
              style={{ backgroundColor: "red" }}
              onClick={() => {
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
              style={{ backgroundColor: "gray" }}
              onClick={() => {
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
          </>
        </div>
      </div>
    );
  }