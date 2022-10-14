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
import useKeyboard from "../../hooks/useKeyboard";

//TODO
//Remove magic variables (tree size for example)

export type AppState = {
  cameraZoom: number;
  leafScale: number;
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

type Element = {
  x: number;
  y: number;
  seed: number;
  color: string;
  id: string;
  text: string;
  icon: string;
  type: "leaf" | "category" | "circle";
  width?: number;
  height?: number;
  actualBoundingBoxAscent?: number;
  font?: string;
  categoryId?: string;
};

const matrix = [1, 0, 0, 1, 0, 0];

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

function toLeafBoundingRect(x: number, y: number, scale: number) {
  return { x: x - 60 * scale, y: y * scale };
}

function hitTest(
  x: number,
  y: number,
  element: Element,
  canvas: HTMLCanvasElement,
  cameraZoom: number,
  leafScale: number
) {
  const context = canvas.getContext("2d")!;
  // Destructure to get the x and y values out of the transformed DOMPoint.
  //TODO Change mouse coord to canvas coord instead of the opposite
  if (element.type === "leaf") {
    const { x: newX, y: newY } = toCanvasCoord(
      element.x - 60 * leafScale,
      element.y,
      context
    );

    return (
      x > newX &&
      x < newX + RC_WIDTH * leafScale * cameraZoom &&
      y > newY &&
      y < newY + RC_HEIGTH * leafScale * cameraZoom
    );
  } else if (element.type === "category") {
    const { x: newX, y: newY } = toCanvasCoord(element.x, element.y, context);
    return (
      x >= newX &&
      x <= newX + element.width! * cameraZoom &&
      y >= newY &&
      y <= newY + element.height! * cameraZoom
    );
  } else if (element.type === "circle") {
    /*
  check every circle data x, y, r you have, 
  see whether dx * dx + dy * dy < r * r, 
  where dx = cx - x, dy = cy - y. 
  Circles that satisfy this equation were clicked */
    const { x: newX, y: newY } = toCanvasCoord(element.x, element.y, context);
    const dx = x - newX;
    const dy = y - newY;
    const r = element.width! * cameraZoom / 2;
    const hit = dx * dx + dy * dy < r * r;
    return hit;
  }
}

const RC_WIDTH = 100;
const RC_HEIGTH = 75;
const FONT_SIZE = 14;
const LEAF_SCALE: Record<string, number> = {
  SMALL: 0.5,
  MEDIUM: 1.5,
  BIG: 2,
};
const colors = ["gray", "orange", "#82c91e"];
const sectors = ["gray", "orange", "blue", "yellow", "#82c91e"];

function drawLeaf(
  rc: RoughCanvas,
  ctx: CanvasRenderingContext2D,
  element: Element,
  scale: number
) {
  const { x, y, seed, color, text, icon } = element;
  rc.path(
    `m${x},${y}c-0,0 -${27 * scale},-${9 * scale} -${49 * scale},${
      19 * scale
    }c-${18 * scale},${23 * scale} -${2 * scale},${47 * scale} -${2 * scale},${
      47 * scale
    }s${18 * scale},${20 * scale} ${36 * scale},-${2 * scale}c${21 * scale},-${
      28 * scale
    } ${14 * scale},-${64 * scale} ${14 * scale},-${64 * scale}z`,
    {
      seed,
      roughness: 0.5,
      fill: color,
      fillStyle: "solid",
    }
  );
  rc.path(
    `m${x - 40 * scale},${y + 60 * scale}c-0,-0 -0,-0 -1,0l-${19 * scale},${
      24 * scale
    }c-0,0 -0,0 0,1c0,0 0,0 1,0l${19 * scale},-${24 * scale}c0,-0 0,-0 0,-1z`,
    {
      seed,
      roughness: 0,
      fill: "#8AC054",
    }
  );
  printAt(
    ctx,
    text,
    x - RC_WIDTH * scale + 15 * scale,
    y + (RC_HEIGTH / 3) * scale,
    15,
    RC_WIDTH * scale - 15 * scale,
    icon
  );
  //hitbox
  /*
  rc.rectangle(x - 60 * scale, y, 60 * scale, 75 * scale, {
    seed: 1,
  });*/
  /*
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
  ctx.fillText(icon, x + RC_WIDTH / 2, y + RC_HEIGTH / 2 + RC_HEIGTH / 3);*/
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
  //ctx.translate(-130, -200);
  //p2
  ctx.translate(-185, -200);

  //const p0 = "m609.16001,76.84854c-6.02496,-4.24114 -12.48368,-8.14155 -19.27586,-11.72907c3.40236,-5.63356 5.29284,-11.76019 5.29284,-18.1735c0,-27.38639 -34.10384,-49.66835 -76.02031,-49.66835c-2.46966,0 -4.90923,0.08355 -7.32122,0.23425c-7.66471,-61.35646 -86.48815,-109.76508 -182.33843,-109.76508c-64.73762,0 -121.69017,22.09684 -154.23198,55.33303c-7.00279,-0.77156 -14.18361,-1.1942 -21.51736,-1.1942c-71.15622,0 -129.04649,37.82297 -129.04649,84.31333c0,18.85497 9.5226,36.28148 25.58916,50.33998c-0.15044,0.10484 -0.30839,0.20313 -0.45632,0.30961c-31.49126,22.16237 -48.83403,51.03128 -48.83403,81.29096c0,65.93014 82.09542,119.56606 183.00537,119.56606c9.50755,0 18.88222,-0.47834 28.06885,-1.39242l67.53823,68.17603l-32.91288,139.34821c-1.05054,4.46884 0.73964,8.73291 5.04211,12.00919c4.34259,3.3074 10.89909,5.20436 17.98211,5.20436l120.41648,0c7.08303,0 13.63451,-1.89696 17.97961,-5.20273c4.30247,-3.27628 6.09266,-7.54199 5.03961,-12.0141l-32.35627,-137.00568l69.54154,-70.19749c8.08844,0.7044 16.31227,1.07462 24.64141,1.07462c100.90995,0 183.00537,-53.63755 183.00537,-119.56606c0,-30.25969 -17.34276,-59.13023 -48.83152,-81.29096zm-277.79257,229.43598l-47.41491,-47.86312c17.28008,-7.36835 32.70227,-16.69754 45.54449,-27.7304c13.49411,11.5931 29.84148,21.29743 48.19718,28.83123l-46.32676,46.76229z"
  // const p1 =
  ("m242.559,115.437c-2.403,-2.589 -4.979,-4.97 -7.688,-7.16c1.357,-3.439 2.111,-7.179 2.111,-11.094c0,-16.718 -13.602,-30.32 -30.32,-30.32c-0.985,0 -1.958,0.051 -2.92,0.143c-3.057,-37.455 -34.495,-67.006 -72.724,-67.006c-25.82,0 -48.535,13.489 -61.514,33.778c-2.793,-0.471 -5.657,-0.729 -8.582,-0.729c-28.38,0 -51.469,23.089 -51.469,51.469c0,11.51 3.798,22.148 10.206,30.73c-0.06,0.064 -0.123,0.124 -0.182,0.189c-12.56,13.529 -19.477,31.152 -19.477,49.624c0,40.247 32.743,72.989 72.99,72.989c3.792,0 7.531,-0.292 11.195,-0.85l26.937,41.618l-13.127,85.065c-0.419,2.728 0.295,5.331 2.011,7.331c1.732,2.019 4.347,3.177 7.172,3.177l48.027,0c2.825,0 5.438,-1.158 7.171,-3.176c1.716,-2 2.43,-4.604 2.01,-7.334l-12.905,-83.635l27.736,-42.852c3.226,0.43 6.506,0.656 9.828,0.656c40.247,0 72.99,-32.743 72.99,-72.989c0,-18.472 -6.917,-36.096 -19.476,-49.624zm-110.795,140.059l-18.911,-29.218c6.892,-4.498 13.043,-10.193 18.165,-16.928c5.382,7.077 11.902,13.001 19.223,17.6l-18.477,28.546z");
  const p2 =
    "m347.16016,115.437c-3.43927,-2.589 -7.12614,-4.97 -11.00337,-7.16c1.94219,-3.439 3.02135,-7.179 3.02135,-11.094c0,-16.718 -19.46773,-30.32 -43.3952,-30.32c-1.40977,0 -2.80237,0.051 -4.17922,0.143c-4.3753,-37.455 -49.37063,-67.006 -104.0855,-67.006c-36.95462,0 -69.46524,13.489 -88.0413,33.778c-3.99745,-0.471 -8.09653,-0.729 -12.2829,-0.729c-40.61859,0 -73.6645,23.089 -73.6645,51.469c0,11.51 5.43585,22.148 14.60724,30.73c-0.08587,0.064 -0.17604,0.124 -0.26049,0.189c-17.97638,13.529 -27.87626,31.152 -27.87626,49.624c0,40.247 46.86309,72.989 104.46621,72.989c5.42726,0 10.77867,-0.292 16.02273,-0.85l38.55331,41.618l-18.78789,85.065c-0.59969,2.728 0.42222,5.331 2.87822,7.331c2.47891,2.019 6.2216,3.177 10.26485,3.177l68.73817,0c4.04325,0 7.78308,-1.158 10.26342,-3.176c2.45601,-2 3.47791,-4.604 2.87679,-7.334l-18.47015,-83.635l39.69687,-42.852c4.61718,0.43 9.31165,0.656 14.06623,0.656c57.60312,0 104.46621,-32.743 104.46621,-72.989c0,-18.472 -9.89989,-36.096 -27.87483,-49.624zm-158.57424,140.059l-27.06618,-29.218c9.86411,-4.498 18.66766,-10.193 25.99848,-16.928c7.70293,7.077 17.03462,13.001 27.51273,17.6l-26.44502,28.546z";
  rc.path(p2, {
    seed: 2,
    fill: color,
    fillStyle: "solid",
  });
  ctx.restore();
}

//To remove
function drawDrop(
  x: number,
  y: number,
  ctx: CanvasRenderingContext2D,
  rc: RoughCanvas
) {
  //x15 y3
  rc.rectangle(x - 12, y, 25, 40, {
    seed: 3,
    fill: colors[0],
  });

  const p = new Path2D(
    `M${x} ${y} Q16.5 6.8 25 18 A12.8 12.8 0 1 1 5 18 Q13.5 6.8 15 3z`
  );
  ctx.fillStyle = colors[2];
  ctx.fill(p);
  ctx.stroke(p);
  rc.line(x, y + 37, 14, y + 37 + 12, {
    seed: 3,
  });
}
function drawTreeSvg(rc: RoughCanvas, ctx: CanvasRenderingContext2D) {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  drawTreeAtScale(ctx, 3, width, height, "rgb(15,150,10)", rc);
}
/*
function drawAngledLine(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  length: number,
  angle: number
) {
  const radians = (angle / 180) * Math.PI;
  const endX = x + length * Math.cos(radians);
  const endY = y - length * Math.sin(radians);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(endX, endY);
  ctx.closePath();
  ctx.stroke();
}

function drawCircle(
  x: number,
  y: number,
  r: number,
  ctx: CanvasRenderingContext2D
) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.stroke();
}
*/

function drawCircle(
  ctx: CanvasRenderingContext2D,
  sectors: string[],
  x: number,
  y: number,
  dia: number,
  rc: RoughCanvas
) {
  const PI = Math.PI;
  const TAU = 2 * PI;
  const rad = dia / 2;
  const arc = TAU / sectors.length;
  const drawSector = (color: string, i: number) => {
    const ang = arc * i;
    ctx.save();
    // COLOR
    //ctx.beginPath();
    //ctx.fillStyle = sectors[i];
    //ctx.moveTo(x, y);
    rc.arc(x, y, rad, rad, ang, ang + arc, true, {
      fill: sectors[i],
      seed: 2,
    });
    //ctx.arc(x, y, rad, ang, ang + arc);
    //ctx.lineTo(x, y);
    //ctx.fill();
    // TEXT
    ctx.translate(x, y);
    ctx.rotate(ang + arc / 2);
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.font = `bold ${50}px ${"comic sans ms"}`;
    ctx.fillText(sectors[i], y - 10, 10);
    //
    ctx.restore();
  };
  sectors.forEach((c, i) => drawSector(c, i));
}

function drawIt(
  rc: RoughCanvas,
  canvas: HTMLCanvasElement,
  elements: Element[],
  leafScale: number
) {
  const ctx = canvas.getContext("2d")!;
  //drawTreeSvg(rc, ctx);
  let radius = 2000;
  drawCircle(ctx, sectors, canvas.width / 2, canvas.height / 2, radius, rc);

  /*
  let RADIUS = 1000;
  const x = 3000;
  const y = 140;
  drawCircle(x, y, RADIUS, ctx);
  drawAngledLine(ctx, x, y, RADIUS, 1 * (360 / 4));
  drawAngledLine(ctx, x, y, RADIUS, 2 * (360 / 4));
  drawAngledLine(ctx, x, y, RADIUS, 3 * (360 / 4));
  drawAngledLine(ctx, x, y, RADIUS, 4 * (360 / 4));
 */
  ctx.fillStyle = "black";
  for (const element of elements) {
    if (element.type === "leaf") {
      drawLeaf(rc, ctx, element, leafScale);
    } else if (element.type === "category") {
      drawCategory(element, ctx);
    } else {
      drawSector(element, ctx, rc);
    }
  }
}

function drawSector(
  el: Element,
  ctx: CanvasRenderingContext2D,
  rc: RoughCanvas
) {
  rc.circle(el.x, el.y, el.width!, {
    fill: el.color,
    seed: el.seed,
    fillStyle: "solid",
  });
  ctx.font = "20px comic sans ms";
  ctx.textAlign = "center";
  printAt(ctx, el.text, el.x, el.y, 15, el.width! / 2);
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

//Todo factorise duplicated code
function updateText(
  context: CanvasRenderingContext2D,
  element: Element,
  text: string
) {
  element.text = text;
  element.font = "20px Virgil";
  const font = context.font;
  context.font = element.font;
  const { actualBoundingBoxAscent, actualBoundingBoxDescent, width } =
    context.measureText(text);
  element.actualBoundingBoxAscent = actualBoundingBoxAscent;
  context.font = font;
  const height = actualBoundingBoxAscent + actualBoundingBoxDescent;
  element.width = width;
  element.height = height;
  return element;
}

function addText(context: CanvasRenderingContext2D) {
  //TODO type it
  const element: any = {
    x: context.canvas.width / 2,
    y: context.canvas.height / 2,
    type: "category",
    id: guidGenerator(),
  };
  const text = prompt("What text do you want?");
  if (text === null) {
    return;
  }
  element.text = text;
  element.font = "20px Virgil";
  const font = context.font;
  context.font = element.font;
  const { actualBoundingBoxAscent, actualBoundingBoxDescent, width } =
    context.measureText(text);
  element.actualBoundingBoxAscent = actualBoundingBoxAscent;
  context.font = font;
  const height = actualBoundingBoxAscent + actualBoundingBoxDescent;

  // Center the text
  element.x -= width / 2;
  element.y -= actualBoundingBoxAscent;
  element.width = width;
  element.height = height;
  return element;
}

function drawCategory(category: Element, ctx: CanvasRenderingContext2D) {
  const font = ctx.font;
  ctx.font = category.font!;
  const { x, y, text } = category;
  ctx.fillText(text, x, y + category.actualBoundingBoxAscent!);
  ctx.font = font;
}

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
  elements: Element[],
  leafScale: number
  //TODO stocker en rectangle et convertir en feuille au moment du draw?
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
  drawIt(roughCanvas, canvas, elements, leafScale);
  //buildTree(ctx, roughCanvas);
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

//https://stackoverflow.com/a/4478894/14536535
function printAt(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  lineHeight: number,
  fitWidth: number,
  emoji?: string
) {
  fitWidth = fitWidth || 0;

  if (fitWidth <= 0) {
    context.fillText(text, x, y);
    return;
  }
  const font = context.font;
  context.font = `${FONT_SIZE}px Comic Sans MS`;
  context.fillStyle = "#fff";
  for (var idx = 1; idx <= text.length; idx++) {
    var str = text.substring(0, idx);
    console.log(str, context.measureText(str).width, fitWidth);
    if (context.measureText(str).width > fitWidth) {
      context.fillText(text.substring(0, idx - 1), x, y);
      printAt(
        context,
        text.substring(idx - 1),
        x,
        y + lineHeight,
        lineHeight,
        fitWidth,
        emoji
      );
      return;
    }
  }
  context.fillText(text, x, y);
  context.textAlign = "center";
  const w = context.measureText(text).width / 2;
  context.font = `${FONT_SIZE + 10}px Comic Sans MS`;
  emoji && context.fillText(emoji, x + w, y + lineHeight + 10);
  context.textAlign = "left";
  context.font = font;
  context.fillStyle = "black";
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
let INITIAL_ZOOM = 1;
export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [width, height] = useDeviceSize();
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
    leafScale: LEAF_SCALE.MEDIUM,
    elements: [
      {
        x: 110,
        y: 100,
        seed: getRandomArbitrary(1, 1000),
        color: colors[2],
        id: guidGenerator(),
        text: "Sport",
        icon: "💪",
        type: "circle",
        width: RC_WIDTH,
      },
    ],
  }));

  useKeyboard(setAppState);
  const { cameraZoom, elements, cameraOffset, isDragging, leafScale } =
    appState;
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
      elements,
      leafScale
    );
  }, [
    cameraOffsetX,
    cameraOffsetY,
    cameraZoom,
    elements,
    height,
    roughCanvas,
    width,
    leafScale,
  ]);

  function setMode(m: string) {
    setAppState((prev) => ({ ...prev, mode: m }));
  }
  const handlePointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    const { x, y } = getMousePos(canvasRef.current!, e);
    const el = elements.find((el) =>
      hitTest(x, y, el, canvasRef.current!, cameraZoom, leafScale)
    );
    if (el && appState.mode === "drag") {
      setAppState((prev) => ({
        ...prev,
        draggedElement: el,
      }));
      return;
    } else if (!el && appState.mode === "drag") {
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
    setAppState((prev) => ({
      ...prev,
      isDragging: false,
      initialPinchDistance: null,
      draggedElement: null,
    }));
    lastZoom.current = cameraZoom;
    if (isDragging) document.documentElement.style.cursor = "";
  };

  const handlePointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
    const { x, y } = getMousePos(canvasRef.current!, e);
    const target = e.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    if (appState.draggedElement) {
      const canvas = canvasRef.current!;
      const context = canvas.getContext("2d")!;
      let { x: startX, y: startY } = appState.draggedElement;
      const { x: px, y: py } = mousePosToCanvasPos(context, x, y);
      const dx = px - startX;
      const dy = py - startY;
      let dragTarget: Element;
      if (appState.draggedElement.type === "leaf") {
        //TODO moving to center is hacky, find a better way
        dragTarget = {
          ...appState.draggedElement,
          x: startX + dx + (RC_WIDTH * leafScale) / 2,
          y: startY + dy - (RC_HEIGTH * leafScale) / 2,
        };
      } else if (appState.draggedElement.type === "category") {
        dragTarget = {
          ...appState.draggedElement,
          x: startX + dx - appState.draggedElement.width! / 2,
          y: startY + dy,
        };
      } else if (appState.draggedElement.type === "circle") {
        dragTarget = {
          ...appState.draggedElement,
          x: startX + dx + appState.draggedElement.width! / 4,
          y: startY + dy,
        };
      }
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
      elements.find((el) =>
        hitTest(x, y, el, canvasRef.current!, cameraZoom, leafScale)
      )
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
    <>
      <div className="container">
        <div className="sidePanel">
          <div className="panelColumn">
            <button
              onClick={() => {
                setAppState((prev) => ({
                  ...prev,
                  elements: [
                    ...prev.elements,
                    {
                      id: guidGenerator(),
                      x: width / 2,
                      y: height / 2,
                      color: colors[0],
                      seed: getRandomArbitrary(1, 10000),
                      text: "hello world!",
                      icon: "🦍",
                      type: "leaf",
                    },
                  ],
                }));
              }}
            >
              Add Leaf
            </button>
            <button
              onClick={() => {
                const el = addText(canvasRef.current!.getContext("2d")!);
                setAppState((prev) => ({
                  ...prev,
                  elements: [...prev.elements, el],
                }));
              }}
            >
              Add category
            </button>
            <button
              onClick={() => {
                setAppState((prev) => ({
                  ...prev,
                  elements: [
                    ...prev.elements,
                    {
                      id: guidGenerator(),
                      x: width / 2,
                      y: height / 2,
                      color: colors[0],
                      seed: getRandomArbitrary(1, 10000),
                      text: "hello world!",
                      icon: "🦍",
                      type: "circle",
                      width: RC_WIDTH,
                    },
                  ],
                }));
              }}
            >
              Add circle
            </button>
            <h4>Leaf size:</h4>
            <select
              value={appState.leafScale}
              onChange={(e) =>
                setAppState((prev) => ({
                  ...prev,
                  leafScale: +e.target.value,
                }))
              }
            >
              {Object.keys(LEAF_SCALE).map((k, i) => (
                <option key={i} value={LEAF_SCALE[k]}>
                  {k}
                </option>
              ))}
            </select>
            <h4>Mode:</h4>
            <select
              value={appState.mode}
              onChange={(e) => setMode(e.target.value)}
            >
              <option value="drag">drag</option>
              <option value="select">select</option>
            </select>
          </div>
          <div>
            <h4>Circle</h4>
            <ul>
              {elements
                .filter((e) => e.type === "circle")
                .map((e) => (
                  <li key={e.id}>
                    <input
                      value={e.text}
                      onChange={(ev) => {
                        setAppState((p) => ({
                          ...p,
                          elements: p.elements.map((el) => {
                            if (el.id === e.id) {
                              return {
                                ...el,
                                text: ev.target.value,
                              };
                            }
                            return el;
                          }),
                        }));
                      }}
                    ></input>
                    <button
                      onClick={() => {
                        setAppState((p) => ({
                          ...p,
                          elements: p.elements.filter((el) => el.id !== e.id),
                        }));
                      }}
                    >
                      X
                    </button>
                    <select
                      value={e.categoryId}
                      onChange={(ev) => {
                        setAppState((p) => ({
                          ...p,
                          elements: p.elements.map((el) => {
                            if (el.id === e.id) {
                              return {
                                ...el,
                                categoryId: ev.target.value,
                              };
                            }
                            return el;
                          }),
                        }));
                      }}
                    >
                      <option value={undefined}>none</option>
                      {elements
                        .filter((ele) => ele.type === "category")
                        .map((c) => (
                          <option value={c.id} key={c.id}>
                            {c.text}
                          </option>
                        ))}
                    </select>
                  </li>
                ))}
            </ul>
            <h4>Category</h4>
            <ul>
              {elements
                .filter((e) => e.type === "category")
                .map((e) => (
                  <li key={e.id}>
                    <input
                      value={e.text}
                      onChange={(ev) => {
                        const newOne = updateText(
                          canvasRef.current!.getContext("2d")!,
                          { ...e },
                          ev.target.value
                        );
                        setAppState((p) => ({
                          ...p,
                          elements: p.elements.map((el) => {
                            if (el.id === e.id) {
                              return newOne;
                            }
                            return el;
                          }),
                        }));
                      }}
                    ></input>
                    <button
                      onClick={() => {
                        setAppState((p) => ({
                          ...p,
                          elements: p.elements.filter((el) => el.id !== e.id),
                        }));
                      }}
                    >
                      X
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        </div>
        <canvas
          onClick={(e) => {
            if (appState.mode !== "select") return;
            const { x, y } = getEventLocation(e);
            console.log({ x, y });
            for (const element of elements) {
              if (
                hitTest(
                  x,
                  y,
                  element,
                  canvasRef.current!,
                  cameraZoom,
                  leafScale
                )
              ) {
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
      </div>
      <div
        style={{
          position: "absolute",
          display: "flex",
          gap: 5,
          bottom: 10,
          left: 10,
        }}
      >
        <button onClick={(e) => adjustZoom(-0.25, null)}>-</button>
        <div>{Math.floor(cameraZoom * 100)}%</div>
        <button onClick={(e) => adjustZoom(0.25, null)}>+</button>
      </div>
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          borderRadius: 6,
          backgroundColor: "#fff",
          padding: 6,
          userSelect: "none",
        }}
      >
        {appState.elements
          .filter((el) => el.type === "category")
          .map((el) => {
            return (
              <>
                {el.text}
                <ul key={el.id}>
                  {appState.elements
                    .filter((leaf) => leaf.categoryId === el.id)
                    .map((leaf) => {
                      return (
                        <li
                          style={{
                            backgroundColor: leaf.color,
                          }}
                          key={leaf.id}
                        >
                          {leaf.text}
                        </li>
                      );
                    })}
                </ul>
              </>
            );
          })}
      </div>
    </>
  );
}
