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
  elements: Element[];
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

//https://stackoverflow.com/a/6860916/14536535
function guidGenerator() {
  var S4 = function () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return (
    S4() +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    S4() +
    S4()
  );
}

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
  color: string;
  id: string;
  text: string;
  icon: string;
};

const matrix = [1, 0, 0, 1, 0, 0];
const KEYS = {
  ARROW_LEFT: "ArrowLeft",
  ARROW_RIGHT: "ArrowRight",
  ARROW_DOWN: "ArrowDown",
  ARROW_UP: "ArrowUp",
  ESCAPE: "Escape",
  DELETE: "Delete",
  BACKSPACE: "Backspace",
  SPACE: "Space",
};

function isArrowKey(keyCode: string) {
  return (
    keyCode === KEYS.ARROW_LEFT ||
    keyCode === KEYS.ARROW_RIGHT ||
    keyCode === KEYS.ARROW_DOWN ||
    keyCode === KEYS.ARROW_UP
  );
}

function hitTest(
  x: number,
  y: number,
  element: Element,
  canvas: HTMLCanvasElement,
  cameraZoom: number
) {
  const context = canvas.getContext("2d")!;
  const transform = context.getTransform();
  // Destructure to get the x and y values out of the transformed DOMPoint.
  const { x: newX, y: newY } = transform.transformPoint(
    new DOMPoint(element.x, element.y)
  );
  //const {x, y} = getXY(mx, my)
  return (
    x > newX &&
    x < newX + RC_WIDTH * cameraZoom &&
    y > newY &&
    y < newY + RC_HEIGTH * cameraZoom
  );

  //return x > element.x && x < element.x + RC_WIDTH && y > element.y && y < element.y + RC_HEIGTH;
}

const RC_WIDTH = 200;
const RC_HEIGTH = 100;

const colors = ["gray", "orange", "#82c91e"];

function drawLeaf(
  rc: RoughCanvas,
  canvas: HTMLCanvasElement,
  elements: Element[],
  cameraOffset: { x: number; y: number }
) {
  const ctx = canvas.getContext("2d")!;
  for (const { x, y, seed, color, text, icon } of elements) {
    rc.rectangle(x, y, RC_WIDTH, RC_HEIGTH, {
      fill: color,
      fillWeight: 0.5, // thicker lines for hachure,
      seed,
    });
    ctx.font = "16px Comic Sans MS";
    ctx.textAlign = "center";
    ctx.fillText(text, x + RC_WIDTH / 2, y + RC_HEIGTH / 2);
    ctx.font = "20px Comic Sans MS";
    ctx.fillText(icon, x + RC_WIDTH / 2, y + RC_HEIGTH / 2 + 30);
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

function getRandomArbitrary(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function translate(x: number, y: number, ctx: CanvasRenderingContext2D) {
  matrix[4] += matrix[0] * x + matrix[2] * y;
  matrix[5] += matrix[1] * x + matrix[3] * y;
  ctx.translate(x, y);
}

/*
function getXY(mouseX: number, mouseY: number) {
  let newX = mouseX * matrix[0] + mouseY * matrix[2] + matrix[4];
  let newY = mouseX * matrix[1] + mouseY * matrix[3] + matrix[5];
  return { x: newX, y: newY };
}
*/

function scale(x: number, y: number, ctx: CanvasRenderingContext2D) {
  matrix[0] *= x;
  matrix[1] *= x;
  matrix[2] *= y;
  matrix[3] *= y;
  ctx.scale(x, y);
}
function draw(
  canvas: HTMLCanvasElement,
  cameraZoom: number,
  cameraOffset: { x: number; y: number },
  roughCanvas: RoughCanvas,
  elements: Element[]
) {
  const ctx = canvas.getContext("2d")!;
  translate(canvas.width / 2, canvas.height / 2, ctx);
  scale(cameraZoom, cameraZoom, ctx);
  translate(
    -canvas.width / 2 + cameraOffset.x,
    -canvas.height / 2 + cameraOffset.y,
    ctx
  );
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  roughCanvas.circle(500, 500, 800, {
    seed: 3, 
  })
  drawLeaf(roughCanvas, canvas, elements, cameraOffset);
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
let STEP = 50;
export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [width, height, devicePixelRatio] = useDeviceSize();
  const posRef = useRef<HTMLDivElement>(null);
  const [roughCanvas, setRoughCanvas] = useState<RoughCanvas | null>(null);
  const [appState, setAppState] = useState<AppState>({
    cameraZoom: 0.5,
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
        color: "rgb(10,150,10)",
        id: "1",
        text: "go muscu",
        icon: "💪",
      },
      {
        x: 400,
        y: 500,
        seed: 1,
        color: "gray",
        id: "2",
        text: "coder toute la nigth",
        icon: "👨‍💻",
      },
      {
        x: 600,
        y: 300,
        seed: 1,
        color: "gray",
        id: "3",
        text: "tortelinni",
        icon: "👨",
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

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isArrowKey(e.code)) {
        console.log("true");
        if (e.key === KEYS.ARROW_LEFT)
          setAppState((prev) => ({
            ...prev,
            cameraOffset: {
              x: prev.cameraOffset.x - STEP,
              y: prev.cameraOffset.y,
            },
          }));
        else if (e.key === KEYS.ARROW_RIGHT)
          setAppState((prev) => ({
            ...prev,
            cameraOffset: {
              x: prev.cameraOffset.x + STEP,
              y: prev.cameraOffset.y,
            },
          }));
        else if (e.key === KEYS.ARROW_UP)
          setAppState((prev) => ({
            ...prev,
            cameraOffset: {
              x: prev.cameraOffset.x,
              y: prev.cameraOffset.y - STEP,
            },
          }));
        else if (e.key === KEYS.ARROW_DOWN)
          setAppState((prev) => ({
            ...prev,
            cameraOffset: {
              x: prev.cameraOffset.x,
              y: prev.cameraOffset.y + STEP,
            },
          }));
      }
    }

    document.addEventListener("keydown", handleKeyDown, false);

    return () => document.removeEventListener("keydown", handleKeyDown);
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
    const { x, y } = getMousePos(canvasRef.current!, e);
    if (
      elements.find((el) => hitTest(x, y, el, canvasRef.current!, cameraZoom))
    )
      return;
    setAppState((prev) => ({
      ...prev,
      isDragging: true,
      dragStart: {
        x: getEventLocation(e)!.x / prev.cameraZoom - prev.cameraOffset.x,
        y: getEventLocation(e)!.y / prev.cameraZoom - prev.cameraOffset.y,
      },
    }));

    document.documentElement.style.cursor = "grabbing";
  };

  const handlePointerUp = (e: PointerEvent<HTMLCanvasElement>) => {
    //const { x, y } = getMousePos(canvasRef.current!, e);
    const wasDragging = isDragging;
    setAppState((prev) => ({
      ...prev,
      isDragging: false,
      initialPinchDistance: null,
    }));
    lastZoom.current = cameraZoom;
    if (wasDragging) document.documentElement.style.cursor = "";
  };

  const handlePointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
    const { x, y } = getMousePos(canvasRef.current!, e);
    if (
      elements.find((el) => hitTest(x, y, el, canvasRef.current!, cameraZoom))
    ) {
      document.documentElement.style.cursor = "pointer";
    } else if (!isDragging) {
      document.documentElement.style.cursor = "";
    }
    if (isDragging) {
      setAppState((prev) => ({
        ...prev,
        cameraOffset: {
          x: getEventLocation(e)!.x / prev.cameraZoom - prev.dragStart.x,
          y: getEventLocation(e)!.y / prev.cameraZoom - prev.dragStart.y,
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
          const { x, y } = getEventLocation(e);
          for (const element of elements) {
            if (hitTest(x, y, element, canvasRef.current!, cameraZoom)) {
              setAppState((prev) => ({
                ...prev,
                elements: prev.elements.map((e) => {
                  if (e.id === element.id) {
                    let nextIndex =
                      (colors.findIndex((color) => color === e.color) + 1) %
                      colors.length;
                    return { ...e, color: colors[nextIndex] };
                  }
                  return e;
                }),
              }));
            }
          }
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
      <div
        id="buttonWrapper"
        style={{
          display: "flex",
        }}
      >
        <button
          onClick={() => {
            setAppState((prev) => ({
              ...prev,
              elements: [
                ...prev.elements,
                {
                  id: guidGenerator(),
                  x: getRandomArbitrary(0, canvasRef.current!.width),
                  y: getRandomArbitrary(0, canvasRef.current!.height),
                  color: colors[0],
                  seed: 2,
                  text: "hello world!",
                  icon: "🦍",
                },
              ],
            }));
          }}
        >
          Add
        </button>
        <button onClick={(e) => adjustZoom(0.25, null)}>+</button>
        <button onClick={(e) => adjustZoom(-0.25, null)}>-</button>
      </div>
    </div>
  );
}
