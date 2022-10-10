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
import { Point } from "roughjs/bin/geometry";

type Tree = Category[];

type Category = {
  label: string;
  leaves: Leaf[];
};

type Leaf = {
  label: string;
};

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
  draggedElement: Element | null;
  mode: string;
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

function getTransformedPoint(
  x: number,
  y: number,
  context: CanvasRenderingContext2D
) {
  const originalPoint = new DOMPoint(x, y);
  return context.getTransform().invertSelf().transformPoint(originalPoint);
}

function drawBubble(
  canvas: HTMLCanvasElement,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
  rc: RoughCanvas
) {
  const ctx = canvas.getContext("2d")!;
  const r = x + w;
  const b = y + h;
  ctx.beginPath();
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.textAlign = "center";
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
  ctx.fillStyle = colors[2];
  ctx.fill();
  ctx.font = `${FONT_SIZE}px Comic Sans MS`;
  ctx.fillStyle = "black";

  ctx.fillText("hello world", x + w / 2, y + h / 2);

  ctx.stroke();
}

type MindMap = MNode[];

type MNode = { id: string; label: string };

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
const tree: Tree = [
  {
    label: "Penne",
    leaves: [
      {
        label: "Spaghetti alla chitarra",
      },
      {
        label: "Spaghetti alla chitarra",
      },
      {
        label: "Spaghetti alla chitarra",
      },
    ],
  },
  {
    label: "Fusili",
    leaves: [
      {
        label: "Spaghetti alla chitarra",
      },
      {
        label: "Spaghetti alla chitarra",
      },
      {
        label: "Spaghetti alla chitarra",
      },
    ],
  },
  {
    label: "Rigatoni",
    leaves: [
      {
        label: "Trenette",
      },
      {
        label: "Tripoline",
      },
    ],
  },
  {
    label: "Spaghetti	",
    leaves: [
      {
        label: "Spaghetti alla chitarra",
      },
      {
        label: "Spaghettini	",
      },
      {
        label: "Spaghettoni",
      },
      {
        label: "Stringozzi",
      },
    ],
  },
];

function isArrowKey(keyCode: string) {
  return (
    keyCode === KEYS.ARROW_LEFT ||
    keyCode === KEYS.ARROW_RIGHT ||
    keyCode === KEYS.ARROW_DOWN ||
    keyCode === KEYS.ARROW_UP
  );
}

function toCanvasCoord(
  x: number,
  y: number,
  context: CanvasRenderingContext2D
) {
  const transform = context.getTransform();
  // Destructure to get the x and y values out of the transformed DOMPoint.
  const { x: newX, y: newY } = transform.transformPoint(new DOMPoint(x, y));
  return { x: newX, y: newY };
}

function hitTest(
  x: number,
  y: number,
  element: Element,
  canvas: HTMLCanvasElement,
  cameraZoom: number
) {
  const context = canvas.getContext("2d")!;
  // Destructure to get the x and y values out of the transformed DOMPoint.
  const { x: newX, y: newY } = toCanvasCoord(element.x, element.y, context);
  //const {x, y} = getXY(mx, my)
  return (
    x > newX &&
    x < newX + RC_WIDTH * cameraZoom &&
    y > newY &&
    y < newY + RC_HEIGTH * cameraZoom
  );

  //return x > element.x && x < element.x + RC_WIDTH && y > element.y && y < element.y + RC_HEIGTH;
}

const RC_WIDTH = 100;
const RC_HEIGTH = 50;
const FONT_SIZE = 10;

const colors = ["gray", "orange", "#82c91e"];

function drawLeaf(
  rc: RoughCanvas,
  ctx: CanvasRenderingContext2D,
  element: Element
) {
  const { x, y, seed, color, text, icon } = element;
  rc.rectangle(x, y, RC_WIDTH, RC_HEIGTH, {
    fill: color,
    fillWeight: 0.5, // thicker lines for hachure,
    seed,
    fillStyle: "solid",
  });
  ctx.font = `${FONT_SIZE}px Comic Sans MS`;
  ctx.textAlign = "center";
  ctx.fillText(
    `x: ${Math.floor(toCanvasCoord(x, y, ctx).x)}, y: ${Math.floor(
      toCanvasCoord(x, y, ctx).y
    )}`,
    x + RC_WIDTH / 2,
    y + RC_HEIGTH / 2
  );
  ctx.font = `${FONT_SIZE + 4}px Comic Sans MS`;
  ctx.fillText(icon, x + RC_WIDTH / 2, y + RC_HEIGTH / 2 + RC_HEIGTH / 3);
}

function drawRectAtScale(
  ctx: CanvasRenderingContext2D,
  scale: number,
  width: number,
  height: number,
  color: string
) {
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.scale(scale, scale);
  ctx.fillStyle = color;
  ctx.fillRect(-20, -10, 40, 20);
  ctx.restore();
}

function drawTreeAtScale(
  ctx: CanvasRenderingContext2D,
  scale: number,
  width: number,
  height: number,
  color: string,
  rc: RoughCanvas
) {
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.scale(scale, scale);
  ctx.translate(-120, -200);
  rc.path(  
    "m242.559,115.437c-2.403,-2.589 -4.979,-4.97 -7.688,-7.16c1.357,-3.439 2.111,-7.179 2.111,-11.094c0,-16.718 -13.602,-30.32 -30.32,-30.32c-0.985,0 -1.958,0.051 -2.92,0.143c-3.057,-37.455 -34.495,-67.006 -72.724,-67.006c-25.82,0 -48.535,13.489 -61.514,33.778c-2.793,-0.471 -5.657,-0.729 -8.582,-0.729c-28.38,0 -51.469,23.089 -51.469,51.469c0,11.51 3.798,22.148 10.206,30.73c-0.06,0.064 -0.123,0.124 -0.182,0.189c-12.56,13.529 -19.477,31.152 -19.477,49.624c0,40.247 32.743,72.989 72.99,72.989c3.792,0 7.531,-0.292 11.195,-0.85l26.937,41.618l-13.127,85.065c-0.419,2.728 0.295,5.331 2.011,7.331c1.732,2.019 4.347,3.177 7.172,3.177l48.027,0c2.825,0 5.438,-1.158 7.171,-3.176c1.716,-2 2.43,-4.604 2.01,-7.334l-12.905,-83.635l27.736,-42.852c3.226,0.43 6.506,0.656 9.828,0.656c40.247,0 72.99,-32.743 72.99,-72.989c0,-18.472 -6.917,-36.096 -19.476,-49.624zm-110.795,140.059l-18.911,-29.218c6.892,-4.498 13.043,-10.193 18.165,-16.928c5.382,7.077 11.902,13.001 19.223,17.6l-18.477,28.546z",
    {
      seed: 2,
      fill: color,
    }
  );
  ctx.restore();
}

function drawTreeSvg(rc: RoughCanvas, ctx: CanvasRenderingContext2D) {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  drawTreeAtScale(ctx, 1, width, height, colors[0], rc);
  drawTreeAtScale(ctx, 3, width, height, colors[2], rc);

}

function drawIt(
  rc: RoughCanvas,
  canvas: HTMLCanvasElement,
  elements: Element[]
) {
  const ctx = canvas.getContext("2d")!;
  drawTreeSvg(rc, ctx);
  for (const element of elements) {
    drawLeaf(rc, ctx, element);
  }
  let points: Point[] = [];
  for (let i = 0; i < 20; i++) {
    let x = (400 / 20) * i + 10;
    let xdeg = (Math.PI / 100) * x;
    let y = Math.round(Math.sin(xdeg) * 90) + 500;
    points.push([x, y]);
  }
  rc.curve(points, {
    stroke: "red",
    strokeWidth: 3,
    seed: 4,
  });
  const p = new Path2D(
    "M15 3 Q16.5 6.8 25 18 A12.8 12.8 0 1 1 5 18 Q13.5 6.8 15 3z"
  );
  ctx.fillStyle = colors[2];
  ctx.fill(p);
  ctx.stroke(p);
  //drawBubble(canvas, 10, 60, 220, 90, 20, rc);
  /*
  rc.path("M298.736,115.437c-2.403-2.589-4.979-4.97-7.688-7.16c1.357-3.439,2.111-7.179,2.111-11.094  c0-16.718-13.602-30.32-30.32-30.32c-0.985,0-1.958,0.051-2.92,0.143C256.862,29.551,225.424,0,187.195,0  c-25.82,0-48.535,13.489-61.514,33.778c-2.793-0.471-5.657-0.729-8.582-0.729c-28.38,0-51.469,23.089-51.469,51.469  c0,11.51,3.798,22.148,10.206,30.73c-0.06,0.064-0.123,0.124-0.182,0.189c-12.56,13.529-19.477,31.152-19.477,49.624  c0,40.247,32.743,72.989,72.99,72.989c3.792,0,7.531-0.292,11.195-0.85l26.937,41.618l-13.127,85.065  c-0.419,2.728,0.295,5.331,2.011,7.331c1.732,2.019,4.347,3.177,7.172,3.177h48.027c2.825,0,5.438-1.158,7.171-3.176  c1.716-2,2.43-4.604,2.01-7.334l-12.905-83.635l27.736-42.852c3.226,0.43,6.506,0.656,9.828,0.656  c40.247,0,72.99-32.743,72.99-72.989C318.212,146.589,311.295,128.965,298.736,115.437z M187.941,255.496l-18.911-29.218  c6.892-4.498,13.043-10.193,18.165-16.928c5.382,7.077,11.902,13.001,19.223,17.6L187.941,255.496z"
  , {
    fill: colors[2],
    seed: 2,
  })
  rc.path("M230 80 A 45 45, 0, 1, 0, 275 125 L 275 80 Z", {
    fill: colors[2],
    seed: 2,
  });
  rc.path(
    "M468.607,0c-12.5,1-304.4,8.3-395,99c-92.8,93.8-98,240.8-10.4,328.3c92.8,85.9,227.6,85.3,327.3-11.5   c90.7-89.6,99-382.5,99-395C487.807,8,480.707,1.3,468.607,0z M362.307,387.8c-83.3,79.7-190.7,72.7-254.4,24l79.2-79.2l148.1-15.7   c10.4-1,18.8-10.4,17.7-21.9c-1-10.4-10.4-18.8-21.9-17.7l-98.7,10.1l42.4-42.4c8.3-8.3,8.3-20.8,0-29.2c-8.3-8.3-20.8-8.3-29.2,0   l-43.7,43.7l10.3-101c2.1-10.4-6.3-20.8-17.7-21.9c-10.4-2.1-20.8,6.3-21.9,17.7l-15.9,150.4l-78,78   c-57.2-73-47.7-183.7,24.1-255.5c60.5-59.4,253.3-81.3,346.1-85.5C444.607,134.5,422.707,327.3,362.307,387.8z",
    { fill: "rgb(10,150,10)", seed: 2 }
  );  
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
    throw new Error("Can't read mouse location");
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
  drawIt(roughCanvas, canvas, elements);
  //buildTree(ctx, roughCanvas);
}

function drawTree(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  angle: number,
  depth: number,
  context: CanvasRenderingContext2D,
  roughCanvas: RoughCanvas
) {
  roughCanvas.line(x1, y1, x2, y2, {
    stroke: "brown",
    strokeWidth: 1.5,
    seed: 1,
  });

  if (depth > 0) {
    var x = x2 - x1;
    var y = y2 - y1;

    var scale = 0.7;

    x *= scale;
    y *= scale;

    var xLeft = x * Math.cos(-angle) - y * Math.sin(-angle);
    var yLeft = x * Math.sin(-angle) + y * Math.cos(-angle);

    var xRight = x * Math.cos(+angle) - y * Math.sin(+angle);
    var yRight = x * Math.sin(+angle) + y * Math.cos(+angle);

    xLeft += x2;
    yLeft += y2;

    xRight += x2;
    yRight += y2;

    drawTree(x2, y2, xLeft, yLeft, angle, depth - 1, context, roughCanvas);
    drawTree(x2, y2, xRight, yRight, angle, depth - 1, context, roughCanvas);
  }
}

function buildTree(
  context: CanvasRenderingContext2D,
  roughCanvas: RoughCanvas
) {
  var x1 = 1000;
  var y1 = 300;

  var x2 = 1000;
  var y2 = 100;

  var angle = 0.1 * Math.PI;
  var depth = 4;

  drawTree(x1, y1, x2, y2, angle, depth, context, roughCanvas);
}

function mousePosToCanvasPos(
  context: CanvasRenderingContext2D,
  x: number,
  y: number
) {
  const transform = context.getTransform();
  var matrix = context.getTransform(); // W3C (future)
  var imatrix = matrix.invertSelf(); // invert

  // apply to point:
  const px = x * imatrix.a + y * imatrix.c + imatrix.e;
  const py = x * imatrix.b + y * imatrix.d + imatrix.f;
  return {
    x: px,
    y: py,
  };
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
let INITIAL_ZOOM = 0.5;
export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [width, height, devicePixelRatio] = useDeviceSize();
  const posRef = useRef<HTMLDivElement>(null);
  const [roughCanvas, setRoughCanvas] = useState<RoughCanvas | null>(null);
  const [appState, setAppState] = useState<AppState>(() => ({
    cameraZoom: INITIAL_ZOOM,
    scaleMultiplier: 0.8,
    cameraOffset: { x: width / 2, y: height / 2 },
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    initialPinchDistance: null,
    draggedElement: null,
    mode: "select",
    elements: [
      {
        x: 0,
        y: 0,
        seed: getRandomArbitrary(1, 1000),
        color: colors[2],
        id: guidGenerator(),
        text: "go muscu",
        icon: "💪",
      },
      {
        x: window.innerWidth,
        y: window.innerHeight,
        seed: getRandomArbitrary(1, 1000),
        color: "gray",
        id: guidGenerator(),
        text: "coder toute la nigth",
        icon: "👨‍💻",
      },
      {
        x: 600,
        y: 300,
        seed: getRandomArbitrary(1, 1000),
        color: "gray",
        id: guidGenerator(),
        text: "tortelinni",
        icon: "👨",
      },
    ],
  }));

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
      if (e.code === "KeyS") {
        setAppState((prev) => ({
          ...prev,
          mode: "select",
        }));
      }
      if (e.code === "KeyD") {
        setAppState((prev) => ({
          ...prev,
          mode: "drag",
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

  function setMode(m: string) {
    setAppState((prev) => ({ ...prev, mode: m }));
  }
  const handlePointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    const { x, y } = getMousePos(canvasRef.current!, e);
    const el = elements.find((el) =>
      hitTest(x, y, el, canvasRef.current!, cameraZoom)
    );
    if (el && appState.mode === "drag") {
      setAppState((prev) => ({
        ...prev,
        draggedElement: el,
      }));
      return;
    } else if (!el) {
      setAppState((prev) => ({
        ...prev,
        isDragging: true,
        dragStart: {
          x: getEventLocation(e)!.x / prev.cameraZoom - prev.cameraOffset.x,
          y: getEventLocation(e)!.y / prev.cameraZoom - prev.cameraOffset.y,
        },
      }));

      document.documentElement.style.cursor = "grabbing";
    }
  };

  const handlePointerUp = (e: PointerEvent<HTMLCanvasElement>) => {
    //const { x, y } = getMousePos(canvasRef.current!, e);
    const wasDragging = isDragging;
    setAppState((prev) => ({
      ...prev,
      isDragging: false,
      initialPinchDistance: null,
      draggedElement: null,
    }));
    lastZoom.current = cameraZoom;
    if (wasDragging) document.documentElement.style.cursor = "";
  };

  const handlePointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
    const { x, y } = getMousePos(canvasRef.current!, e);

    if (appState.draggedElement) {
      const canvas = canvasRef.current!;
      const context = canvas.getContext("2d")!;
      let { x: startX, y: startY } = appState.draggedElement;
      const { x: px, y: py } = mousePosToCanvasPos(context, x, y);
      const dx = px - startX;
      const dy = py - startY;
      const dragTarget = {
        ...appState.draggedElement,
        x: startX + dx - RC_WIDTH / 2,
        y: startY + dy - RC_HEIGTH / 2,
      };

      const newElems = appState.elements.map((e) => {
        if (e.id === dragTarget.id) {
          return dragTarget;
        }
        return e;
      });
      context.restore();
      setAppState((prev) => ({ ...prev, elements: newElems }));
      return;
    }
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
        cameraZoom = zoomFactor * lastZoom.current;
      }

      cameraZoom = Math.min(cameraZoom, MAX_ZOOM);
      cameraZoom = Math.max(cameraZoom, MIN_ZOOM);
      setAppState((prev) => ({ ...prev, cameraZoom }));
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
          if (appState.mode !== "select") return;
          const { x, y } = getEventLocation(e);
          console.log({ x, y });
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
                  seed: getRandomArbitrary(1, 10000),
                  text: "hello world!",
                  icon: "🦍",
                },
              ],
            }));
          }}
        >
          Add
        </button>
        Mode:
        <select value={appState.mode} onChange={(e) => setMode(e.target.value)}>
          <option value="drag">drag</option>
          <option value="select">select</option>
        </select>
      </div>
      <div
        style={{
          position: "absolute",
          display: "flex",
          gap: 10,
          bottom: 10,
          left: 10,
        }}
      >
        <button onClick={(e) => adjustZoom(-0.25, null)}>-</button>
        <div>{Math.floor(cameraZoom * 100)}%</div>
        <button onClick={(e) => adjustZoom(0.25, null)}>+</button>
      </div>
    </div>
  );
}
