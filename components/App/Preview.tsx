import {
  PointerEvent,
  useCallback,
  useLayoutEffect,
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
  draw,
  mousePosToCanvasPos,
  hitTest,
  hitTestButton,
  getMousePos,
  MAX_ZOOM,
  MIN_ZOOM,
  SCROLL_SENSITIVITY,
  adjust,
  SCROLL_SENSITIVITY_TOUCHPAD,
} from "../../drawing";
import useDisableScrollBounce from "../../hooks/useDisableScrollBounce";
import { Model } from "../Model/Model";
import useDisablePinchZoom from "../../hooks/useDisablePinchZoom";
import { normalizeWheelEvent } from "../../utils/normalizeWheelEvent";

const PREVIEW_SIZE = 600;
export default function CanvasPreview({
  treeFromModel,
}: {
  treeFromModel?: Model;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [roughCanvas, setRoughCanvas] = useState<RoughCanvas | null>(null);
  // Hack used to make sure we wait for image to load, needed for firefox
  const [dummyUpdate, forceUpdate] = useState({});
  useDisableScrollBounce();

  const [appState, setAppState] = useState<AppState>(() => {
    return {
      selectedElement: null,
      sectors: [],
      mode: "view",
      cameraZoom: 0.5,
      scaleMultiplier: 0.8,
      cameraOffset: { x: 0, y: 0 },
      isDragging: false,
      dragStart: { x: 0, y: 0 },
      initialPinchDistance: null,
      draggedElement: null,
      elements: treeFromModel!.elements,
      downPoint: { x: 0, y: 0 },
    };
  });

  useDisablePinchZoom();

  const images = useMemo(() => {
    return colors.map((c) => {
      const image = new Image();
      // Need to set fix height and width for firefox, it's a known bug https://bugzilla.mozilla.org/show_bug.cgi?id=700533
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 511.845 511.845" 
        width="200px" height="200px"
        style="enable-background:new 0 0 511.845 511.845" xml:space="preserve">
        <path style="fill:${c}" d="M503.141 9.356c-.016 0-215.215-56.483-390.225 118.511C-31.579 272.371 96.155 416.35 96.155 416.35s143.979 127.742 288.476-16.775C559.64 224.588 503.156 9.388 503.141 9.356Z"/><g style="opacity:.2"><path style="fill:#fff" d="m503.141 8.696-21.337-4.108c.016.031 56.499 219.339-118.495 394.326-48.172 48.203-96.299 66.104-139.052 68.572 47.705 2.75 104-12.184 160.374-68.572C559.64 223.928 503.156 8.728 503.141 8.696z"/></g>
        <path style="fill:${
          c.includes("fff") ? "lightgray" : adjust(c, -20)
        }" d="M300.125 211.728c-4.154-4.17-10.918-4.17-15.074 0L3.122 493.635c-4.163 4.186-4.163 10.934 0 15.09 4.163 4.154 10.911 4.154 15.081 0l281.922-281.923c4.17-4.171 4.17-10.919 0-15.074z"/></svg>`;
      image.src = `data:image/svg+xml;base64,${window.btoa(svg)}`;
      // we make sure we redraw on image load, otherwise firefox wont wait for it.
      image.onload = () => forceUpdate({});
      return { color: c, image };
    });
  }, []);

  function handleTouch(e: any, singleTouchHandler: any) {
    if (e.touches.length == 1) {
      singleTouchHandler(e);
    } else if (e.type == "touchmove" && e.touches.length == 2) {
      setAppState((prev) => ({
        ...prev,
        isDragging: false,
      }));
      handlePinch(e);
    }
  }
  const {
    cameraZoom,
    elements,
    cameraOffset,
    isDragging,
    sectors,
    selectedElement,
    mode,
  } = appState;
  const { x: cameraOffsetX, y: cameraOffsetY } = cameraOffset;
  const lastZoom = useRef(cameraZoom);
  const ref = useCallback((node: HTMLCanvasElement) => {
    if (node !== null) {
      setRoughCanvas(rough.canvas(node));
      canvasRef.current = node;
    }
  }, []);

  const nbOfBranches = treeFromModel?.nbOfBranches;

  const buttonEndpoints = useMemo(
    () => getBranchEndpoint(BASE_TREE_Y, nbOfBranches),
    [nbOfBranches]
  );

  useLayoutEffect(() => {
    if (!roughCanvas) return;
    const canvas = canvasRef.current!;

    canvas.width = PREVIEW_SIZE;
    canvas.height = PREVIEW_SIZE;
    canvas.style.width = `${PREVIEW_SIZE}px`;
    canvas.style.height = `${PREVIEW_SIZE}px`;
    draw(
      canvas,
      cameraZoom,
      { x: cameraOffsetX, y: cameraOffsetY },
      roughCanvas,
      elements,
      images,
      selectedElement?.id,
      mode,
      nbOfBranches
    );
  }, [
    cameraOffsetX,
    cameraOffsetY,
    cameraZoom,
    elements,
    roughCanvas,
    selectedElement,
    sectors,
    images,
    mode,
    dummyUpdate,
    nbOfBranches,
  ]);

  const handlePointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = mousePosToCanvasPos(ctx, e);

    const el = elements.find((el) => hitTest(x, y, el));
    if (el && appState.mode === "edit") {
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
      (mode === "edit" && hitTestButton(x, y, buttonEndpoints)) ||
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

  function resetMouseState() {
    setAppState((prev) => ({
      ...prev,
      isDragging: false,
      initialPinchDistance: null,
      draggedElement: null,
    }));
    document.documentElement.style.cursor = "default";
  }

  return (
    <>
      <div className="container">
        <canvas
          onMouseOut={resetMouseState}
          onTouchMove={(e) => handleTouch(e, handlePointerMove)}
          onTouchStart={(e) => handleTouch(e, handlePointerDown)}
          onTouchEnd={(e) => handleTouch(e, handlePointerUp)}
          onMouseDown={handlePointerDown}
          onMouseUp={handlePointerUp}
          onMouseMove={handlePointerMove}
          onWheel={(e) => {
            const { deltaX: _deltaX, deltaY } = normalizeWheelEvent(e);
            if (!e.ctrlKey) return;
            // Hacky way to detect touchpad zoom
            const scrollSensitivity = SCROLL_SENSITIVITY_TOUCHPAD;
            adjustZoom(deltaY * scrollSensitivity * -1, null);
          }}
          ref={ref}
          width={PREVIEW_SIZE}
          height={PREVIEW_SIZE}
        />
      </div>
    </>
  );
}
