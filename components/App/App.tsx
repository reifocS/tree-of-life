import {
  MouseEvent,
  PointerEvent,
  TouchEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import rough from "roughjs/bin/rough";
import { RoughCanvas } from "roughjs/bin/canvas";

type AppState = {
  cameraZoom: number;
  scaleMultiplier: number;
  cameraOffset: {
    x: number;
    y: number;
  };
  isDragging: boolean;
  dragStart: {
    x: number;
    y: number;
  };
  initialPinchDistance: null | number;
  elements: { x: number; y: number; seed: number }[];
};
const useDeviceSize = () => {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [devicePixelRatio, setDevicePixelRatio] = useState(0);
  const handleWindowResize = () => {
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);
    // this tells the browser how many of the screen's actual pixels should be used to draw a single CSS pixel.
    setDevicePixelRatio(window.devicePixelRatio);
  };

  useEffect(() => {
    // component is mounted and window is available
    handleWindowResize();
    window.addEventListener("resize", handleWindowResize);
    // unsubscribe from the event on component unmount
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);

  return [width, height, devicePixelRatio];
};

function drawBubble(
  canvas: HTMLCanvasElement,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) {
  const ctx = canvas.getContext("2d")!;
  const r = x + w;
  const b = y + h;
  ctx.beginPath();
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + radius / 2, y - 10);
  ctx.lineTo(x + radius * 2, y);
  ctx.lineTo(r - radius, y);
  ctx.quadraticCurveTo(r, y, r, y + radius);
  ctx.lineTo(r, y + h - radius);
  ctx.quadraticCurveTo(r, b, r - radius, b);
  ctx.lineTo(x + radius, b);
  ctx.quadraticCurveTo(x, b, x, b - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.fillText("hello world", x + 20, y + h / 2);
  ctx.stroke();
}
/*
function drawSpeechText(
  canvas: HTMLCanvasElement,
  originX = 75,
  originY = 25,
  width = 100,
  heigth = 75,
  color = "gray",
  cpx: number,
  cpy: number
) {
  const ctx = canvas.getContext("2d")!;
  const r = 25;
  ctx.beginPath();
  ctx.moveTo(originX, originY);
  ctx.quadraticCurveTo(originY, originY, originX - width / 2, originY + heigth / 2);
  //ctx.quadraticCurveTo(25, 100, originX - width / 2 + r, originY + heigth);
  //ctx.quadraticCurveTo(50, 120, originX - width / 2 + r - 20, heigth + originY + r);
  //ctx.quadraticCurveTo(60, 120, originX - width / 2 + r + 15, heigth + r);
  //ctx.quadraticCurveTo(125, 100, width + originX - width / 2, originY + heigth / 2);
  //ctx.quadraticCurveTo(125, 25, originX, originY);
  ctx.rect(originX - width / 2, originY, width, heigth)
  ctx.moveTo(originX, originY);
  ctx.fillText("hello world!", originX - 30, originY + heigth / 2);
  //ctx.fillStyle = color;
  //ctx.fill();
  ctx.stroke();
}*/

type Element = {
  x: number;
  y: number;
  seed: number;
};

function drawLeaf(
  rc: RoughCanvas,
  canvas: HTMLCanvasElement,
  elements: Element[]
) {
  const ctx = canvas.getContext("2d")!;
  for (const { x, y, seed } of elements) {
    rc.circle(x, y, 120, {
      fill: "rgb(10,150,10)",
      fillWeight: 3, // thicker lines for hachure,
      fillStyle: "solid",
      seed,
    });
  }

  /*rc.path("M230 80 A 45 45, 0, 1, 0, 275 125 L 275 80 Z", {
    fill: "rgb(10,150,10)",
    fillStyle: "solid",
    seed: 2,
  });
  ctx.font = "20px Comic Sans MS";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.fillText("Hello world", 500, 150);*/
}

function getEventLocation(
  e:
    | PointerEvent<HTMLCanvasElement>
    | TouchEvent<HTMLCanvasElement>
    | MouseEvent<HTMLCanvasElement>
) {
  if ("touches" in e && e.touches.length == 1) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  } else if ("clientX" in e && e.clientY) {
    return { x: e.clientX, y: e.clientY };
  } else {
    throw new Error("getEventLocation");
  }
}
function draw(
  canvas: HTMLCanvasElement,
  cameraZoom: number,
  cameraOffset: { x: number; y: number },
  roughCanvas: RoughCanvas,
  elements: Element[]
) {
  const ctx = canvas.getContext("2d")!;
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(cameraZoom, cameraZoom);
  ctx.translate(
    -canvas.width / 2 + cameraOffset.x,
    -canvas.height / 2 + cameraOffset.y
  );
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#991111";
  ctx.fillRect(-50, -50, 100, 100);

  ctx.fillStyle = "#eecc77";
  ctx.fillRect(-35, -35, 20, 20);
  ctx.fillRect(15, -35, 20, 20);
  ctx.fillRect(-35, 15, 70, 20);

  ctx.fillStyle = "#fff";
  const size = 32;
  const font = "courier";
  ctx.font = `${size}px ${font}`;
  ctx.fillText("Simple Pan and Zoom Canvas", -255, -100);

  ctx.rotate((-31 * Math.PI) / 180);
  ctx.fillStyle = `#${(Math.round(Date.now() / 40) % 4096).toString(16)}`;
  ctx.fillText("Now with touch!", -110, 100);

  ctx.fillStyle = "black";
  ctx.rotate((31 * Math.PI) / 180);

  ctx.fillText("Wow, you found me!", -260, -2000);
  drawLeaf(roughCanvas, canvas, elements);
}

function getMousePos(canvas: HTMLCanvasElement, evt: any) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top,
  };
}
let MAX_ZOOM = 5;
let MIN_ZOOM = 0.1;
let SCROLL_SENSITIVITY = 0.0005;

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [width, height, devicePixelRatio] = useDeviceSize();
  const posRef = useRef<HTMLDivElement>(null);
  const [roughCanvas, setRoughCanvas] = useState<RoughCanvas | null>(null);
  const [appState, setAppState] = useState<AppState>({
    cameraZoom: 1.0,
    scaleMultiplier: 0.8,
    cameraOffset: { x: width / 2, y: height / 2 },
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    initialPinchDistance: null,
    elements: [
      {
        x: 300,
        y: 300,
        seed: 1,
      },
    ],
  });

  const { cameraZoom, elements, cameraOffset, isDragging } = appState;
  const { x: cameraOffsetX, y: cameraOffsetY } = cameraOffset;
  const lastZoom = useRef(cameraZoom);
  const ref = useCallback((node: HTMLCanvasElement) => {
    if (node !== null) {
      setRoughCanvas(rough.canvas(node));
      canvasRef.current = node;
    }
  }, []);

  useLayoutEffect(() => {
    if (!roughCanvas) return;
    const canvas = canvasRef.current!;
    //const scale = devicePixelRatio;
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    draw(
      canvas,
      cameraZoom,
      { x: cameraOffsetX, y: cameraOffsetY },
      roughCanvas,
      elements
    );
  }, [
    cameraOffsetX,
    cameraOffsetY,
    cameraZoom,
    elements,
    height,
    roughCanvas,
    width,
  ]);

  const handlePointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    //const { x, y } = getMousePos(canvasRef.current!, e);
    setAppState((prev) => ({
      ...prev,
      isDragging: true,
      dragStart: {
        x: getEventLocation(e)!.x / prev.cameraZoom - prev.cameraOffset.x,
        y: getEventLocation(e)!.y / prev.cameraZoom - prev.cameraOffset.y,
      },
    }));
  };

  const handlePointerUp = (e: PointerEvent<HTMLCanvasElement>) => {
    //const { x, y } = getMousePos(canvasRef.current!, e);
    setAppState((prev) => ({
      ...prev,
      isDragging: false,
      initialPinchDistance: null,
    }));
    lastZoom.current = cameraZoom;
  };

  const handlePointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
    //const { x, y } = getMousePos(canvasRef.current!, e);
    if (isDragging) {
      setAppState((prev) => ({
        ...prev,
        cameraOffset: {
          x: getEventLocation(e)!.x / cameraZoom - prev.dragStart.x,
          y: getEventLocation(e)!.y / cameraZoom - prev.dragStart.y,
        },
      }));
    }
  };
  function handlePinch(e: any) {
    e.preventDefault();

    let touch1 = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    let touch2 = { x: e.touches[1].clientX, y: e.touches[1].clientY };

    // This is distance squared, but no need for an expensive sqrt as it's only used in ratio
    let currentDistance =
      (touch1.x - touch2.x) ** 2 + (touch1.y - touch2.y) ** 2;

    if (appState.initialPinchDistance === null) {
      setAppState((prev) => ({
        ...prev,
        initialPinchDistance: currentDistance,
      }));
    } else {
      adjustZoom(null, currentDistance / appState.initialPinchDistance);
    }
  }

  function adjustZoom(zoomAmount: number | null, zoomFactor: number | null) {
    if (!isDragging) {
      let cameraZoom = appState.cameraZoom;
      if (zoomAmount) {
        cameraZoom += zoomAmount;
      } else if (zoomFactor) {
        console.log(zoomFactor);
        cameraZoom = zoomFactor * lastZoom.current;
      }

      cameraZoom = Math.min(cameraZoom, MAX_ZOOM);
      cameraZoom = Math.max(cameraZoom, MIN_ZOOM);
      setAppState((prev) => ({ ...prev, cameraZoom }));
      console.log(zoomAmount);
    }
  }

  const handleTouch = (e: any, singleTouchHandler: (e: any) => void) => {
    if (e.touches.length == 1) {
      singleTouchHandler(e);
    } else if (e.type == "touchmove" && e.touches.length == 2) {
      setAppState((prev) => ({ ...prev, isDragging: false }));
      handlePinch(e);
    }
  };
  return (
    <div>
      <canvas
        onClick={(e) => {
          console.log({ ...getEventLocation(e) }, elements);
        }}
        onMouseDown={handlePointerDown}
        onTouchStart={(e) => handleTouch(e, handlePointerDown)}
        onMouseUp={handlePointerUp}
        onTouchEnd={(e) => handleTouch(e, handlePointerUp)}
        onMouseMove={handlePointerMove}
        onTouchMove={(e) => handleTouch(e, handlePointerMove)}
        onWheel={(e) => adjustZoom(e.deltaY * SCROLL_SENSITIVITY, null)}
        ref={ref}
        width={width}
        height={height}
      />
      <div
        style={{
          position: "absolute",
          left: 300,
          bottom: 100,
        }}
        ref={posRef}
      ></div>
      <div id="buttonWrapper"></div>
    </div>
  );
}
