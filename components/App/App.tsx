import {
  PointerEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import rough from "roughjs/bin/rough";
import { RoughCanvas } from "roughjs/bin/canvas";
import useKeyboard from "../../hooks/useKeyboard";

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
  radius: number;
  mode: 'edit' | 'view';
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
  angle?: number
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

export function rotate(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  angle: number,
) {
  // 𝑎′𝑥=(𝑎𝑥−𝑐𝑥)cos𝜃−(𝑎𝑦−𝑐𝑦)sin𝜃+𝑐𝑥
  // 𝑎′𝑦=(𝑎𝑥−𝑐𝑥)sin𝜃+(𝑎𝑦−𝑐𝑦)cos𝜃+𝑐𝑦.
  // https://math.stackexchange.com/questions/2204520/how-do-i-rotate-a-line-segment-in-a-specific-point-on-the-line
  return [
    (x1 - x2) * Math.cos(angle) - (y1 - y2) * Math.sin(angle) + x2,
    (x1 - x2) * Math.sin(angle) + (y1 - y2) * Math.cos(angle) + y2,
  ];
}

function hitTest(
  x: number,
  y: number,
  element: Element,
  ctx: CanvasRenderingContext2D
) {
  if (element.type === "circle") {
    const { x: newX, y: newY } = element
    const dx = x - newX;
    const dy = y - newY;
    const r = (element.width!) / 2;
    const hit = dx * dx + dy * dy < r * r;
    return hit;
  } else if (element.type === "leaf") {
    let { x: x1, y: y1, angle = 0 } = element;
    let x2 = x1 + element.width!;
    let y2 = y1 + element.height!;
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2;
    // reverse rotate the pointer
    [x, y] = rotate(x, y, cx, cy, -angle);
    return (
      x > x1 &&
      x < x2 &&
      y > y1 &&
      y < y2
    );
  } else {
    let { x: x1, y: y1, angle = 0 } = element;
    let x2 = x1 + element.width!;
    let y2 = y1 + element.height!;
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2;
    // reverse rotate the pointer
    [x, y] = rotate(x, y, cx, cy, -angle);
    return (
      x > x1 &&
      x < x2 &&
      y > y1 &&
      y < y2
    );
  }
}

const RC_WIDTH = 100;
const LEAF_WIDTH = 60;
const LEAF_HEIGHT = 80;
const colors = ["gray", "orange", "green"];

function drawGrid(ctx: CanvasRenderingContext2D) {
  try {
    const textBaseline = ctx.textBaseline;
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

    ctx.textBaseline = textBaseline;

  } catch (err) { }

}

function drawImage(rc: RoughCanvas, ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, selected: boolean, rotation: number, width: number, height: number) {
  ctx.save();
  ctx.translate(x + width / 2, y + height / 2); // sets scale and origin
  ctx.rotate(rotation);
  ctx.drawImage(image, -width / 2, -height / 2, width, height);
  if (selected) {
    rc.rectangle(-width / 2, -height / 2, width, height, {
      seed: 2,
      strokeLineDash: [5, 5],
      roughness: 0
    })
  }
  ctx.restore();
}
function drawLeaf(rc: RoughCanvas, ctx: CanvasRenderingContext2D, x: number, y: number, text: string, color: string, width: number, height: number, image: HTMLImageElement, isSelected: boolean, angle = 0) {
  drawImage(rc, ctx, image, x, y, isSelected, angle, width, height)
  printAtWordWrap(ctx, text, x + width / 2, y + height / 2, 15, width - 15);
}


function drawTronc(rc: RoughCanvas, startX: number, startY: number, endX: number, endY: number) {
  rc.line(startX, startY, endX, endY, {
    strokeWidth: 50,
    roughness: 5,
    seed: 2,
    stroke: 'rgb(90,50,25)'
  })
}

function getMid(startX: number, startY: number, endX: number, endY: number) {
  let midX = startX + (endX - startX) * 0.50;
  let midY = startY + (endY - startY) * 0.50;
  return [midX, midY];
}

const branchColors = Array(10).fill(0).map(_ => 'rgb(' + (((Math.random() * 64) + 64) >> 0) + ',50,25)');

function drawBranch(rc: RoughCanvas, startX: number, startY: number, endX: number, endY: number, i: number) {
  const stroke = branchColors[i];

  rc.line(startX, startY, endX, endY, {
    strokeWidth: 25,
    roughness: 5,
    seed: 2,
    stroke
  });
  let [midX, midY] = getMid(startX, startY, endX, endY);
  let [qX, qY] = getMid(startX, startY, midX, midY);

  /*rc.curve([[startX, startY], [qX + 20, qY + 20], [midX, midY]], {
    seed: 2,
    strokeWidth: 20,
    stroke
  })*/

}
//TODO Add some random here
const getAngle = (i: number) => i % 2 === 0 ? Math.PI / 6 : 5 * Math.PI / 6;
const getLineFromAngle = (x: number, y: number, length: number, angle: number) => ({
  endX: x + length * Math.cos(-angle),
  endY: y + length * Math.sin(-angle)
})


function drawIt(
  rc: RoughCanvas,
  canvas: HTMLCanvasElement,
  elements: Element[],
  images: { color: string, image: HTMLImageElement }[],
  sectors: { color: string, text: string }[],
  selectedId?: string,
  mode?: string
) {
  const ctx = canvas.getContext("2d")!;
  const numberOfBranches = 6;
  const endTreeY = 100 - (30 * numberOfBranches);
  const endTreeX = 0;
  const baseTreeX = 0;
  const baseTreeY = canvas.height;
  ctx.lineCap = 'round';
  const branchLength = 300;
  ctx.translate(canvas.width / 2, canvas.height / 2);

  if (mode === "edit") drawGrid(ctx);
  drawTronc(rc, baseTreeX, baseTreeY, endTreeX, endTreeY)



  //Draw Branch
  let startX = baseTreeX;
  let startY = baseTreeY - 100;
  let spaceBetweenBranches = (canvas.height + Math.abs(endTreeY) - 100) / numberOfBranches;
  for (let i = 0; i < numberOfBranches; ++i) {
    let { endX, endY } = getLineFromAngle(startX, startY, branchLength, getAngle(i));
    drawBranch(rc, startX, startY, endX, endY, i);
    startY -= spaceBetweenBranches;
  }

  ctx.fillStyle = "black";
  let i = 0;
  for (const element of elements) {
    if (element.type === "category") {
      drawCategory(element, ctx, rc, element.id === selectedId, element.angle);
    } else if (element.type === "circle") {
      drawSector(element, ctx, rc, i++, element.id === selectedId);
    } else {
      drawLeaf(rc, ctx, element.x, element.y, element.text, element.color, element.width!, element.height!, images.find(c => c.color === element.color)!.image, element.id === selectedId, element.angle)
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
  if (isSelected) {
    rc.rectangle(el.x - el.width! / 2, el.y - el.width! / 2, el.width!, el.width!, {
      seed: 2,
      strokeLineDash: [5, 5],
      roughness: 0
    })
  }
  printAtWordWrap(ctx, el.text, el.x, el.y, 15, el.width! - 15);
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


function addText(context: CanvasRenderingContext2D) {
  //TODO type it
  const element: any = {
    x: 0,
    y: 0,
    type: "category",
    id: guidGenerator(),
  };
  let text = prompt("What text do you want?");
  if (text === null) {
    return;
  }

  element.text = text;
  element.font = element.font || "20px Virgil";
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

function updateText(context: CanvasRenderingContext2D, text: string, elem: Element, font?: string) {
  const element: Element = {
    ...elem,
    text,
    font: font || elem.font
  };
  const ctxFont = context.font;
  context.font = element.font || "20px virgil";
  const lines = text.split('\n');
  if (lines.length === 1) {
    const { actualBoundingBoxAscent, actualBoundingBoxDescent, width } =
      context.measureText(text);
    element.actualBoundingBoxAscent = actualBoundingBoxAscent;
    const height = actualBoundingBoxAscent + actualBoundingBoxDescent;
    element.width = width;
    element.height = height;
    context.font = ctxFont;
    return element;
  } else {
    let maxWidth = 0;
    let height = -SPACE_BETWEEN_LINES;
    for (let i = 0; i < lines.length; ++i) {
      let currentText = lines[i];
      let { actualBoundingBoxAscent, actualBoundingBoxDescent, width } =
        context.measureText(currentText);

      if (width > maxWidth) {
        maxWidth = width;
      }
      height += actualBoundingBoxAscent + SPACE_BETWEEN_LINES + actualBoundingBoxDescent;
    }
    context.font = ctxFont;
    element.width = maxWidth;
    element.height = height;
    return element;
  }

}

const SPACE_BETWEEN_LINES = 3;
function drawCategory(category: Element, ctx: CanvasRenderingContext2D, rc: RoughCanvas, isSelected: boolean, angle = 0) {
  const font = ctx.font;
  ctx.font = category.font!;
  const align = ctx.textAlign;
  ctx.textAlign = "left"
  const baseLine = ctx.textBaseline;
  ctx.textBaseline = "top"
  const { x, y, text, width = 0, height = 0 } = category;
  ctx.save();
  ctx.translate(x + width / 2, y + height! / 2); // sets scale and origin
  ctx.rotate(angle);
  let lines = text.split('\n');
  let lineheight = height / lines.length;

  for (let i = 0; i < lines.length; i++)
    ctx.fillText(lines[i], -width / 2, -height / 2 + (i * lineheight));
  if (isSelected) {
    rc.rectangle((-width) / 2, -height / 2, width, height, {
      seed: 2,
      strokeLineDash: [5, 5],
      roughness: 0
    })
  }
  ctx.restore();
  ctx.font = font;
  ctx.textAlign = align;
  ctx.textBaseline = baseLine;
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
  images: { color: string, image: HTMLImageElement }[],
  selectedId?: string,
  mode?: string
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
  drawIt(roughCanvas, canvas, elements, images, sectors, selectedId, mode);
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
function printAtWordWrap(context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  lineHeight: number,
  fitWidth: number,) {
  const fillStyle = context.fillStyle;
  context.textAlign = "center";
  context.fillStyle = "black"
  context.font = "15px comic sans ms"
  fitWidth = fitWidth || 0;

  if (fitWidth <= 0) {
    context.fillText(text, x, y);
    context.fillStyle = fillStyle;
    return;
  }
  let words = text.split(' ');
  let currentLine = 0;
  let idx = 1;
  while (words.length > 0 && idx <= words.length) {
    let str = words.slice(0, idx).join(' ');
    let w = context.measureText(str).width;
    if (w > fitWidth) {
      if (idx == 1) {
        idx = 2;
      }
      context.fillText(words.slice(0, idx - 1).join(' '), x, y + (lineHeight * currentLine));
      currentLine++;
      words = words.splice(idx - 1);
      idx = 1;
    }
    else { idx++; }
  }
  if (idx > 0)
    context.fillText(words.join(' '), x, y + (lineHeight * currentLine));
  context.fillStyle = fillStyle;

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
  const [width, height, devicePixelRatio] = useDeviceSize();
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
      mode: "edit",
      cameraZoom: INITIAL_ZOOM,
      scaleMultiplier: 0.8,
      cameraOffset: { "x": 0, "y": 0 },
      isDragging: false,
      dragStart: { "x": 0, "y": 0 },
      initialPinchDistance: null,
      draggedElement: null,
      elements: [
        { "x": -163.0099639892578, "y": -134.90625, "type": "category", "id": "bd61106d-78f9-5981-09cd-645b1c4bd40f", "text": "category", "font": "20px Virgil", "actualBoundingBoxAscent": 16.90625, "width": 84.01992797851562, "height": 20, "color": "green", "angle": 0.86, seed: 2, icon: "" },
        { "id": "b72ece49-3009-c842-8620-7ffbc3ba393d", "x": 146, "y": -152, "color": "orange", "seed": 2558.276717397499, "text": "hello world!", "icon": "🦍", "type": "leaf", "width": LEAF_WIDTH, "height": LEAF_HEIGHT }, { "id": "47cc3bbe-01ab-5d30-458f-b9e131c1aaea", "x": 195, "y": -51, "color": "green", "seed": 3934.491707227224, "text": "hello world!", "icon": "🦍", "type": "leaf", "width": LEAF_WIDTH, "height": LEAF_HEIGHT }, { "id": "c9de5ef0-6143-5a3f-ba20-883b79fb9744", "x": 87, "y": -104, "color": "orange", "seed": 295.5389757004682, "text": "hello world!", "icon": "🦍", "type": "leaf", "width": LEAF_WIDTH, "height": LEAF_HEIGHT }, { "id": "70ed4e77-d4a1-8678-baae-26d3b3e7a63f", "x": 146, "y": -2, "color": "orange", "seed": 1827.226735750161, "text": "hello world!", "icon": "🦍", "type": "leaf", "width": LEAF_WIDTH, "height": LEAF_HEIGHT }
      ],
      downPoint: { "x": 1157.446811446349, "y": 444.6808521917038 }
    });

  const images = useMemo(() => {
    return colors.map(c => {
      const image = new Image();
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="660" height="900" version="1.0">
    <g>
     <title>Layer 1</title>
     <path stroke="null" fill="${c}" d="m0,0.45786c0,0.2 2,3.9 4.6,8.1c16.8,28.5 35.2,72.7 43.5,104.4c6.2,24.2 7.4,33.4 7.3,59.6c0,21 -0.4,28 -3.7,56c-5,44 -5.7,52.3 -6.4,81c-1.8,76.9 13.3,156.7 46.9,247c33.1,89 78.8,155.3 137.3,199.5c34.4,25.9 68.5,41.5 108,49.2c9.5,1.9 14.7,2.2 39,2.3c15.4,0.1 26.9,-0.2 25.5,-0.5c-1.9,-0.5 -1.2,-0.8 3.2,-1.4c3.2,-0.4 6.3,-0.4 6.9,0c0.8,0.4 0.9,0.3 0.5,-0.4c-0.5,-0.8 0,-1.2 1.3,-1.2c1.1,0 7.7,-1.2 14.6,-2.6c7,-1.4 14.1,-2.3 15.8,-2c2.3,0.4 2.6,0.4 1.2,-0.3c-1.7,-0.7 -1.3,-0.9 2.2,-1.5c2.3,-0.4 4.8,-0.4 5.4,0c0.7,0.4 0.9,0.3 0.5,-0.4c-0.8,-1.3 4.6,-2.6 7.6,-1.7c1.6,0.4 1.9,0.3 1,-0.3c-1,-0.7 -0.4,-1.1 2.2,-1.6c2,-0.4 4.1,-0.4 4.8,0c0.7,0.5 0.8,0.3 0.3,-0.6c-0.6,-1 -0.1,-1.2 2.6,-0.7c1.9,0.4 2.8,0.3 2.2,-0.1c-0.8,-0.5 3.3,-2.3 10.5,-4.6c6.4,-2.1 12.4,-4 13.2,-4.3c1.3,-0.4 1.3,-0.3 0,0.6c-0.8,0.6 -1,1.1 -0.5,1.1c1.3,0 4.3,-2 3,-2c-0.5,0 1.7,-1.5 5,-3.3l6,-3.2l1.3,4c2.7,8.4 5.2,23.4 5.8,34.5c1.1,18.9 -2.6,29.2 -15.2,43.1l-7.5,8.3l9.8,2.7c6.4,1.7 10.2,2.3 11,1.7c0.7,-0.5 1.7,-0.7 2.2,-0.4c1.1,0.7 5.6,-4.7 5.6,-6.7c0,-0.7 1.4,-4.1 3.2,-7.7c1.7,-3.6 3.7,-8.7 4.4,-11.3c0.6,-2.7 1.5,-4.4 1.8,-3.8c0.4,0.6 0.7,-5.6 0.6,-13.7c0,-13.3 -0.3,-15.9 -3.2,-26.7c-1.8,-6.6 -4.8,-16.7 -6.7,-22.4c-2,-5.8 -3.4,-10.5 -3.3,-10.6c0.1,-0.1 1.9,-1.2 3.9,-2.4c2.1,-1.2 4.1,-2 4.6,-1.7c0.9,0.6 16.6,-11.8 19.7,-15.5c1.1,-1.3 0.2,-0.8 -2,1.2c-4,3.5 -12.3,10.2 -16,12.9c-3.8,2.7 0,-0.8 9,-8.2c5,-4.1 9.6,-8.2 10.4,-9.1c1.8,-2.3 3.7,-2.2 2,0.1c-0.7,0.9 3.1,-2.6 8.4,-7.8c8.8,-8.6 12.2,-12.3 8.2,-9c-2.6,2.2 -1.6,-0.5 1.1,-3.1c4.7,-4.3 18.6,-22.1 25.7,-32.9c3.8,-5.8 7.4,-10.4 7.9,-10.2c0.5,0.1 0.7,-0.2 0.3,-0.7c-0.9,-1.5 2.4,-7.3 3.7,-6.5c0.7,0.4 0.8,0.3 0.4,-0.4c-0.4,-0.6 1,-4.4 3,-8.4c7.8,-15.5 16.6,-40.5 18.9,-53.8c0.8,-4.1 0.9,-4.3 1.6,-2c0.6,1.8 0.7,1.3 0.3,-1.5c-0.3,-2.3 -0.1,-6.1 0.5,-8.5c0.5,-2.5 1.5,-11.2 2.2,-19.3c2.3,-29.1 -2,-60.1 -14.5,-105.9c-9.8,-35.4 -22,-67.7 -38.1,-100.3c-25.1,-51.1 -52,-89 -90,-127.1c-42.5,-42.6 -81.4,-69.6 -149.5,-103.8c-51.6,-25.8 -85.4,-40.1 -147.5,-62.1c-56.7,-20.2 -75.5,-27.9 -116,-47.5c-49.2,-23.9 -79.5,-36.7 -79.5,-33.6zm54.9,52.1c95.8,104.1 263.6,310.1 304.5,374c47.2,73.7 92.3,159.3 123.5,234.7c17.7,42.7 36.6,99.4 34.8,104.2c-0.9,2.3 -5.6,5.1 -6.8,3.9c-0.5,-0.5 -2.8,-7.2 -5,-14.9c-25.2,-86.3 -70.5,-185.3 -128.2,-279.9c-24,-39.3 -60.2,-92 -89.5,-130.4c-30.5,-40 -134.5,-168 -207.1,-255c-22.2,-26.7 -42.6,-51.4 -45.4,-55c-4.8,-6.2 -4.8,-6.4 -1.3,-3.1c2.1,1.9 11.3,11.6 20.5,21.5z" id="svg_1"/>
    </g>
   
   </svg>`;
      image.src = `data:image/svg+xml;base64,${window.btoa(svg)}`;
      return { color: c, image };
    })
  }, [])

  useKeyboard(setAppState);
  const { cameraZoom, elements, cameraOffset, isDragging, sectors, selectedElement, mode } =
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
      images,
      selectedElement?.id,
      mode
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
    sectors,
    images,
    mode
  ]);

  const handlePointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = mousePosToCanvasPos(ctx, e);

    const el = elements.find((el) =>
      hitTest(x, y, el, canvasRef.current!.getContext("2d")!)
    );
    if (el && appState.mode === "edit") {
      setAppState((prev) => ({
        ...prev,
        draggedElement: el,
        downPoint: { x, y },
        selectedElement: el
      }));
      return;
    } else if (!el) {
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
      elements.find((el) => hitTest(x, y, el, canvasRef.current!.getContext("2d")!))
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

  return (
    <>
      <div className="container">
        <div className="sidePanel" style={{ display: appState.mode === "view" ? "none" : "" }}>
          <div className="panelColumn"
          >
            <button
              onClick={() => {
                const el = addText(canvasRef.current!.getContext("2d")!);
                if (!el) return;
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
                      type: "leaf",
                      width: LEAF_WIDTH,
                      height: LEAF_HEIGHT
                    },
                  ],
                }));
              }}
            >
              Add Leaf
            </button>
            {selectedElement && <>
              {selectedElement.type !== "category" && <>
                width
                <input
                  onChange={(e) => {
                    setAppState(prev => ({
                      ...prev,
                      elements: prev.elements.map(el => {
                        if (el.id === selectedElement.id) {
                          return {
                            ...el,
                            width: +e.target.value,
                          }
                        }
                        return el;
                      })
                    }))
                  }}
                  type="range" min={0} max={360} value={elements.find(el => el.id === selectedElement.id)?.width}></input>
                {selectedElement.type === "leaf" && <>height<input
                  onChange={(e) => {
                    setAppState(prev => ({
                      ...prev,
                      elements: prev.elements.map(el => {
                        if (el.id === selectedElement.id) {
                          return {
                            ...el,
                            height: +e.target.value
                          }
                        }
                        return el;
                      })
                    }))
                  }}
                  type="range" min={50} max={300} value={elements.find(el => el.id === selectedElement.id)?.height!}></input>
                </>}
              </>}
              {selectedElement.type === "category" && <>
                font
                <input value={elements.find(el => el.id === selectedElement.id)?.font!} onChange={(e) => {
                  setAppState(prev => ({
                    ...prev,
                    elements: prev.elements.map(el => {
                      if (el.id === selectedElement.id) {
                        return updateText(canvasRef.current!.getContext("2d")!, el.text, el, e.target.value)
                      }
                      return el;
                    })
                  }))
                }
                }></input>
              </>}
              angle
              <input
                onChange={(e) => {
                  setAppState(prev => ({
                    ...prev,
                    elements: prev.elements.map(el => {
                      if (el.id === selectedElement.id) {
                        return {
                          ...el,
                          angle: +e.target.value,
                        }
                      }
                      return el;
                    })
                  }))
                }}
                type="range" min={0} max={2 * Math.PI} step={0.001} value={elements.find(el => el.id === selectedElement.id)?.angle ?? 0}></input>
              text
              <textarea
                onChange={(e) => {
                  setAppState(prev => ({
                    ...prev,
                    elements: prev.elements.map(el => {
                      if (el.id === selectedElement.id) {
                        if (el.type !== "category")
                          return {
                            ...el,
                            text: e.target.value,
                          }
                        return {
                          ...updateText(canvasRef.current!.getContext("2d")!, e.target.value ?? "", el),
                        }
                      }
                      return el;
                    })
                  }))
                }}
                value={elements.find(el => el.id === selectedElement.id)?.text!}></textarea>
              <button
                style={{ backgroundColor: 'red' }}
                onClick={() => {
                  setAppState(prev => ({
                    ...prev,
                    elements: prev.elements.filter(e => e.id !== selectedElement.id),
                    selectedElement: null,
                    draggedElement: null
                  }))
                }}>delete</button>
              <button
                style={{ backgroundColor: 'gray' }}
                onClick={() => {
                  setAppState(prev => ({
                    ...prev,
                    elements: [...prev.elements, {
                      ...elements.find(el => el.id === selectedElement.id)!,
                      id: guidGenerator(),
                      x: 0,
                      y: 0,
                    }],
                    selectedElement: null,
                    draggedElement: null
                  }))
                }}>copy</button>
            </>}
          </div>
        </div>
        <canvas
          onClick={(e) => {
            e.preventDefault();
            if (appState.mode === "edit") return;
            const ctx = canvasRef.current!.getContext("2d")!;
            const { x, y } = mousePosToCanvasPos(ctx, e);
            //ctx.fillText(`${Math.floor(x)}-${Math.floor(y)}`, x, y);
            for (const element of elements) {
              if (hitTest(x, y, element, canvasRef.current!.getContext("2d")!)) {
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
          left: "50%",
          top: 20,
          transform: "translate(-50%, -50%)",
          borderRadius: 6,
          padding: 6,
          userSelect: "none",
        }}
      >
        <button
          onClick={() => setAppState(prev => ({
            ...prev,
            mode: prev.mode === "edit" ? "view" : "edit",
            selectedElement: null
          }))}
        >Switch to {appState.mode === "edit" ? "view" : "edit"} mode</button>
      </div>
    </>
  );
}


