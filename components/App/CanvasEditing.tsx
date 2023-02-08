import {
  PointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import rough from "roughjs/bin/rough";
import { RoughCanvas } from "roughjs/bin/canvas";
import {
  AppState,
  BASE_TREE_Y,
  colors,
  getBranchEndpoint,
  mousePosToCanvasPos,
  hitTest,
  hitTestButton,
  getMousePos,
  MAX_ZOOM,
  MIN_ZOOM,
  getRandomArbitrary,
  guidGenerator,
  SCROLL_SENSITIVITY,
  LEAF_WIDTH,
  LEAF_HEIGHT,
  SCROLL_SENSITIVITY_TOUCHPAD,
  updateTreeFromModel,
  getClosestPoint,
  deleteButtonOffsetX,
  deleteButtonOffsetY,
  DELETE_BUTTON_SIZE,
  DELETE_BUTTON_HEIGHT,
  Element,
} from "../../drawing";
import SidePanel from "./SidePanel";
import useDisableScrollBounce from "../../hooks/useDisableScrollBounce";
import useLocalStorage from "../../hooks/useLocalStorage";
import useDisablePinchZoom from "../../hooks/useDisablePinchZoom";
import { normalizeWheelEvent } from "../../utils/normalizeWheelEvent";
import useDeviceSize from "../../hooks/useDeviceSize";
import { useLeafImages } from "../../hooks/useLeafImages";
import { useCanvas } from "../../hooks/useCanvas";
import { useRouter } from "next/router";
import { Model } from "../../types";
import useHistory from "../../hooks/useHistory";

//TODO
//Undo Redo
//Recalculer coordonnées feuilles lors de la suppression d'une branche
//Changer la taille de font des feuille
//Ajuster la position de l'émoji
//Modifier la position du texte sur la feuille
//Changer la taille de la feuille automatiquement selon le texte
//Zoomer sur le pointer et non le centre
//Augmenter la taille de la branche si le nombre de feuille est trop grand
//Refacto le dummyUpdate, mettre à la place un async await
export default function Canvas({ treeFromModel }: { treeFromModel: Model }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [width, height /*devicePixelRatio*/] = useDeviceSize();
  const [roughCanvas, setRoughCanvas] = useState<RoughCanvas | null>(null);
  // Once that all images have been pre-loaded, re-render and draw them to the Canvas.
  const [dummyUpdate, forceUpdate] = useState({});
  //const centerPointerZoom = useRef({ x: width / 2, y: height / 2 });
  const [, setModels] = useLocalStorage<Model[]>("models", []);
  useDisableScrollBounce();

  const router = useRouter();
  const [appState, setAppState] = useState<AppState>(() => {
    return {
      selectedElement: null,
      cameraZoom: 1,
      scaleMultiplier: 0.8,
      cameraOffset: { x: 0, y: 0 },
      isDragging: false,
      dragStart: { x: 0, y: 0 },
      initialPinchDistance: null,
      draggedElement: null,
      elements: treeFromModel.elements,
      downPoint: { x: 0, y: 0 },
    };
  });
  useDisablePinchZoom();

  const images = useLeafImages(forceUpdate);

  const { cameraZoom, elements, cameraOffset, isDragging, selectedElement } =
    appState;
  const { x: cameraOffsetX, y: cameraOffsetY } = cameraOffset;
  const lastZoom = useRef(cameraZoom);
  const {
    synchronize,
    redoOnce,
    undoOnce,
    historyState,
    skipRecording,
    startRecording,
    stopRecording,
  } = useHistory<Element[]>(elements);

  const onUndo = useCallback(() => {
    const elToRestore = undoOnce();
    if (!elToRestore) return;
    skipRecording.current = true;
    setAppState((prev) => ({
      ...prev,
      elements: elToRestore,
      selectedElement: null,
    }));
  }, [skipRecording, undoOnce]);

  const onRedo = useCallback(() => {
    const elToRestore = redoOnce();
    if (!elToRestore) return;
    skipRecording.current = true;
    setAppState((prev) => ({
      ...prev,
      elements: elToRestore,
      selectedElement: null,
    }));
  }, [redoOnce, skipRecording]);

  //Listen for ctrl-z ctrl-y
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.ctrlKey &&
        event.code === "KeyW" &&
        historyState.history.length > 1
      ) {
        onUndo();
      } else if (
        event.ctrlKey &&
        event.code === "KeyY" &&
        historyState.redoStack.length > 0
      ) {
        onRedo();
      }
    }

    document.addEventListener("keydown", handleKeyDown, false);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    historyState.history.length,
    historyState.redoStack.length,
    onRedo,
    onUndo,
  ]);

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

  const ref = useCallback((node: HTMLCanvasElement) => {
    if (node !== null) {
      setRoughCanvas(rough.canvas(node));
      canvasRef.current = node;
    }
  }, []);

  const nbOfBranches = elements.filter((el) => el.type === "category").length;

  const buttonEndpoints = useMemo(
    () => getBranchEndpoint(BASE_TREE_Y, nbOfBranches),
    [nbOfBranches]
  );

  const deleteButtonPositions = buttonEndpoints.map(({ endX, endY }, i) => ({
    endX: endX + deleteButtonOffsetX(i),
    endY: endY + deleteButtonOffsetY,
  }));

  useCanvas(
    "edit",
    roughCanvas,
    canvasRef,
    width,
    height,
    cameraZoom,
    cameraOffsetX,
    cameraOffsetY,
    elements,
    images,
    selectedElement,
    nbOfBranches,
    dummyUpdate
  );

  /**
   * When we are recording, we persist each update to history
   */
  useEffect(() => {
    if (!skipRecording.current) {
      synchronize(elements);
      skipRecording.current = true;
    }
  }, [skipRecording, elements, synchronize]);

  const handlePointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = mousePosToCanvasPos(ctx, e);

    const el = elements.find((el) => hitTest(x, y, el));
    if (el) {
      setAppState((prev) => ({
        ...prev,
        draggedElement: el,
        downPoint: { x, y },
        selectedElement: el,
      }));
      return;
    } else {
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
    }
  };

  const handlePointerUp = (e: PointerEvent<HTMLCanvasElement>) => {
    const { x, y } = mousePosToCanvasPos(
      canvasRef.current?.getContext("2d")!,
      e
    );
    const el = elements.find((el) => hitTest(x, y, el));

    startRecording();
    if (appState.draggedElement) {
      //trigger a sync with history
      setAppState((prev) => ({
        ...prev,
        elements: [...prev.elements],
      }));
    }
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

    const target = e.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    if (appState.draggedElement) {
      let { x: startX, y: startY } = appState.draggedElement;
      let dragTarget = {
        ...appState.draggedElement,
        x: startX + (x - appState.downPoint!.x),
        y: startY + (y - appState.downPoint!.y),
      };
      const newElems = appState.elements.map((e) => {
        if (e.id === dragTarget.id) {
          return dragTarget;
        }
        return e;
      });
      setAppState((prev) => ({ ...prev, elements: newElems }));
      document.documentElement.style.cursor = "move";
      return;
    }
    if (
      hitTestButton(x, y, buttonEndpoints) ||
      hitTestButton(
        x,
        y,
        deleteButtonPositions,
        DELETE_BUTTON_SIZE,
        DELETE_BUTTON_HEIGHT
      ) ||
      elements.find((el) => hitTest(x, y, el))
    ) {
      document.documentElement.style.cursor = "pointer";
    } else if (!isDragging) {
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

  function removeBranchFromTree(branchId?: string) {
    if (!branchId) return;
    startRecording();
    const branches: { text: string; id: string }[] = elements.filter(
      (el) => el.type === "category" && el.id !== branchId
    );

    const leafs = branches.map((b) =>
      elements.filter((el) => el.categoryId === b.id)
    );

    const newElements = updateTreeFromModel(
      canvasRef.current!,
      branches,
      leafs
    );

    setAppState((prev) => ({
      ...prev,
      elements: newElements,
    }));
  }

  function onBranchDelete({ x, y }: { x: number; y: number }) {
    if (
      !window.confirm(
        "Attention, cela va redisposer toutes les positions des feuilles automatiquement, êtes vous sûre ?"
      )
    )
      return;
    const categories = elements.filter((el) => el.type === "category");
    //TODO this wont work on all cases, find a generic and safe way to check which
    //branch or button is deleted
    const closestCategory = getClosestPoint(categories, { x, y });
    removeBranchFromTree(closestCategory?.id);
  }

  function addBranchToTree() {
    const branches: { text: string; id: string }[] = elements.filter(
      (el) => el.type === "category"
    );

    branches.push({
      id: guidGenerator(),
      text: `Nouvelle branche ${branches.length}`,
    });

    const leafs = branches.map((b) =>
      elements.filter((el) => el.categoryId === b.id)
    );

    leafs.push([]);

    const newElements = updateTreeFromModel(
      canvasRef.current!,
      branches,
      leafs
    );

    setAppState((prev) => ({
      ...prev,
      elements: newElements,
    }));
  }

  function resetMouseState() {
    setAppState((prev) => ({
      ...prev,
      isDragging: false,
      initialPinchDistance: null,
      draggedElement: null,
    }));
  }
  const ctx = canvasRef.current?.getContext("2d")!;

  return (
    <>
      <div className="container">
        {selectedElement && (
          <SidePanel
            setAppState={setAppState}
            appState={appState}
            selectedElement={selectedElement}
            elements={elements}
            ctx={ctx}
            startRecording={startRecording}
            stopRecording={stopRecording}
          ></SidePanel>
        )}
        <canvas
          onMouseOut={() => {
            resetMouseState();
            document.documentElement.style.cursor = "default";
          }}
          onTouchMove={(e) => handleTouch(e, handlePointerMove)}
          onTouchStart={(e) => handleTouch(e, handlePointerDown)}
          onTouchEnd={(e) => handleTouch(e, handlePointerUp)}
          onTouchCancel={(e) => handleTouch(e, handlePointerUp)}
          onClick={(e) => {
            const ctx = canvasRef.current!.getContext("2d")!;
            const { x, y } = mousePosToCanvasPos(ctx, e);
            if (hitTestButton(x, y, buttonEndpoints)) {
              const categories = elements.filter(
                (el) => el.type === "category"
              );
              const closestCategory = getClosestPoint(categories, { x, y });
              setAppState((prev) => ({
                ...prev,
                elements: [
                  ...prev.elements,
                  {
                    id: guidGenerator(),
                    x,
                    y,
                    color: colors[0],
                    seed: getRandomArbitrary(1, 10000),
                    text: "",
                    icon: "",
                    type: "leaf",
                    width: LEAF_WIDTH,
                    height: LEAF_HEIGHT,
                    fontColor: "black",
                    categoryId: closestCategory?.id,
                  },
                ],
              }));
            } else if (
              hitTestButton(
                x,
                y,
                deleteButtonPositions,
                DELETE_BUTTON_SIZE,
                DELETE_BUTTON_HEIGHT
              )
            ) {
              onBranchDelete({ x, y });
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
          bottom: 10,
          boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.01)",
          backgroundColor: "#fff",
          borderRadius: 6,
          padding: "5px",
          left: "50%",
          transform: "translate(-50%, -50%)",
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        <div
          className="toolbar"
          style={{
            pointerEvents: "all",
            gap: 5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "black",
          }}
        >
          <button
            className="toolbar-item spaced"
            onClick={() => adjustZoom(-0.25, null)}
          >
            -
          </button>
          <div style={{ whiteSpace: "nowrap" }}>
            {Math.floor(cameraZoom * 100)}% 🔍
          </div>
          <button
            className="toolbar-item spaced"
            onClick={() => adjustZoom(0.25, null)}
          >
            +
          </button>
          <button
            className="toolbar-item spaced"
            onClick={() => {
              if (
                window.confirm(
                  "Attention, cela va redisposer toutes les positions des feuilles automatiquement, êtes vous sûre ?"
                )
              ) {
                startRecording();
                addBranchToTree();
              }
            }}
          >
            Ajouter branche
          </button>
          <button
            onClick={() => {
              const branches: { text: string; id: string }[] = elements.filter(
                (el) => el.type === "category"
              );
              const leafs = branches.map((b) =>
                elements.filter((el) => el.categoryId === b.id)
              );
              setAppState((prev) => ({
                ...prev,
                elements: updateTreeFromModel(
                  canvasRef.current!,
                  branches,
                  leafs
                ),
              }));
            }}
            className="toolbar-item spaced"
          >
            Réorganiser
          </button>
          <button
            className="toolbar-item spaced"
            aria-label="Undo"
            disabled={historyState.history.length <= 1}
            onClick={() => {
              onUndo();
            }}
          >
            <i className="format undo" />
          </button>
          <button
            className="toolbar-item"
            aria-label="Redo"
            disabled={historyState.redoStack.length === 0}
            onClick={() => {
              onRedo();
            }}
          >
            <i className="format redo" />
          </button>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 40,
          transform: "translate(-50%, -50%)",
          borderRadius: 6,
          padding: 6,
          userSelect: "none",
        }}
      >
        <>
          <button
            className="text-white inline-flex justify-center items-center gap-2 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
            disabled={!treeFromModel}
            onClick={() => {
              if (!treeFromModel) return;

              setModels((prev) =>
                prev?.map((m) => {
                  if (m.id === treeFromModel.id) {
                    return {
                      ...m,
                      elements,
                    };
                  }
                  return m;
                })
              );
              router.push("/arbre/edit");
            }}
          >
            Save
          </button>
        </>
      </div>
    </>
  );
}
