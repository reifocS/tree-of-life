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
import geometricMedian from "../../utils/geometric-median";
//TODO
//Remove magic variables (tree size for example)

const dState =
  '{"cameraZoom":0.6724999999999998,"scaleMultiplier":0.8,"cameraOffset":{"x":49.070631970260365,"y":65.42750929368049},"isDragging":false,"dragStart":{"x":773.2342007434946,"y":257.2490706319702},"initialPinchDistance":null,"draggedElement":null,"mode":"drag","elements":[{"x":130.0920567083955,"y":326.416963296342,"seed":905.5909808585167,"color":"gray","id":"f288ff26-c9c7-d869-2446-45567796dec9","text":"Loisirs","icon":"💪","type":"circle","width":100},{"id":"54d5a69c-7f47-42c1-b477-eb82f2dbd790","x":-282.92198368663117,"y":-277.2611102380772,"color":"gray","seed":8811.258671040496,"text":"Médicaments","icon":"🦍","type":"circle","width":100},{"id":"d0cef24f-260b-3634-5b81-0d1bdf6dc051","x":-386.78546434188405,"y":-139.79858222294973,"color":"gray","seed":3333.9280333845422,"text":"Tension artérielle","icon":"🦍","type":"circle","width":107},{"id":"b76b7ac7-d548-1e11-3246-b7e38151f374","x":-116.38395443260458,"y":-376.1727983861964,"color":"gray","seed":3753.0185677539907,"text":"Alimentation","icon":"🦍","type":"circle","width":100},{"id":"b52e11be-5747-46fe-f1c5-db9afdc6a6ce","x":202.2963656407178,"y":-377.163085239841,"color":"gray","seed":8184.468572435464,"text":"Hémodialyse","icon":"🦍","type":"circle","width":100},{"id":"ebf93e96-2d9d-b5ed-47eb-d45485e10148","x":-204.92540517934026,"y":83.00390881595985,"color":"gray","seed":7063.317967328478,"text":"Association de patients","icon":"🦍","type":"circle","width":100},{"id":"5e289118-9cef-c57b-c8b9-5b88951070bd","x":330.82021269458187,"y":-102.9264923866105,"color":"gray","seed":7912.385849210267,"text":"      Dialyse        péritonéale","icon":"🦍","type":"circle","width":115},{"id":"8c67694b-f56f-9746-2fdd-48e603deacd4","x":-60.457918331970745,"y":269.6776286078461,"color":"gray","seed":2862.52223786426,"text":"Mes bilans biologiques","icon":"🦍","type":"circle","width":81},{"id":"d6b27aaf-e2fc-be7c-6bd6-4e02ab09d555","x":71.70159141792033,"y":-343.0225615367076,"color":"gray","seed":13.836951464031252,"text":"Greffe","icon":"🦍","type":"circle","width":100},{"id":"9eb9ec83-502b-a665-6b8a-8d5c3bb5efad","x":-73.33875109297173,"y":96.68764050405514,"color":"gray","seed":5190.185108611817,"text":"Nephrologue","icon":"🦍","type":"circle","width":92},{"id":"6473d1cb-a83f-8afb-1d8b-4006b7b731ec","x":-333.50619705501634,"y":251.63201157361271,"color":"gray","seed":8019.879358396649,"text":"Assistance sociale","icon":"🦍","type":"circle","width":78},{"id":"80f4fc52-e7d6-a12a-ef52-23dc2911ec89","x":-322.1496722623885,"y":96.14479174978362,"color":"gray","seed":7571.643283927932,"text":"Psychologue","icon":"🦍","type":"circle","width":84},{"id":"b74ab532-ed86-260d-3ff9-883301194104","x":-224.46198835004725,"y":348.11467468736305,"color":"gray","seed":9384.01623454882,"text":"Infirmière","icon":"🦍","type":"circle","width":79},{"id":"cc26bed7-e4a7-2f56-acaf-29bec2e958c0","x":-90.71686730894919,"y":368.3634598707243,"color":"gray","seed":5477.656705370557,"text":"Diététicien","icon":"🦍","type":"circle","width":77},{"id":"4d61db21-0100-a6e8-e83d-0d053771fac1","x":111.00928270573922,"y":-109.45189219878341,"color":"gray","seed":2836.372266861128,"text":"Traitement conservateur","icon":"🦍","type":"circle","width":103},{"id":"907b0d89-c899-ab10-6caf-890355257271","x":82.54996989195001,"y":79.60380368579592,"color":"gray","seed":402.62620782331464,"text":"Famille","icon":"🦍","type":"circle","width":100},{"id":"ce6cf0cc-998c-a9ff-01b9-3ce235f128fa","x":-55.57799792105425,"y":-134.56504038360237,"color":"gray","seed":349.3457945172847,"text":"Poids","icon":"🦍","type":"circle","width":79},{"id":"2baec197-b0fd-f044-1dfd-42af068570ea","x":-149.46753470664459,"y":-84.34467572668802,"color":"gray","seed":2611.8314652490776,"text":"     Activités       physiques","icon":"🦍","type":"circle","width":100},{"id":"87d9c714-446c-e67b-7982-2907392be991","x":-270.9841213896587,"y":-63.706625207747265,"color":"gray","seed":1368.4464593355342,"text":"Projets","icon":"🦍","type":"circle","width":100},{"id":"7f747ab4-e433-7e3c-599b-d962533c01c2","x":-76.50376225745276,"y":-272.26929053493905,"color":"gray","seed":369.4883636863547,"text":"Finances","icon":"🦍","type":"circle","width":100},{"id":"6e7b4d11-596c-7451-288e-0aad71e23196","x":250.12096648510487,"y":287.34678995719787,"color":"gray","seed":5741.48069461333,"text":"Amis","icon":"🦍","type":"circle","width":100},{"id":"4f2dba83-534b-2f26-828c-caf483c5653d","x":238.26980800129706,"y":63.953020967239354,"color":"gray","seed":4687.550367845117,"text":"Couple","icon":"🦍","type":"circle","width":100},{"id":"da689737-a6bb-3aac-7a0b-a507bee8b025","x":419.89599084190706,"y":138.9266196979562,"color":"gray","seed":2181.4133635842786,"text":"Travail","icon":"🦍","type":"circle","width":100},{"id":"bf6c5fcd-bbb7-a1dd-c092-826cdd0a76ac","x":321.4100680016044,"y":158.10987666234467,"color":"gray","seed":4955.312079405698,"text":"Sexualité","icon":"🦍","type":"circle","width":100}],"downPoint":{"x":-121.1895942700113,"y":-337.5464576812604},"selectedElement":null}';
type Point = {
  x: number;
  y: number;
};

export type AppState = {
  cameraZoom: number;
  scaleMultiplier: number;
  cameraOffset: Point;
  isDragging: boolean;
  dragStart: Point;
  initialPinchDistance: null | number;
  elements: Element[];
  draggedElement: Element | null;
  downPoint?: Point;
  selectedElement: Element | null;
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

function hitTest(x: number, y: number, element: Element) {
  // Destructure to get the x and y values out of the transformed DOMPoint.
  //TODO Change mouse coord to canvas coord instead of the opposite
  if (element.type === "category") {
    const { x: newX, y: newY } = element;
    return (
      x >= newX &&
      x <= newX + element.width! &&
      y >= newY &&
      y <= newY + element.height!
    );
  } else if (element.type === "circle") {
    const { x: newX, y: newY } = element;
    const dx = x - newX;
    const dy = y - newY;
    const r = element.width! / 2;
    const hit = dx * dx + dy * dy < r * r;
    return hit;
  }
}

const RC_WIDTH = 100;
const FONT_SIZE = 14;

const colors = ["gray", "orange", "#82c91e"];

const sectors = [
  {
    color: "#f15275",
    text: "Mes reins fatiguent",
  },
  {
    color: "#f15275",
    text: "Ma vie sociale",
  },
  {
    color: "#f15275",
    text: "Parcours de soins",
  },
  {
    color: "#f15275",
    text: "Mon quotidien",
  },
];

function drawCircle(
  ctx: CanvasRenderingContext2D,
  sectors: { color: string; text: string }[],
  x: number,
  y: number,
  dia: number,
  rc: RoughCanvas
) {
  const PI = Math.PI;
  const TAU = 2 * PI;
  const rad = dia / 2;
  const arc = TAU / sectors.length;

  const drawFlys = () => {
    rc.arc(x, y, rad, rad, PI / 2 - arc / 10, PI / 2 + arc / 10, true, {
      fill: "black",
      fillStyle: "solid",
      seed: 2,
    });
  };

  const drawHead = () => {
    const length = rad / 2;
    const endX = x + length * Math.cos(PI / 2);
    const endY = y - length * Math.sin(PI / 2);
    //head
    rc.circle(endX, endY, 400, {
      fill: "black",
      seed: 2,
      fillStyle: "solid",
    });

    //eyes
    rc.circle(endX - 60, endY - 120, 25, {
      fill: "#fff",
      seed: 2,
      fillStyle: "solid",
    });
    rc.circle(endX + 60, endY - 120, 25, {
      fill: "#fff",
      seed: 2,
      fillStyle: "solid",
    });

    //antennes
    const antenneX = endX + 300 * Math.cos(PI / 4);
    const antenneY = endY - 300 * Math.sin(PI / 4);
    rc.line(endX, endY, antenneX, antenneY, {
      strokeWidth: 20,
      seed: 2,
    });
    const antenne2X = endX + 300 * Math.cos((3 * PI) / 4);
    const antenne2Y = endY - 300 * Math.sin((3 * PI) / 4);
    rc.line(endX, endY, antenne2X, antenne2Y, {
      strokeWidth: 20,
      seed: 2,
    });
    rc.circle(antenne2X, antenne2Y, 35, {
      fill: "black",
      seed: 2,
      fillStyle: "solid",
    });
    rc.circle(antenneX, antenneY, 35, {
      fill: "black",
      seed: 2,
      fillStyle: "solid",
    });
  };
  drawHead();
  const drawSector = (i: number) => {
    const ang = arc * i - PI / 2;
    // COLOR
    rc.arc(x, y, rad, rad, ang, ang + arc, true, {
      fill: sectors[i].color,
      seed: 2,
      stroke: "black",
      strokeWidth: 0.2,
      fillStyle: "solid",
    });
  };

  const drawText = (i: number) => {
    const ang = arc * i - PI / 2;
    const length = rad / 4;
    const endX = x + length * Math.cos(-(ang + arc / 2));
    const endY = y - length * Math.sin(-(ang + arc / 2));
    const font = ctx.font;
    ctx.font = `bold ${25}px ${"comic sans ms"}`;
    printAt(ctx, sectors[i].text, endX, endY, 40, 300);
    ctx.font = font;
  };
  for (let i = 0; i < sectors.length; ++i) {
    drawSector(i);
  }
  //drawFlys();
  for (let i = 0; i < sectors.length; ++i) {
    drawText(i);
  }
}

function drawGrid(ctx: CanvasRenderingContext2D) {
  try {
    /* vertical lines */
    for (var x = 0.5; x < ctx.canvas.width; x += 10) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, ctx.canvas.height);
    }

    /* horizontal lines */
    for (var y = 0.5; y < ctx.canvas.height; y += 10) {
      ctx.moveTo(0, y);
      ctx.lineTo(ctx.canvas.width, y);
    }

    /* draw it! */
    ctx.strokeStyle = "#eee";
    ctx.stroke();

    //arrows
    /* x-axis */
    ctx.beginPath();
    ctx.moveTo(0, 40);
    ctx.lineTo(240, 40);
    ctx.moveTo(260, 40);
    ctx.lineTo(500, 40);
    ctx.lineTo(ctx.canvas.width, 40);

    /* y-axis */
    ctx.moveTo(60, 0);
    ctx.lineTo(60, 153);
    ctx.moveTo(60, 173);
    ctx.lineTo(60, 375);
    ctx.lineTo(60, ctx.canvas.height);

    /* draw it! */
    ctx.strokeStyle = "#000";
    ctx.stroke();

    //labels
    try {
      ctx.font = "bold 12px sans-serif";
      ctx.fillText("x", 248, 43);
      ctx.fillText("y", 58, 165);
    } catch (err) {}

    try {
      ctx.textBaseline = "top";
      ctx.fillText("( 0 , 0 )", 8, 5);
    } catch (err) {}

    try {
      ctx.textBaseline = "bottom";
      ctx.fillText(
        "(" + ctx.canvas.width + "," + ctx.canvas.height + ")",
        ctx.canvas.width,
        ctx.canvas.height
      );
    } catch (err) {}
  } catch (err) {}
}

function drawIt(
  rc: RoughCanvas,
  canvas: HTMLCanvasElement,
  elements: Element[],
  selectedId?: string
) {
  const ctx = canvas.getContext("2d")!;
  let radius = 2000;
  drawCircle(ctx, sectors, canvas.width / 2, canvas.height / 2, radius, rc);
  ctx.translate(canvas.width / 2, canvas.height / 2);
  //drawGrid(ctx);

  ctx.fillStyle = "black";
  let i = 0;
  for (const element of elements) {
    if (element.type === "category") {
      drawCategory(element, ctx, rc, element.id === selectedId);
    } else {
      drawSector(element, ctx, rc, i++, element.id === selectedId);
    }
  }

  const { x, y } = geometricMedian(
    elements.map((e) => ({ x: e.x, y: e.y })),
    elements.length
  );
  /*rc.circle(x, y, 20, {
    fill: "green",
    fillStyle: "solid",
    seed: 2
  })*/
}

function drawSector(
  el: Element,
  ctx: CanvasRenderingContext2D,
  rc: RoughCanvas,
  i: number,
  isSelected = false
) {
  rc.circle(el.x, el.y, el.width!, {
    fill: el.color,
    seed: el.seed,
    fillStyle: "solid",
  });
  ctx.font = "13px comic sans ms";
  if (isSelected) {
    rc.rectangle(
      el.x - el.width! / 2,
      el.y - el.width! / 2,
      el.width!,
      el.width!,
      {
        seed: 2,
        strokeLineDash: [5, 5],
        roughness: 0,
      }
    );
  }
  printAt(ctx, el.text, el.x, el.y, 15, el.width! - 15, emojis[i]);
  //ctx.font = "20px comic sans ms";

  //ctx.fillText(`${Math.floor(el.x)}-${Math.floor(el.y)}`, el.x, el.y)
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

function addText(
  context: CanvasRenderingContext2D,
  text: string | null = null
) {
  //TODO type it
  const element: any = {
    x: 0,
    y: 0,
    type: "category",
    id: guidGenerator(),
  };
  if (text === null) {
    text = prompt("What text do you want?");
    if (text === null) {
      return;
    }
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

function drawCategory(
  category: Element,
  ctx: CanvasRenderingContext2D,
  rc: RoughCanvas,
  isSelected: boolean
) {
  const font = ctx.font;
  ctx.font = category.font!;
  const align = ctx.textAlign;
  ctx.textAlign = "left";
  const { x, y, text } = category;
  ctx.fillText(text, x, y + category.actualBoundingBoxAscent!);
  if (isSelected) {
    rc.rectangle(
      x,
      y,
      ctx.measureText(text).width,
      category.actualBoundingBoxAscent!,
      {
        seed: 2,
        strokeLineDash: [5, 5],
        roughness: 0,
      }
    );
  }
  ctx.font = font;
  ctx.textAlign = align;
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
  selectedId?: string
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
  drawIt(roughCanvas, canvas, elements, selectedId);
  //buildTree(ctx, roughCanvas);
}

function mousePosToCanvasPos(context: CanvasRenderingContext2D, e: any) {
  const x = getMousePos(context.canvas, e)!.x;
  const y = getMousePos(context.canvas, e)!.y;
  const matrix = context.getTransform();
  const imatrix = matrix.invertSelf(); // invert

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
  const fillStyle = context.fillStyle;
  context.textAlign = "center";
  context.fillStyle = "black";
  fitWidth = fitWidth || 0;

  if (fitWidth <= 0) {
    context.fillText(text, x, y);
    context.fillStyle = fillStyle;
    return;
  }
  for (var idx = 1; idx <= text.length; idx++) {
    var str = text.substring(0, idx);
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
      context.fillStyle = fillStyle;
      return;
    }
  }
  context.fillText(text, x, y);
  context.fillStyle = fillStyle;

  context.font = "20px solid comic sans ms";
  emoji && context.fillText(emoji, x, y + lineHeight + 10);
}

const emojis = ["🥳", "💊", "🩺", "🍽️"];
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
  const [width, height, devicePixelRatio] = useDeviceSize();
  const [hide, setHide] = useState(true);
  const [roughCanvas, setRoughCanvas] = useState<RoughCanvas | null>(null);
  const [appState, setAppState] = useState<AppState>(() => JSON.parse(dState));

  console.log(appState);

  useKeyboard(setAppState);
  const {
    cameraZoom,
    elements,
    cameraOffset,
    isDragging,
    draggedElement,
    selectedElement,
  } = appState;
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
      selectedElement?.id
    );
  }, [
    cameraOffsetX,
    cameraOffsetY,
    cameraZoom,
    elements,
    height,
    roughCanvas,
    width,
    selectedElement,
  ]);

  const handlePointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = mousePosToCanvasPos(ctx, e);

    const el = elements.find((el) => hitTest(x, y, el));
    if (el && !hide) {
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

      document.documentElement.style.cursor = "grabbing";
    }
  };

  const handlePointerUp = (e: PointerEvent<HTMLCanvasElement>) => {
    //const { x, y } = getMousePos(canvasRef.current!, e);
    e.preventDefault();
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
    if (elements.find((el) => hitTest(x, y, el))) {
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
    console.log(appState);
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
        <div className="sidePanel" style={{ display: hide ? "none" : "" }}>
          <div className="panelColumn">
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
            <pre>{JSON.stringify(selectedElement, null, 2)}</pre>
            {selectedElement && (
              <>
                {selectedElement.type !== "category" && (
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
                    min={50}
                    max={300}
                    value={
                      elements.find((el) => el.id === selectedElement.id)
                        ?.width!
                    }
                  ></input>
                )}
                <input
                  onChange={(e) => {
                    setAppState((prev) => ({
                      ...prev,
                      elements: prev.elements.map((el) => {
                        if (el.id === selectedElement.id) {
                          if (el.type === "circle")
                            return {
                              ...el,
                              text: e.target.value,
                            };
                          return {
                            ...addText(
                              canvasRef.current!.getContext("2d")!,
                              e.target.value ?? ""
                            ),
                            x: el.x,
                            y: el.y,
                            id: el.id,
                          };
                        }
                        return el;
                      }),
                    }));
                  }}
                  value={
                    elements.find((el) => el.id === selectedElement.id)?.text!
                  }
                ></input>
              </>
            )}
          </div>
        </div>
        <canvas
          onClick={(e) => {
            e.preventDefault();
            const ctx = canvasRef.current!.getContext("2d")!;
            const { x, y } = mousePosToCanvasPos(ctx, e);
            for (const element of elements) {
              if (hitTest(x, y, element)) {
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
          onMouseUp={handlePointerUp}
          onMouseMove={handlePointerMove}
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
        <button onClick={() => adjustZoom(-0.25, null)}>-</button>
        <div>{Math.floor(cameraZoom * 100)}%</div>
        <button onClick={() => adjustZoom(0.25, null)}>+</button>
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
        <input
          type="checkbox"
          onChange={() => setHide((prev) => !prev)}
          checked={hide}
        ></input>
      </div>
    </>
  );
}
