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
import geometricMedian from "../../utils/geometric-median"
import { start } from "repl";
//TODO
//Remove magic variables (tree size for example)

const dState = '{"cameraZoom":0.47000000000000036,"scaleMultiplier":0.8,"cameraOffset":{"x":0,"y":0},"isDragging":false,"dragStart":{"x":351.43799991453756,"y":-72.44875229308384},"initialPinchDistance":null,"draggedElement":null,"mode":"drag","elements":[{"x":19.88837366790824,"y":-231.61662698941683,"seed":905.5909808585167,"color":"#82c91e","id":"f288ff26-c9c7-d869-2446-45567796dec9","text":"Loisirs","icon":"💪","type":"circle","width":100},{"id":"54d5a69c-7f47-42c1-b477-eb82f2dbd790","x":343.2757893463547,"y":-97.34192410609523,"color":"#82c91e","seed":8811.258671040496,"text":"Médicaments","icon":"🦍","type":"circle","width":100},{"id":"d0cef24f-260b-3634-5b81-0d1bdf6dc051","x":-252.33582625018533,"y":-118.10889399170287,"color":"orange","seed":3333.9280333845422,"text":"Tension artérielle","icon":"🦍","type":"circle","width":100},{"id":"b76b7ac7-d548-1e11-3246-b7e38151f374","x":158.03886622774894,"y":-82.36734524387418,"color":"orange","seed":3753.0185677539907,"text":"Alimentation","icon":"🦍","type":"circle","width":100},{"id":"b52e11be-5747-46fe-f1c5-db9afdc6a6ce","x":318.8625558670391,"y":-242.8954161755029,"color":"orange","seed":8184.468572435464,"text":"","icon":"🦍","type":"circle","width":100},{"id":"ebf93e96-2d9d-b5ed-47eb-d45485e10148","x":116.85088180699915,"y":-333.241689451942,"color":"orange","seed":7063.317967328478,"text":"","icon":"🦍","type":"circle","width":100},{"id":"5e289118-9cef-c57b-c8b9-5b88951070bd","x":-48.756039203422915,"y":-347.33372935089443,"color":"orange","seed":7912.385849210267,"text":"","icon":"🦍","type":"circle","width":100},{"id":"8c67694b-f56f-9746-2fdd-48e603deacd4","x":-385.9314475639844,"y":-101.62449096696145,"color":"orange","seed":2862.52223786426,"text":"","icon":"🦍","type":"circle","width":100},{"id":"d6b27aaf-e2fc-be7c-6bd6-4e02ab09d555","x":-246.6657493245541,"y":-271.62590912176114,"color":"orange","seed":13.836951464031252,"text":"","icon":"🦍","type":"circle","width":100},{"id":"9eb9ec83-502b-a665-6b8a-8d5c3bb5efad","x":-231.3945356430022,"y":85.96007828014206,"color":"#82c91e","seed":5190.185108611817,"text":"","icon":"🦍","type":"circle","width":100},{"id":"6473d1cb-a83f-8afb-1d8b-4006b7b731ec","x":-34.419134082964376,"y":293.16654257579813,"color":"orange","seed":8019.879358396649,"text":"","icon":"🦍","type":"circle","width":100},{"id":"80f4fc52-e7d6-a12a-ef52-23dc2911ec89","x":278.70508102866825,"y":192.29279491234036,"color":"#82c91e","seed":7571.643283927932,"text":"","icon":"🦍","type":"circle","width":100},{"id":"b74ab532-ed86-260d-3ff9-883301194104","x":-311.5368165873052,"y":228.65889469937463,"color":"#82c91e","seed":9384.01623454882,"text":"","icon":"🦍","type":"circle","width":100},{"id":"cc26bed7-e4a7-2f56-acaf-29bec2e958c0","x":371.3916461882027,"y":78.46236535515283,"color":"#82c91e","seed":5477.656705370557,"text":"","icon":"🦍","type":"circle","width":100}],"downPoint":{"x":1157.446811446349,"y":444.6808521917038}}'

type Point = {
  x: number;
  y: number
}


type Sector = { color: string, text: string, id: string }
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
  sectors: Sector[];
  radius: number
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

function drawRecursiveTree(ctx: CanvasRenderingContext2D, startX: number, startY: number, length: number, angle: number, depth: number, branchWidth: number) {
  let rand = Math.random,
    newLength, newAngle, newDepth, maxBranch = 3,
    endX, endY, maxAngle = 2 * Math.PI / 4,
    subBranches, lenShrink;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  endX = startX + length * Math.cos(angle);
  endY = startY + length * Math.sin(angle);

  ctx.lineCap = 'round';
  ctx.lineWidth = branchWidth;
  ctx.lineTo(endX, endY);


  ctx.strokeStyle = 'rgb(' + (((rand() * 64) + 64) >> 0) + ',50,25)';

  ctx.stroke();

  newDepth = depth - 1;

  if (!newDepth) {
    return;
  }

  subBranches = (rand() * (maxBranch - 1)) + 1;

  branchWidth *= 0.7;

  for (var i = 0; i < subBranches; i++) {
    newAngle = angle + rand() * maxAngle - maxAngle * 0.5;
    newLength = length * (0.7 + rand() * 0.3);
    drawRecursiveTree(ctx, endX, endY, newLength, newAngle, newDepth, branchWidth);
  }
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

function hitTest(
  x: number,
  y: number,
  element: Element,
) {
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
    const { x: newX, y: newY } = element
    const dx = x - newX;
    const dy = y - newY;
    const r = (element.width!) / 2;
    const hit = dx * dx + dy * dy < r * r;
    return hit;
  }
}

const RC_WIDTH = 100;
const FONT_SIZE = 14;

const colors = ["gray", "orange", "#82c91e"];


function drawCircle(
  ctx: CanvasRenderingContext2D,
  sectors: { color: string, text: string }[],
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
      seed: 2
    })
  }

  const drawHead = () => {
    const length = rad / 2;
    const endX = x + length * Math.cos(PI / 2);
    const endY = y - length * Math.sin(PI / 2);
    //head
    rc.circle(endX, endY, 400, {
      fill: "black",
      seed: 2,
      fillStyle: "solid"
    })

    //eyes
    rc.circle(endX - 60, endY - 120, 25, {
      fill: "#fff",
      seed: 2,
      fillStyle: "solid"
    })
    rc.circle(endX + 60, endY - 120, 25, {
      fill: "#fff",
      seed: 2,
      fillStyle: "solid"
    })

    //antennes
    const antenneX = endX + 300 * Math.cos(PI / 4);
    const antenneY = endY - 300 * Math.sin(PI / 4);
    rc.line(endX, endY, antenneX, antenneY, {
      strokeWidth: 20,
      seed: 2
    })
    const antenne2X = endX + 300 * Math.cos(3 * PI / 4);
    const antenne2Y = endY - 300 * Math.sin(3 * PI / 4);
    rc.line(endX, endY, antenne2X, antenne2Y, {
      strokeWidth: 20,
      seed: 2
    })
    rc.circle(antenne2X, antenne2Y, 35, {
      fill: "black",
      seed: 2,
      fillStyle: "solid"
    })
    rc.circle(antenneX, antenneY, 35, {
      fill: "black",
      seed: 2,
      fillStyle: "solid"
    })
  }
  drawHead();
  const drawSector = (i: number) => {
    const ang = arc * i - PI / 2;
    // COLOR
    rc.arc(x, y, rad, rad, ang, ang + arc, true, {
      fill: sectors[i].color,
      seed: 2,
      stroke: "black",
      strokeWidth: 0.2,
      fillStyle: "solid"
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
  }
  for (let i = 0; i < sectors.length; ++i) {
    drawSector(i)
  }
  //drawFlys();
  for (let i = 0; i < sectors.length; ++i) {
    drawText(i)
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
    } catch (err) { }

    try {
      ctx.textBaseline = "top";
      ctx.fillText("( 0 , 0 )", 8, 5);
    } catch (err) { }

    try {
      ctx.textBaseline = "bottom";
      ctx.fillText("(" + ctx.canvas.width + "," + ctx.canvas.height + ")", ctx.canvas.width, ctx.canvas.height);
    } catch (err) { }

  } catch (err) { }

}

function drawTronc(rc: RoughCanvas, startX: number, startY: number, endX: number, endY: number) {
  rc.line(startX, startY, endX, endY, {
    strokeWidth: 80,
    roughness: 0,
    stroke: 'rgb(' + (((Math.random() * 64) + 64) >> 0) + ',50,25)'
  })
}

function drawBranch(rc: RoughCanvas, startX: number, startY: number, endX: number, endY: number) {
  rc.line(startX, startY, endX, endY, {
    strokeWidth: 30,
    roughness: 0,
    stroke: 'rgb(' + (((Math.random() * 64) + 64) >> 0) + ',50,25)'
  })
}

const getAngle = (i: number) => i % 2 === 0 ? Math.PI / 4 : 3 * Math.PI / 4;
const getLineFromAngle = (x: number, y: number, length: number, angle: number) => ({
  endX: x + length * Math.cos(-angle),
  endY: y + length * Math.sin(-angle)
})


function drawIt(
  rc: RoughCanvas,
  canvas: HTMLCanvasElement,
  elements: Element[],
  sectors: { color: string, text: string }[],
  selectedId?: string,
) {
  const ctx = canvas.getContext("2d")!;
  //let radius = 2000;
  //drawCircle(ctx, sectors, canvas.width / 2, canvas.height / 2, radius, rc);
  //ctx.translate(canvas.width / 2, canvas.height / 2);
  const endTreeY = -800;
  const endTreeX = canvas.width / 2;
  const baseTreeX = canvas.width / 2;
  const baseTreeY = canvas.height;
  ctx.lineCap = 'round';
  const branchLength = 600;
  let PI = Math.PI;
  drawGrid(ctx);
  drawTronc(rc, baseTreeX, baseTreeY, endTreeX, endTreeY)

  //Draw Branch
  let startX = baseTreeX;
  let startY = baseTreeY - 180;
  const numberOfBranches = 5;
  let spaceBetweenBranches = (canvas.height + Math.abs(endTreeY) - 100) / numberOfBranches;
  for (let i = 0; i < numberOfBranches; ++i) {
    let { endX, endY } = getLineFromAngle(startX, startY, branchLength, getAngle(i));
    drawBranch(rc, startX, startY, endX, endY);
    startY -= spaceBetweenBranches;
  }

  //Draw Leaf
  //drawRecursiveTree(ctx, ctx.canvas.width / 2, 500, 60, -Math.PI / 2, 3, 12);
  ctx.fillStyle = "black";
  let i = 0;
  for (const element of elements) {
    if (element.type === "category") {
      drawCategory(element, ctx, rc, element.id === selectedId);
    } else {
      drawSector(element, ctx, rc, i++, element.id === selectedId);
    }
  }
  //const { x, y } = geometricMedian(elements.map(e => ({ x: e.x, y: e.y })), elements.length)
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
    rc.rectangle(el.x - el.width! / 2, el.y - el.width! / 2, el.width!, el.width!, {
      seed: 2,
      strokeLineDash: [5, 5],
      roughness: 0
    })
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

function addText(context: CanvasRenderingContext2D, text: string | null = null) {
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

function drawCategory(category: Element, ctx: CanvasRenderingContext2D, rc: RoughCanvas, isSelected: boolean) {
  const font = ctx.font;
  ctx.font = category.font!;
  const align = ctx.textAlign;
  ctx.textAlign = "left"
  const { x, y, text } = category;
  ctx.fillText(text, x, y + category.actualBoundingBoxAscent!);
  if (isSelected) {
    rc.rectangle(x, y, ctx.measureText(text).width, category.actualBoundingBoxAscent!, {
      seed: 2,
      strokeLineDash: [5, 5],
      roughness: 0
    })
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
  sectors: { color: string, text: string }[],
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
  drawIt(roughCanvas, canvas, elements, sectors, selectedId);
  //buildTree(ctx, roughCanvas);
}

function mousePosToCanvasPos(
  context: CanvasRenderingContext2D,
  e: any
) {
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
  context.fillStyle = "black"
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

  context.font = "20px solid comic sans ms"
  emoji && context.fillText(emoji, x, y + lineHeight + 10);
}

const emojis = ["🥳", "💊", "🩺", "🍽️"]
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
  const [appState, setAppState] = useState<AppState>(
    {
      selectedElement: null,
      radius: 1000,
      sectors: [{
        color: "#f15275",
        text: "Mes reins fatiguent",
        id: guidGenerator()
      }, {
        color: "#f15275",
        text: "Ma vie sociale",
        id: guidGenerator()
      }, {
        color: "#f15275",
        text: "Parcours de soins",
        id: guidGenerator()
      }, {
        color: "#f15275",
        text: "Mes ressources",
        id: guidGenerator()
      }, {
        color: "#f15275",
        text: "Mon quotidien",
        id: guidGenerator()
      }, {
        color: "#f15275",
        text: "Mes racines",
        id: guidGenerator()
      },
      ],
      cameraZoom: INITIAL_ZOOM,
      scaleMultiplier: 0.8,
      cameraOffset: { "x": 0, "y": 0 },
      isDragging: false,
      dragStart: { "x": 0, "y": 0 },
      initialPinchDistance: null,
      draggedElement: null,
      elements: [],
      downPoint: { "x": 1157.446811446349, "y": 444.6808521917038 }
    });

  useKeyboard(setAppState);
  const { cameraZoom, elements, cameraOffset, isDragging, sectors, selectedElement } =
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
      sectors,
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
    sectors
  ]);

  const handlePointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = mousePosToCanvasPos(ctx, e);

    const el = elements.find((el) =>
      hitTest(x, y, el)
    );
    if (el) {
      setAppState((prev) => ({
        ...prev,
        draggedElement: el,
        downPoint: { x, y },
        selectedElement: el
      }));
      return;
    } else {
      setAppState((prev) => ({
        ...prev,
        isDragging: true,
        selectedElement: null,
        dragStart: {
          x: getMousePos(canvasRef.current!, e)!.x / prev.cameraZoom - prev.cameraOffset.x,
          y: getMousePos(canvasRef.current!, e)!.y / prev.cameraZoom - prev.cameraOffset.y,
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
    const ctx = canvasRef.current!.getContext("2d")!
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
      document.documentElement.style.cursor = "move"
      return;
    }
    if (
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
          x: getMousePos(canvasRef.current!, e)!.x / prev.cameraZoom - prev.dragStart.x,
          y: getMousePos(canvasRef.current!, e)!.y / prev.cameraZoom - prev.dragStart.y,
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
        <div className="sidePanel" style={{ display: hide ? "none" : "" }}>
          <div className="panelColumn"
          >
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
                      x: 0,
                      y: 0,
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
            <ul>
              {sectors.map(s => <li key={s.id}>
                <input value={s.text} onChange={(e) => {
                  setAppState(prev => ({
                    ...prev,
                    sectors: prev.sectors.map(sec => {
                      if (s.id === sec.id) {
                        return { ...sec, text: e.target.value }
                      }
                      return sec
                    })
                  }))
                }}></input>
                <button onClick={() => setAppState(prev => ({
                  ...prev,
                  sectors: prev.sectors.filter(sec => sec.id !== s.id)
                }))}>X</button>
              </li>)}
            </ul>
            <button onClick={() => setAppState(prev => ({
              ...prev,
              sectors: [...prev.sectors, { id: guidGenerator(), color: "#f15275", text: "new sector" }]
            }))}>Add sector</button>
            {selectedElement && <>
              {selectedElement.type !== "category" && <input
                onChange={(e) => {
                  setAppState(prev => ({
                    ...prev,
                    elements: prev.elements.map(el => {
                      if (el.id === selectedElement.id) {
                        return {
                          ...el,
                          width: +e.target.value
                        }
                      }
                      return el;
                    })
                  }))
                }}
                type="range" min={50} max={300} value={elements.find(el => el.id === selectedElement.id)?.width!}></input>}
              <input
                onChange={(e) => {
                  setAppState(prev => ({
                    ...prev,
                    elements: prev.elements.map(el => {
                      if (el.id === selectedElement.id) {
                        if (el.type === "circle")
                          return {
                            ...el,
                            text: e.target.value,
                          }
                        return {
                          ...addText(canvasRef.current!.getContext("2d")!, e.target.value ?? ""),
                          x: el.x,
                          y: el.y,
                          id: el.id
                        }
                      }
                      return el;
                    })
                  }))
                }}
                value={elements.find(el => el.id === selectedElement.id)?.text!}></input>
            </>}
          </div>
        </div>
        <canvas
          onClick={(e) => {
            e.preventDefault();
            const ctx = canvasRef.current!.getContext("2d")!;
            const { x, y } = mousePosToCanvasPos(ctx, e);
            ctx.fillText(`${Math.floor(x)}-${Math.floor(y)}`, x, y);
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
        <input type="checkbox"
          onChange={() => setHide(prev => !prev)}
          checked={hide}></input>
      </div>
    </>
  );
}


