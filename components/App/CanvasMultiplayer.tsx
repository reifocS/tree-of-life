import { PointerEvent, useCallback, useEffect, useRef, useState } from "react";
import rough from "roughjs/bin/rough";
import { RoughCanvas } from "roughjs/bin/canvas";
import { useCanvas } from "../../hooks/useCanvas";
import {
  AppState,
  colors,
  mousePosToCanvasPos,
  hitTest,
  getMousePos,
  MAX_ZOOM,
  MIN_ZOOM,
  SCROLL_SENSITIVITY,
  SCROLL_SENSITIVITY_TOUCHPAD,
  Element,
  white,
} from "../../drawing";
import useDisableScrollBounce from "../../hooks/useDisableScrollBounce";
import useDisablePinchZoom from "../../hooks/useDisablePinchZoom";
import { normalizeWheelEvent } from "../../utils/normalizeWheelEvent";
import useDeviceSize from "../../hooks/useDeviceSize";
import {
  useOthers,
  useUpdateMyPresence,
  useStorage,
  useMutation,
} from "../../liveblocks.config";
import { useLeafImages } from "../../hooks/useLeafImages";
import CopyIcon from "../CopyIcon";
import Editor from "../Editor/Editor";
import { useRouter } from "next/router";
import useLocalStorage from "../../hooks/useLocalStorage";

export type Seance = {
  [roomId: string]: {
    date: string;
    treeId: string;
    actions: { leafId: string; leafTitle: string; color: string }[];
  };
};

export default function Canvas({ isOwner }: { isOwner: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [width, height /*devicePixelRatio*/] = useDeviceSize();
  const [roughCanvas, setRoughCanvas] = useState<RoughCanvas | null>(null);
  // Hack used to make sure we wait for image to load, needed for firefox
  const [dummyUpdate, forceUpdate] = useState({});
  const elements = useStorage((root) => root.elements) as Element[];
  const router = useRouter();
  const [seances, setSeances] = useLocalStorage<Seance>("tof-seance", {});
  const { room, id } = router.query;

  // Synchronize with elements
  useEffect(() => {
    const actions = elements
      .filter((el) => el.color !== white && el.type === "leaf")
      .map((el) => {
        return {
          leafId: el.id,
          leafTitle: el.text,
          color: el.color,
        };
      });

    setSeances((prev) => ({
      ...prev,
      [room as string]: {
        date: new Date().toISOString(),
        actions,
        treeId: id as string,
      },
    }));
  }, [elements, room, setSeances, id]);

  //const centerPointerZoom = useRef({ x: width / 2, y: height / 2 });
  useDisableScrollBounce();
  useDisablePinchZoom();
  const [appState, setAppState] = useState<
    Omit<AppState, "mode" | "selectedElement" | "elements" | "draggedElement">
  >(() => {
    return {
      sectors: [],
      cameraZoom: 1,
      scaleMultiplier: 0.8,
      cameraOffset: { x: 0, y: 0 },
      isDragging: false,
      dragStart: { x: 0, y: 0 },
      initialPinchDistance: null,
      draggedElement: null,
      downPoint: { x: 0, y: 0 },
    };
  });

  const others = useOthers();
  const updateMyPresence = useUpdateMyPresence();

  const images = useLeafImages(forceUpdate);

  function handleTouch(e: any, singleTouchHandler: any) {
    if (e.touches.length <= 1) {
      singleTouchHandler(e);
    } else if (e.type == "touchmove" && e.touches.length == 2) {
      setAppState((prev) => ({
        ...prev,
        isDragging: false,
      }));
      handlePinch(e);
    }
  }

  const { cameraZoom, cameraOffset, isDragging, sectors } = appState;
  const { x: cameraOffsetX, y: cameraOffsetY } = cameraOffset;
  const lastZoom = useRef(cameraZoom);
  const ref = useCallback((node: HTMLCanvasElement) => {
    if (node !== null) {
      setRoughCanvas(rough.canvas(node));
      canvasRef.current = node;
    }
  }, []);

  const nbOfBranches = elements.filter((el) => el.type === "category").length;

  useCanvas(
    "view",
    roughCanvas,
    canvasRef,
    width,
    height,
    cameraZoom,
    cameraOffsetX,
    cameraOffsetY,
    elements,
    images,
    null,
    nbOfBranches,
    sectors,
    dummyUpdate
  );
  const handlePointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = mousePosToCanvasPos(ctx, e);

    const el = elements.find((el) => hitTest(x, y, el));

    setAppState((prev) => ({
      ...prev,
      isDragging: true,
      selectedElement: null,
      dragStart: {
        x:
          getMousePos(canvasRef.current!, e)!.x / prev.cameraZoom -
          prev.cameraOffset.x,
        y:
          getMousePos(canvasRef.current!, e)!.y / prev.cameraZoom -
          prev.cameraOffset.y,
      },
    }));
    if (!el) document.documentElement.style.cursor = "grabbing";
  };

  const handlePointerUp = (e: PointerEvent<HTMLCanvasElement>) => {
    const { x, y } = mousePosToCanvasPos(
      canvasRef.current?.getContext("2d")!,
      e
    );
    const el = elements.find((el) => hitTest(x, y, el));
    resetMouseState();
    lastZoom.current = cameraZoom;
    if (!el) document.documentElement.style.cursor = "default";
  };

  function handlePinch(e: any) {
    let touch1 = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    let touch2 = { x: e.touches[1].clientX, y: e.touches[1].clientY };

    // This is distance squared, but no need for an expensive sqrt as it's only used in ratio
    let currentDistance =
      (touch1.x - touch2.x) ** 2 + (touch1.y - touch2.y) ** 2;

    if (appState.initialPinchDistance == null) {
      setAppState((prev) => ({
        ...prev,
        initialPinchDistance: currentDistance,
      }));
    } else {
      adjustZoom(null, currentDistance / appState.initialPinchDistance);
    }
  }
  const handlePointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = mousePosToCanvasPos(ctx, e);

    updateMyPresence({
      cursor: {
        x,
        y,
      },
    });
    const target = e.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    if (!isDragging) {
      document.documentElement.style.cursor = "";
    }
    if (isDragging) {
      setAppState((prev) => ({
        ...prev,
        cameraOffset: {
          x:
            getMousePos(canvasRef.current!, e)!.x / prev.cameraZoom -
            prev.dragStart.x,
          y:
            getMousePos(canvasRef.current!, e)!.y / prev.cameraZoom -
            prev.dragStart.y,
        },
      }));
    }
  };

  function adjustZoom(zoomAmount: number | null, zoomFactor: number | null) {
    if (!isDragging) {
      let cameraZoom = appState.cameraZoom;
      if (zoomAmount) {
        cameraZoom += zoomAmount;
      } else if (zoomFactor) {
        cameraZoom = zoomFactor * lastZoom.current;
      }

      cameraZoom = Math.min(cameraZoom, MAX_ZOOM);
      cameraZoom = Math.max(cameraZoom, MIN_ZOOM);
      setAppState((prev) => ({ ...prev, cameraZoom }));
    }
  }
  const updateElements = useMutation(({ storage }, newList: Element[]) => {
    const mutableList = storage.get("elements");
    for (let i = 0; i < newList.length; ++i) {
      mutableList.set(i, newList[i]);
    }
  }, []);
  function resetMouseState() {
    setAppState((prev) => ({
      ...prev,
      isDragging: false,
      initialPinchDistance: null,
      draggedElement: null,
    }));
  }
  const canvas = canvasRef.current;
  return (
    <>
      <div className="container">
        {/*<Legend />*/}
        {others?.map(({ presence, connectionId }) => {
          if (presence.cursor === null) {
            return;
          }
          if (!canvas) {
            return;
          }
          const context = canvas.getContext("2d")!;
          const transform = context.getTransform();
          // Destructure to get the x and y values out of the transformed DOMPoint.
          const { x, y } = transform.transformPoint(
            new DOMPoint(presence.cursor.x, presence.cursor.y)
          );
          return (
            <svg
              key={connectionId}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                transition: "transform 120ms linear",
                transform: `translateX(${x}px) translateY(${y}px)`,
              }}
              width="34"
              height="46"
              viewBox="0 0 24 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
                fill={"#B90070"}
              />
            </svg>
          );
        })}

        <canvas
          onMouseOut={() => {
            resetMouseState();
            document.documentElement.style.cursor = "default";
          }}
          onMouseLeave={() => {
            updateMyPresence({ cursor: null });
          }}
          onContextMenu={(e) => {
            /*
            e.preventDefault();
            const ctx = canvasRef.current!.getContext("2d")!;
            const { x, y } = mousePosToCanvasPos(ctx, e);
            for (const element of elements) {
              if (hitTest(x, y, element)) {
                setAppState((prev) => ({
                  ...prev,
                  elements: prev.elements.map((el) => {
                    if (el.id === element.id) {
                      return {
                        ...el,
                        weTalkedAboutIt: !el.weTalkedAboutIt,
                      };
                    }
                    return el;
                  }),
                }));
              }
            }
            */
          }}
          onTouchMove={(e) => handleTouch(e, handlePointerMove)}
          onTouchStart={(e) => handleTouch(e, handlePointerDown)}
          onTouchEnd={(e) => handleTouch(e, handlePointerUp)}
          onTouchCancel={(e) => handleTouch(e, handlePointerUp)}
          onClick={(e) => {
            const ctx = canvasRef.current!.getContext("2d")!;
            const { x, y } = mousePosToCanvasPos(ctx, e);

            for (const element of elements) {
              if (hitTest(x, y, element)) {
                const newElems = elements.map((e) => {
                  if (e.id === element.id) {
                    let nextIndex =
                      (colors.findIndex((color) => color === e.color) + 1) %
                      colors.length;
                    return {
                      ...e,
                      color: colors[nextIndex],
                      fontColor:
                        nextIndex === colors.length - 1 ? "#fff" : "black",
                    };
                  }
                  return e;
                });
                updateElements(newElems);
              }
            }
          }}
          onMouseDown={handlePointerDown}
          onMouseUp={handlePointerUp}
          onMouseMove={handlePointerMove}
          onWheel={(e) => {
            const { deltaX: _deltaX, deltaY } = normalizeWheelEvent(e);
            // Hacky way to detect touchpad zoom
            const scrollSensitivity = e.ctrlKey
              ? SCROLL_SENSITIVITY_TOUCHPAD
              : SCROLL_SENSITIVITY;
            adjustZoom(deltaY * scrollSensitivity * -1, null);
          }}
          ref={ref}
          width={width}
          height={height}
        />
      </div>
      <div
        style={{
          position: "absolute",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 5,
          bottom: 10,
          boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.01)",
          backgroundColor: "#fff",
          borderRadius: 6,
          padding: "10px",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: "1.4rem",
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        <button
          onClick={() => adjustZoom(-0.25, null)}
          style={{ pointerEvents: "all" }}
        >
          -
        </button>
        <div style={{ whiteSpace: "nowrap" }}>
          {Math.floor(cameraZoom * 100)}% 🔍
        </div>
        <button
          onClick={() => adjustZoom(0.25, null)}
          style={{ pointerEvents: "all" }}
        >
          +
        </button>
        {Math.round(cameraOffset.x) !== 0 &&
          Math.round(cameraOffset.y) !== 0 && (
            <button
              onClick={() => {
                setAppState((prev) => ({
                  ...prev,
                  cameraOffset: {
                    x: 0,
                    y: 0,
                  },
                }));
              }}
              style={{ pointerEvents: "all" }}
            >
              Centrer l&apos;écran
            </button>
          )}
      </div>
      <CopyIcon />
      {isOwner && <Editor />}
    </>
  );
}
