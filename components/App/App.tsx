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
  y: number;
};

type Sector = { color: string; text: string; id: string };
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
  mode: "edit" | "view";
};

const savedState = `{"selectedElement":null,"radius":1000,"sectors":[{"color":"#f15275","text":"Mes reins fatiguent","id":"1bfaeac0-366e-8185-2cbe-719ff714a34e"},{"color":"#f15275","text":"Ma vie sociale","id":"b737843d-1688-8842-98b1-646dfe781bf5"},{"color":"#f15275","text":"Parcours de soins","id":"087d83c9-3a4f-bd27-97e3-e5ea254fb2de"},{"color":"#f15275","text":"Mes ressources","id":"d6442ca0-6afe-08af-24e3-4fb8de46cd8b"},{"color":"#f15275","text":"Mon quotidien","id":"35b8f264-6571-5987-d3df-fb4318904257"},{"color":"#f15275","text":"Mes racines","id":"2cb7b703-6b28-42b7-804e-1b38df98dd17"}],"mode":"view","cameraZoom":0.3125,"scaleMultiplier":0.8,"cameraOffset":{"x":-105.74545454545455,"y":-421.1070707070707},"isDragging":false,"dragStart":{"x":3139.3454545454542,"y":1041.9070707070707},"initialPinchDistance":null,"draggedElement":null,"elements":[{"x":-671.229011608305,"y":-573.9443452380951,"type":"category","id":"bd61106d-78f9-5981-09cd-645b1c4bd40f","text":"L'arbre de vie\\n   des reins","font":"200px Virgil","actualBoundingBoxAscent":157,"width":1370.400146484375,"height":371,"color":"orange","angle":0,"seed":2,"icon":""},{"id":"b72ece49-3009-c842-8620-7ffbc3ba393d","x":80.76923076923072,"y":-27.69230769230768,"color":"green","seed":2558.276717397499,"text":"","icon":"🦍","type":"leaf","width":60,"height":80},{"id":"47cc3bbe-01ab-5d30-458f-b9e131c1aaea","x":-93,"y":138.60000000000002,"color":"gray","seed":3934.491707227224,"text":"","icon":"🦍","type":"leaf","width":60,"height":80},{"id":"c9de5ef0-6143-5a3f-ba20-883b79fb9744","x":1.7897435897434661,"y":15.945299145299103,"color":"orange","seed":295.5389757004682,"text":"","icon":"🦍","type":"leaf","width":60,"height":80},{"id":"70ed4e77-d4a1-8678-baae-26d3b3e7a63f","x":-175.8461538461538,"y":87.23076923076925,"color":"green","seed":1827.226735750161,"text":"","icon":"🦍","type":"leaf","width":60,"height":80},{"id":"0da2315b-2c15-77c8-2726-1f3d53a60992","x":-262.1538461538462,"y":39.384615384615415,"color":"gray","seed":3934.491707227224,"text":"","icon":"🦍","type":"leaf","width":60,"height":80},{"id":"9f18e2f0-5e7f-c60d-5039-96704345e338","x":166.1538461538462,"y":-77.53846153846155,"color":"gray","seed":2558.276717397499,"text":"","icon":"🦍","type":"leaf","width":60,"height":80},{"id":"bba8d173-0125-3e7b-e0df-f1eb260709b6","x":121.8461538461537,"y":178.4615384615385,"color":"green","seed":2558.276717397499,"text":"","icon":"🦍","type":"leaf","width":60,"height":80},{"id":"f2125668-82ef-ba0c-8baa-5fa0dcd312e6","x":92.30769230769204,"y":109.5384615384616,"color":"green","seed":2558.276717397499,"text":"","icon":"🦍","type":"leaf","width":60,"height":80,"angle":2.659},{"id":"835655e0-328c-b916-ec09-3e25402388bb","x":188.30769230769238,"y":142.76923076923077,"color":"green","seed":2558.276717397499,"text":"","icon":"🦍","type":"leaf","width":60,"height":80},{"id":"db06f183-8ea8-47a6-7eba-1740e7b5eae6","x":172.30769230769238,"y":59.076923076923094,"color":"green","seed":2558.276717397499,"text":"","icon":"🦍","type":"leaf","width":60,"height":80,"angle":2.659},{"id":"e894520c-724e-016d-951c-8d95aa901e05","x":212.9230769230769,"y":279.38461538461536,"color":"green","seed":2558.276717397499,"text":"","icon":"🦍","type":"leaf","width":60,"height":80,"angle":2.659},{"id":"4242d985-702b-8790-1579-22c72439bb04","x":140.44444444444434,"y":316.44444444444446,"color":"green","seed":2558.276717397499,"text":"","icon":"🦍","type":"leaf","width":60,"height":80,"angle":2.659},{"id":"e31a6a80-8d58-7d84-4b64-5ed095398c12","x":76.44444444444457,"y":357.33333333333326,"color":"gray","seed":2558.276717397499,"text":"","icon":"🦍","type":"leaf","width":60,"height":80,"angle":2.659},{"id":"97c03574-46e6-2d50-378c-fbf731c66006","x":51.55555555555543,"y":220.62222222222232,"color":"green","seed":2558.276717397499,"text":"","icon":"🦍","type":"leaf","width":60,"height":80,"angle":0},{"id":"564fca7e-3dba-d3e7-7ae4-0fc6d523ae12","x":-17.77777777777783,"y":252.44444444444446,"color":"green","seed":2558.276717397499,"text":"","icon":"🦍","type":"leaf","width":60,"height":80,"angle":0},{"id":"2367b10a-90ff-16a2-6e85-304972e5e7a8","x":-76.44444444444434,"y":-85.33333333333331,"color":"green","seed":2558.276717397499,"text":"","icon":"🦍","type":"leaf","width":60,"height":80},{"id":"16aef718-54c0-b912-c029-a61c3358e404","x":-138.66666666666674,"y":-122.66666666666663,"color":"green","seed":2558.276717397499,"text":"","icon":"🦍","type":"leaf","width":60,"height":80},{"id":"c3e4a5e4-79ea-2922-f867-14053efde748","x":-200.8888888888887,"y":-161.77777777777777,"color":"green","seed":2558.276717397499,"text":"","icon":"🦍","type":"leaf","width":60,"height":80},{"id":"252e4f27-1560-947e-ebc8-e91e1cb3d360","x":-268.44444444444457,"y":-193.77777777777777,"color":"green","seed":2558.276717397499,"text":"","icon":"🦍","type":"leaf","width":60,"height":80},{"id":"fcbcd4de-0227-98fc-2434-0b46c1f3ad25","x":-78.2222222222224,"y":21.33333333333337,"color":"green","seed":2558.276717397499,"text":"","icon":"🦍","type":"leaf","width":60,"height":80,"angle":3.12},{"id":"229009db-73e3-e582-cb73-529cd54974a3","x":-142.22222222222217,"y":-16,"color":"green","seed":2558.276717397499,"text":"","icon":"🦍","type":"leaf","width":60,"height":80,"angle":3.12},{"id":"36b9a36e-0b63-cac5-274f-dd90f2b37bd1","x":-206.22222222222217,"y":-51.55555555555554,"color":"green","seed":2558.276717397499,"text":"","icon":"🦍","type":"leaf","width":60,"height":80,"angle":3.12},{"id":"cfa54c74-6f67-067c-1c02-2831f358ea52","x":-113.60000000000014,"y":241.59999999999997,"color":"gray","seed":3934.491707227224,"text":"","icon":"🦍","type":"leaf","width":60,"height":80,"angle":3.655},{"id":"9476386c-1538-b74a-1ff5-7ee3fc67c150","x":-200,"y":192,"color":"gray","seed":3934.491707227224,"text":"","icon":"🦍","type":"leaf","width":60,"height":80,"angle":3.655},{"id":"43e8e291-05b7-1b3e-144f-3841e62d8eff","x":-99.20000000000005,"y":356.80000000000007,"color":"green","seed":2558.276717397499,"text":"","icon":"🦍","type":"leaf","width":60,"height":80,"angle":0},{"id":"021a756d-1ee1-9802-820f-fd0796469701","x":-216,"y":292.80000000000007,"color":"green","seed":2558.276717397499,"text":"","icon":"🦍","type":"leaf","width":60,"height":80,"angle":0},{"id":"b80b81ed-1504-f96a-dd84-050f35a44732","x":-148.80000000000018,"y":454.40000000000003,"color":"green","seed":2558.276717397499,"text":"","icon":"🦍","type":"leaf","width":60,"height":80,"angle":3.63},{"id":"17f919dc-9d45-ac89-2b17-edeb8f1eaebc","x":-270.4,"y":393.6000000000001,"color":"green","seed":2558.276717397499,"text":"","icon":"🦍","type":"leaf","width":60,"height":80,"angle":3.63},{"id":"edbc719c-0641-9baf-e4a5-fe68b0e8294b","x":2.101025390625182,"y":488.4848266601562,"color":"green","seed":897.2516418408096,"text":"","icon":"🦍","type":"leaf","width":60,"height":80},{"id":"a0fdb8a0-cc3b-0df5-e1b6-f91f390beb23","x":85.301025390625,"y":437.2848266601563,"color":"orange","seed":7827.729397041622,"text":"","icon":"🦍","type":"leaf","width":60,"height":80},{"id":"41f86d85-0eaa-e825-6645-f3e81af71d2b","x":166.9010253906249,"y":386.08482666015624,"color":"green","seed":7808.416620130417,"text":"","icon":"🦍","type":"leaf","width":60,"height":80},{"id":"286299f5-ce91-3476-b736-3b48ed662677","x":62.90102539062491,"y":586.0848266601563,"color":"green","seed":8030.656865213912,"text":"","icon":"🦍","type":"leaf","width":60,"height":80,"angle":3.29},{"id":"e715b251-4cbe-b2b4-5d48-a0d263ba1617","x":165.301025390625,"y":534.8848266601564,"color":"orange","seed":1313.4742742109609,"text":"","icon":"🦍","type":"leaf","width":60,"height":80,"angle":2.95}],"downPoint":{"x":18.634372287326414,"y":72.66261121961807}}`;

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
  angle?: number;
};

const matrix = [1, 0, 0, 1, 0, 0];

export function rotate(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  angle: number
) {
  // 𝑎′𝑥=(𝑎𝑥−𝑐𝑥)cos𝜃−(𝑎𝑦−𝑐𝑦)sin𝜃+𝑐𝑥
  // 𝑎′𝑦=(𝑎𝑥−𝑐𝑥)sin𝜃+(𝑎𝑦−𝑐𝑦)cos𝜃+𝑐𝑦.
  // https://math.stackexchange.com/questions/2204520/how-do-i-rotate-a-line-segment-in-a-specific-point-on-the-line
  return [
    (x1 - x2) * Math.cos(angle) - (y1 - y2) * Math.sin(angle) + x2,
    (x1 - x2) * Math.sin(angle) + (y1 - y2) * Math.cos(angle) + y2,
  ];
}

function hitTestButton(
  x: number,
  y: number,
  buttons: { endX: number; endY: number }[]
) {
  for (let { endX: x1, endY: y1 } of buttons) {
    x1 -= BUTTON_SIZE / 2;
    y1 -= BUTTON_SIZE / 2;
    let x2 = x1 + BUTTON_SIZE;
    let y2 = y1 + BUTTON_SIZE;
    let hit = x > x1 && x < x2 && y > y1 && y < y2;
    if (hit) return { x1, x2 };
  }
}

function hitTest(x: number, y: number, element: Element) {
  if (element.type === "circle") {
    const { x: newX, y: newY } = element;
    const dx = x - newX;
    const dy = y - newY;
    const r = element.width! / 2;
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
    return x > x1 && x < x2 && y > y1 && y < y2;
  } else {
    let { x: x1, y: y1, angle = 0 } = element;
    let x2 = x1 + element.width!;
    let y2 = y1 + element.height!;
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2;
    // reverse rotate the pointer
    [x, y] = rotate(x, y, cx, cy, -angle);
    return x > x1 && x < x2 && y > y1 && y < y2;
  }
}

const RC_WIDTH = 100;
const LEAF_WIDTH = 60;
const LEAF_HEIGHT = 60;
const colors = ["#676767", "#ff7f00", "#9ed36a"];

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

    ctx.textBaseline = textBaseline;
  } catch (err) {}
}

function drawImage(
  rc: RoughCanvas,
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  selected: boolean,
  rotation: number,
  width: number,
  height: number
) {
  ctx.save();
  ctx.translate(x + width / 2, y + height / 2); // sets scale and origin
  ctx.rotate(rotation);
  ctx.drawImage(image, -width / 2, -height / 2, width, height);
  if (selected) {
    rc.rectangle(-width / 2, -height / 2, width, height, {
      seed: 2,
      strokeLineDash: [5, 5],
      roughness: 0,
    });
  }
  ctx.restore();
}

function drawLeaf(
  rc: RoughCanvas,
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  width: number,
  height: number,
  image: HTMLImageElement,
  isSelected: boolean,
  angle = 0
) {
  drawImage(rc, ctx, image, x, y, isSelected, angle, width, height);
  printAtWordWrap(ctx, text, x + width / 2, y + height / 2, 15, width - 15);
}

function drawTronc(
  rc: RoughCanvas,
  startX: number,
  startY: number,
  endX: number,
  endY: number
) {
  rc.line(startX, startY, endX, endY, {
    strokeWidth: 50,
    roughness: 5,
    seed: 2,
    stroke: "rgb(90,50,25)",
  });
}

const branchColors = Array(10)
  .fill(0)
  .map((_) => "rgb(" + ((Math.random() * 64 + 64) >> 0) + ",50,25)");

const BRANCH_WIDTH = 25;
function drawBranch(
  rc: RoughCanvas,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  i: number
) {
  const stroke = branchColors[i];

  rc.line(startX, startY, endX, endY, {
    strokeWidth: BRANCH_WIDTH,
    roughness: 5,
    seed: 2,
    stroke,
  });
}
//TODO Add some random here
const getAngle = (i: number) => (i % 2 === 0 ? Math.PI / 6 : (5 * Math.PI) / 6);
const getLineFromAngle = (
  x: number,
  y: number,
  length: number,
  angle: number
) => ({
  endX: x + length * Math.cos(-angle),
  endY: y + length * Math.sin(-angle),
});

const BUTTON_SIZE = 30;

function drawAddButton(canvas: HTMLCanvasElement, x: number, y: number) {
  const ctx = canvas.getContext("2d")!;
  const textAlign = ctx.textAlign;
  const textColor = ctx.fillStyle;
  const textBaseline = ctx.textBaseline;
  const font = ctx.font;
  ctx.fillStyle = "green";
  ctx.fillRect(
    x - BUTTON_SIZE / 2,
    y - BUTTON_SIZE / 2,
    BUTTON_SIZE,
    BUTTON_SIZE
  );

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#eeee";
  ctx.font = "30px comic sans ms";
  ctx.fillText("+", x, y);
  ctx.textAlign = textAlign;
  ctx.textBaseline = textBaseline;
  ctx.fillStyle = textColor;
  ctx.font = font;
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

function updateText(
  context: CanvasRenderingContext2D,
  text: string,
  elem: Element,
  font?: string
) {
  const element: Element = {
    ...elem,
    text,
    font: font || elem.font,
  };
  const ctxFont = context.font;
  context.font = element.font || "20px virgil";
  const lines = text.split("\n");
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
      height +=
        actualBoundingBoxAscent +
        SPACE_BETWEEN_LINES +
        actualBoundingBoxDescent;
    }
    context.font = ctxFont;
    element.width = maxWidth;
    element.height = height;
    return element;
  }
}

const SPACE_BETWEEN_LINES = 3;
const NUMBER_OF_BRANCHES = Math.round(getRandomArbitrary(4, 8));

function drawCategory(
  category: Element,
  ctx: CanvasRenderingContext2D,
  rc: RoughCanvas,
  isSelected: boolean,
  angle = 0
) {
  const font = ctx.font;
  ctx.font = category.font!;
  const align = ctx.textAlign;
  ctx.textAlign = "left";
  const baseLine = ctx.textBaseline;
  ctx.textBaseline = "top";
  const { x, y, text, width = 0, height = 0 } = category;
  ctx.save();
  ctx.translate(x + width / 2, y + height! / 2); // sets scale and origin
  ctx.rotate(angle);
  let lines = text.split("\n");
  let lineheight = height / lines.length;

  for (let i = 0; i < lines.length; i++)
    ctx.fillText(lines[i], -width / 2, -height / 2 + i * lineheight);
  if (isSelected) {
    rc.rectangle(-width / 2, -height / 2, width, height, {
      seed: 2,
      strokeLineDash: [5, 5],
      roughness: 0,
    });
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

function getBranchEndpoint(height: number) {
  const endTreeY = 100 - 30 * NUMBER_OF_BRANCHES;
  const baseTreeX = 0;
  const baseTreeY = height;
  const branchLength = 300;
  const xys = [];
  //Draw Branch
  let startX = baseTreeX;
  let startY = baseTreeY - 100;
  let spaceBetweenBranches =
    (height + Math.abs(endTreeY) - 100) / NUMBER_OF_BRANCHES;
  for (let i = 0; i < NUMBER_OF_BRANCHES; ++i) {
    let { endX, endY } = getLineFromAngle(
      startX,
      startY,
      branchLength,
      getAngle(i)
    );
    xys.push({ startX, startY, endX, endY });
    startY -= spaceBetweenBranches;
  }
  return xys;
}

const getLeafNumbers = (nbOfBranches: number) =>
  new Array(nbOfBranches).fill(0).map((_) => getRandomArbitrary(4, 8));

const leafNumbers = getLeafNumbers(NUMBER_OF_BRANCHES);
const BRANCH_LENGTH = 300;

function computeBranchCoords(
  nbOfLeaf: number,
  startX: number,
  startY: number,
  angle: number,
  isRight: boolean
) {
  const endPoints = [];
  let dLeaf = Math.ceil(BRANCH_LENGTH / nbOfLeaf);
  for (let j = 1; j <= nbOfLeaf; ++j) {
    let length = dLeaf * j;
    let { endX, endY } = getLineFromAngle(startX, startY, length, angle);
    let x = endX;
    let y = endY;
    if (!isRight) {
      x -= LEAF_WIDTH;
    }
    if (j % 2 !== 0) {
      // bas
      y -=  BRANCH_WIDTH / 2 + LEAF_HEIGHT * 1.5;
    }
    endPoints.push({ x, y, isRight });
  }
  return endPoints;
}

function draw(
  canvas: HTMLCanvasElement,
  cameraZoom: number,
  cameraOffset: { x: number; y: number },
  rc: RoughCanvas,
  elements: Element[],
  sectors: { color: string; text: string }[],
  images: { color: string; image: HTMLImageElement }[],
  selectedId?: string,
  mode?: string
) {
  const ctx = canvas.getContext("2d")!;
  // Zooming and padding
  translate(canvas.width / 2, canvas.height / 2, ctx);
  scale(cameraZoom, cameraZoom, ctx);
  translate(
    -canvas.width / 2 + cameraOffset.x,
    -canvas.height / 2 + cameraOffset.y,
    ctx
  );
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Drawing
  const numberOfBranches = NUMBER_OF_BRANCHES;
  const endTreeY = 100 - 30 * numberOfBranches;
  const endTreeX = 0;
  const baseTreeX = 0;
  const baseTreeY = canvas.height;
  ctx.lineCap = "round";
  ctx.translate(canvas.width / 2, canvas.height / 2);

  if (mode === "edit") drawGrid(ctx);
  drawTronc(rc, baseTreeX, baseTreeY, endTreeX, endTreeY);

  //Draw Branch
  let startX = baseTreeX;
  let startY = baseTreeY - 100;
  let spaceBetweenBranches =
    (canvas.height + Math.abs(endTreeY) - 100) / numberOfBranches;
  let branchesEndpoint = getBranchEndpoint(canvas.height);
  let k = 0;
  for (const { startX, endX, startY, endY } of branchesEndpoint) {
    drawBranch(rc, startX, startY, endX, endY, k);
    ++k;
  }

  if (mode === "edit") {
    for (const { endX, endY } of branchesEndpoint) {
      drawAddButton(canvas, endX, endY);
    }
    /*
    //TODO DELETE
    const be = getBranchEndpoint(canvas.height);
    for (let i = 0; i < NUMBER_OF_BRANCHES; ++i) {
      const c = computeBranchCoords(
        leafNumbers[i],
        be[i].startX,
        be[i].startY,
        getAngle(i),
        i % 2 === 0
      );
      for (const { x, y } of c) {
        rc.circle(x, y, 20, {
          fill: "green",
          fillStyle: "solid",
          seed: 2,
        });
      }
    }*/
  }
  ctx.fillStyle = "black";
  let i = 0;
  for (const element of elements) {
    if (element.type === "category") {
      drawCategory(element, ctx, rc, element.id === selectedId, element.angle);
    } else if (element.type === "circle") {
      drawSector(element, ctx, rc, i++, element.id === selectedId);
    } else {
      drawLeaf(
        rc,
        ctx,
        element.x,
        element.y,
        element.text,
        element.width!,
        element.height!,
        images.find((c) => c.color === element.color)!.image,
        element.id === selectedId,
        element.angle
      );
    }
  } //buildTree(ctx, roughCanvas);
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
function printAtWordWrap(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  lineHeight: number,
  fitWidth: number
) {
  const fillStyle = context.fillStyle;
  context.textAlign = "center";
  context.fillStyle = "black";
  context.font = "bold 12px comic sans ms";
  fitWidth = fitWidth || 0;

  if (fitWidth <= 0) {
    context.fillText(text, x, y);
    context.fillStyle = fillStyle;
    return;
  }
  let words = text.split(" ");
  let currentLine = 0;
  let idx = 1;
  while (words.length > 0 && idx <= words.length) {
    let str = words.slice(0, idx).join(" ");
    let w = context.measureText(str).width;
    if (w > fitWidth) {
      if (idx == 1) {
        idx = 2;
      }
      context.fillText(
        words.slice(0, idx - 1).join(" "),
        x,
        y + lineHeight * currentLine
      );
      currentLine++;
      words = words.splice(idx - 1);
      idx = 1;
    } else {
      idx++;
    }
  }
  if (idx > 0)
    context.fillText(words.join(" "), x, y + lineHeight * currentLine);
  context.fillStyle = fillStyle;
}

function getMousePos(canvas: HTMLCanvasElement, evt: any) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top,
  };
}

function adjust(color: string, amount: number) {
  return (
    "#" +
    color
      .replace(/^#/, "")
      .replace(/../g, (color) =>
        (
          "0" +
          Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)
        ).substr(-2)
      )
  );
}
let MAX_ZOOM = 5;
let MIN_ZOOM = 0.1;
let SCROLL_SENSITIVITY = 0.0005;
let INITIAL_ZOOM = 0.5;
export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [width, height, devicePixelRatio] = useDeviceSize();
  const [roughCanvas, setRoughCanvas] = useState<RoughCanvas | null>(null);
  const [appState, setAppState] = useState<AppState>(() => {
    return {
      selectedElement: null,
      sectors: [
        {
          color: "#f15275",
          text: "Mes reins fatiguent",
          id: guidGenerator(),
        },
        {
          color: "#f15275",
          text: "Ma vie sociale",
          id: guidGenerator(),
        },
        {
          color: "#f15275",
          text: "Parcours de soins",
          id: guidGenerator(),
        },
        {
          color: "#f15275",
          text: "Mes ressources",
          id: guidGenerator(),
        },
        {
          color: "#f15275",
          text: "Mon quotidien",
          id: guidGenerator(),
        },
        {
          color: "#f15275",
          text: "Mes racines",
          id: guidGenerator(),
        },
      ],
      mode: "view",
      cameraZoom: INITIAL_ZOOM,
      scaleMultiplier: 0.8,
      cameraOffset: { x: 0, y: 0 },
      isDragging: false,
      dragStart: { x: 0, y: 0 },
      initialPinchDistance: null,
      draggedElement: null,
      elements: [],
      downPoint: { x: 0, y: 0 },
    };
  });

  const images = useMemo(() => {
    return colors.map((c) => {
      const image = new Image();
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 511.845 511.845" 
      style="enable-background:new 0 0 511.845 511.845" xml:space="preserve">
      <path style="fill:${c}" d="M503.141 9.356c-.016 0-215.215-56.483-390.225 118.511C-31.579 272.371 96.155 416.35 96.155 416.35s143.979 127.742 288.476-16.775C559.64 224.588 503.156 9.388 503.141 9.356Z"/><g style="opacity:.2"><path style="fill:#fff" d="m503.141 8.696-21.337-4.108c.016.031 56.499 219.339-118.495 394.326-48.172 48.203-96.299 66.104-139.052 68.572 47.705 2.75 104-12.184 160.374-68.572C559.64 223.928 503.156 8.728 503.141 8.696z"/></g><path style="fill:${adjust(
        c,
        -20
      )}" d="M300.125 211.728c-4.154-4.17-10.918-4.17-15.074 0L3.122 493.635c-4.163 4.186-4.163 10.934 0 15.09 4.163 4.154 10.911 4.154 15.081 0l281.922-281.923c4.17-4.171 4.17-10.919 0-15.074z"/></svg>`;
      image.src = `data:image/svg+xml;base64,${window.btoa(svg)}`;
      return { color: c, image };
    });
  }, []);

  useKeyboard(setAppState);
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

  const buttonEndpoints = useMemo(() => getBranchEndpoint(height), [height]);

  useEffect(() => {
    const branchesStartPoints = buttonEndpoints;
    const coords = [];
    for (let i = 0; i < branchesStartPoints.length; ++i) {
      const { startX, startY } = branchesStartPoints[i];
      const nbOfLeaf = leafNumbers[i];
      coords.push(
        computeBranchCoords(nbOfLeaf, startX, startY, getAngle(i), i % 2 === 0)
      );
    }
    //R 0 1 2 - L 3 4 5 - R 6 7 8
    const elements: Element[] = coords.flat().map(({ x, y, isRight }, i) => ({
      x,
      y,
      type: "leaf",
      text: "",
      id: guidGenerator(),
      seed: getRandomArbitrary(1, 100),
      color: colors[Math.floor(getRandomArbitrary(0, colors.length))],
      icon: "",
      height: LEAF_HEIGHT,
      width: LEAF_WIDTH,
      angle: !isRight ? (3 * Math.PI) / 2 : 0,
    }));

    setAppState((prev) => ({
      ...prev,
      elements,
    }));
  }, [buttonEndpoints]);

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
    mode,
  ]);

  const handlePointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = mousePosToCanvasPos(ctx, e);

    const el = elements.find((el) => hitTest(x, y, el));
    //don't drag when clicking button
    if (hitTestButton(x, y, buttonEndpoints)) return;
    if (el && appState.mode === "edit") {
      setAppState((prev) => ({
        ...prev,
        draggedElement: el,
        downPoint: { x, y },
        selectedElement: el,
      }));
      return;
    } else if (!el) {
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
    if (
      hitTestButton(x, y, buttonEndpoints) ||
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

  return (
    <>
      <div className="container">
        <div
          className="sidePanel"
          style={{ display: appState.mode === "view" ? "none" : "" }}
        >
          <div className="panelColumn">
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
              Add text
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
                      text: "",
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
            {selectedElement && (
              <>
                {selectedElement.type !== "category" && (
                  <>
                    width
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
                      min={0}
                      max={360}
                      value={
                        elements.find((el) => el.id === selectedElement.id)
                          ?.width
                      }
                    ></input>
                    {selectedElement.type === "leaf" && (
                      <>
                        height
                        <input
                          onChange={(e) => {
                            setAppState((prev) => ({
                              ...prev,
                              elements: prev.elements.map((el) => {
                                if (el.id === selectedElement.id) {
                                  return {
                                    ...el,
                                    height: +e.target.value,
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
                              ?.height!
                          }
                        ></input>
                      </>
                    )}
                  </>
                )}
                {selectedElement.type === "category" && (
                  <>
                    font
                    <input
                      value={
                        elements.find((el) => el.id === selectedElement.id)
                          ?.font!
                      }
                      onChange={(e) => {
                        setAppState((prev) => ({
                          ...prev,
                          elements: prev.elements.map((el) => {
                            if (el.id === selectedElement.id) {
                              return updateText(
                                canvasRef.current!.getContext("2d")!,
                                el.text,
                                el,
                                e.target.value
                              );
                            }
                            return el;
                          }),
                        }));
                      }}
                    ></input>
                  </>
                )}
                angle
                <input
                  onChange={(e) => {
                    setAppState((prev) => ({
                      ...prev,
                      elements: prev.elements.map((el) => {
                        if (el.id === selectedElement.id) {
                          return {
                            ...el,
                            angle: +e.target.value,
                          };
                        }
                        return el;
                      }),
                    }));
                  }}
                  type="range"
                  min={0}
                  max={2 * Math.PI}
                  step={0.0001}
                  value={
                    elements.find((el) => el.id === selectedElement.id)
                      ?.angle ?? 0
                  }
                ></input>
                text
                <textarea
                  onChange={(e) => {
                    setAppState((prev) => ({
                      ...prev,
                      elements: prev.elements.map((el) => {
                        if (el.id === selectedElement.id) {
                          if (el.type !== "category")
                            return {
                              ...el,
                              text: e.target.value,
                            };
                          return {
                            ...updateText(
                              canvasRef.current!.getContext("2d")!,
                              e.target.value ?? "",
                              el
                            ),
                          };
                        }
                        return el;
                      }),
                    }));
                  }}
                  value={
                    elements.find((el) => el.id === selectedElement.id)?.text!
                  }
                ></textarea>
                <button
                  style={{ backgroundColor: "red" }}
                  onClick={() => {
                    setAppState((prev) => ({
                      ...prev,
                      elements: prev.elements.filter(
                        (e) => e.id !== selectedElement.id
                      ),
                      selectedElement: null,
                      draggedElement: null,
                    }));
                  }}
                >
                  delete
                </button>
                <button
                  style={{ backgroundColor: "gray" }}
                  onClick={() => {
                    setAppState((prev) => ({
                      ...prev,
                      elements: [
                        ...prev.elements,
                        {
                          ...elements.find(
                            (el) => el.id === selectedElement.id
                          )!,
                          id: guidGenerator(),
                          x: selectedElement.x + 20,
                          y: selectedElement.y + 20,
                        },
                      ],
                      selectedElement: null,
                      draggedElement: null,
                    }));
                  }}
                >
                  copy
                </button>
              </>
            )}
          </div>
        </div>
        <canvas
          onClick={(e) => {
            e.preventDefault();

            const ctx = canvasRef.current!.getContext("2d")!;
            const { x, y } = mousePosToCanvasPos(ctx, e);
            if (appState.mode === "edit") {
              if (hitTestButton(x, y, buttonEndpoints)) {
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
                      icon: "🦍",
                      type: "leaf",
                      width: LEAF_WIDTH,
                      height: LEAF_HEIGHT,
                    },
                  ],
                }));
              }
              return;
            }
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
          left: "50%",
          top: 20,
          transform: "translate(-50%, -50%)",
          borderRadius: 6,
          padding: 6,
          userSelect: "none",
        }}
      >
        <button
          onClick={() =>
            setAppState((prev) => ({
              ...prev,
              mode: prev.mode === "edit" ? "view" : "edit",
              selectedElement: null,
            }))
          }
        >
          Switch to {appState.mode === "edit" ? "view" : "edit"} mode
        </button>{" "}
        {mode === "edit" && (
          <button
            onClick={() =>
              navigator.clipboard.writeText(JSON.stringify(appState))
            }
          >
            save to clipboard
          </button>
        )}
      </div>
    </>
  );
}
