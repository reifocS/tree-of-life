import { RoughCanvas } from "roughjs/bin/canvas";

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
export const savedState: AppState = {
  selectedElement: null,
  sectors: [],
  mode: "view",
  cameraZoom: 1,
  scaleMultiplier: 0.8,
  cameraOffset: { x: 0, y: 0 },
  isDragging: false,
  dragStart: { x: 0, y: 0 },
  initialPinchDistance: null,
  draggedElement: null,
  elements: [
    {
      x: 51.96152422706632,
      y: 507.5,
      type: "leaf",
      text: "Mes bilans biologiques",
      id: "a18f10f0-45b7-5a56-284b-ac17c3397bf9",
      seed: 62.62469541406686,
      color: "#9ed36a",
      icon: "📝",
      height: 100,
      width: 100,
      angle: 0,
    },
    {
      x: 106.52112466548596,
      y: 638.5,
      type: "leaf",
      text: "Psychologue",
      id: "592872f0-ba50-ebcb-67a7-d14e6655f702",
      seed: 73.23324978740574,
      color: "#9ed36a",
      icon: "👥",
      height: 100,
      width: 100,
      angle: 0,
    },
    {
      x: 161.0807251039056,
      y: 444.5,
      type: "leaf",
      text: "Assistance sociale",
      id: "2e9d9506-ce9d-23be-0768-6cdcca6bec1c",
      seed: 7.464002919073055,
      color: "#9ed36a",
      icon: "🧑",
      height: 100,
      width: 100,
      angle: 0,
    },
    {
      x: 215.64032554232523,
      y: 575.5,
      type: "leaf",
      text: "Nephrologue",
      id: "3eeb25d1-f969-a631-9cef-662b53c6739f",
      seed: 96.19134768759764,
      color: "#9ed36a",
      icon: "🧑‍⚕️",
      height: 100,
      width: 100,
      angle: 0,
    },
    {
      x: 270.19992598074487,
      y: 381.5,
      type: "leaf",
      text: "Infirimière",
      id: "fb452924-5469-d3cd-ecb2-528ceaa51a06",
      seed: 63.200438945180665,
      color: "#9ed36a",
      icon: "🧑‍⚕️",
      height: 100,
      width: 100,
      angle: 0,
    },
    {
      x: 324.7595264191645,
      y: 512.5,
      type: "leaf",
      text: "Diéteticien",
      id: "c365b175-30ed-0fcd-95fe-d2abc422fd18",
      seed: 26.485855677198,
      color: "#9ed36a",
      icon: "🧑‍⚕️",
      height: 100,
      width: 100,
      angle: 0,
    },
    {
      x: 379.31912685758414,
      y: 318.5,
      type: "leaf",
      text: "Association de patients",
      id: "9ba6e70a-afec-a7d9-ae7d-e3dba5e81203",
      seed: 9.044580216117271,
      color: "#9ed36a",
      icon: "🧑‍🤝‍🧑",
      height: 100,
      width: 100,
      angle: 0,
    },
    {
      x: -151.96152422706632,
      y: 182.5,
      type: "leaf",
      text: "Hémodialyse",
      id: "970bc1ec-e53d-f4b6-3694-815a28dee78b",
      seed: 81.98308786029783,
      color: "#9ed36a",
      icon: "🩺",
      height: 100,
      width: 100,
      angle: 4.71238898038469,
    },
    {
      x: -206.52112466548596,
      y: 313.5,
      type: "leaf",
      text: "Dialyse péritonéale",
      id: "c5165a34-1a0f-23ce-7a43-d446be492886",
      seed: 57.186150003923196,
      color: "#9ed36a",
      icon: "🩺",
      height: 100,
      width: 100,
      angle: 4.71238898038469,
    },
    {
      x: -261.0807251039056,
      y: 119.5,
      type: "leaf",
      text: "Greffe",
      id: "0f7bd084-1c1f-8031-d1d6-443ddaf622cd",
      seed: 17.082665455910576,
      color: "#9ed36a",
      icon: "🩺",
      height: 100,
      width: 100,
      angle: 4.71238898038469,
    },
    {
      x: -315.64032554232523,
      y: 250.5,
      type: "leaf",
      text: "Traitement conservateur",
      id: "f4bea1d4-95b7-42d9-1b4d-b9ffa0282696",
      seed: 94.66953252919623,
      color: "#9ed36a",
      icon: "🩺",
      height: 100,
      width: 100,
      angle: 4.71238898038469,
    },
    {
      x: 51.96152422706632,
      y: -142.5,
      type: "leaf",
      text: "Tension artérielle",
      id: "873a418f-0474-4eec-09df-9429c759a303",
      seed: 9.921547005808211,
      color: "#9ed36a",
      icon: "🩺",
      height: 100,
      width: 100,
      angle: 0,
    },
    {
      x: 106.52112466548596,
      y: -11.499999999999993,
      type: "leaf",
      text: "Poids",
      id: "ed55b126-82f5-680c-9031-c5e50b6beace",
      seed: 13.528596290781815,
      color: "#9ed36a",
      icon: "⚖️",
      height: 100,
      width: 100,
      angle: 0,
    },
    {
      x: 161.0807251039056,
      y: -205.5,
      type: "leaf",
      text: "Activités physiques",
      id: "d6077a23-c7df-066f-b775-cca518cd52c8",
      seed: 21.26459062327465,
      color: "#9ed36a",
      icon: "🏋️",
      height: 100,
      width: 100,
      angle: 0,
    },
    {
      x: 215.64032554232523,
      y: -74.49999999999999,
      type: "leaf",
      text: "Médicaments",
      id: "53ca1506-8c31-4898-d44b-dd9f16f4aa74",
      seed: 81.36015708836094,
      color: "#9ed36a",
      icon: "💊",
      height: 100,
      width: 100,
      angle: 0,
    },
    {
      x: 270.19992598074487,
      y: -268.5,
      type: "leaf",
      text: "Alimentation",
      id: "ac9b67f3-56c4-a130-133c-dc6f11a8e90e",
      seed: 51.97102337917222,
      color: "#9ed36a",
      icon: "🥕",
      height: 100,
      width: 100,
      angle: 0,
    },
    {
      x: 324.7595264191645,
      y: -137.49999999999997,
      type: "leaf",
      text: "Projets",
      id: "d5a8a003-7380-121b-cb8a-a9ca529d4464",
      seed: 31.777842956869375,
      color: "#9ed36a",
      icon: "💡",
      height: 100,
      width: 100,
      angle: 0,
    },
    {
      x: 379.31912685758414,
      y: -331.5,
      type: "leaf",
      text: "Finances",
      id: "66594fcc-15dd-114f-30b1-0d9bd0548f63",
      seed: 13.548036428848865,
      color: "#9ed36a",
      icon: "💶",
      height: 100,
      width: 100,
      angle: 0,
    },
    {
      x: -151.96152422706632,
      y: -467.5,
      type: "leaf",
      text: "Loisirs",
      id: "6cc75632-31f4-7162-d418-f9ad830a7dc6",
      seed: 48.34097184770858,
      color: "#9ed36a",
      icon: "🎲",
      height: 100,
      width: 100,
      angle: 4.71238898038469,
    },
    {
      x: -206.52112466548596,
      y: -336.5,
      type: "leaf",
      text: "Famille",
      id: "3d21f5ff-4a65-021a-e710-f815adf7f1c8",
      seed: 42.84618778842591,
      color: "#9ed36a",
      icon: "👪",
      height: 100,
      width: 100,
      angle: 4.71238898038469,
    },
    {
      x: -261.0807251039056,
      y: -530.5,
      type: "leaf",
      text: "Amis",
      id: "252ee1eb-4c76-19db-400b-0c6cfce8308a",
      seed: 74.32430527072653,
      color: "#9ed36a",
      icon: "🧑‍🤝‍🧑",
      height: 100,
      width: 100,
      angle: 4.71238898038469,
    },
    {
      x: -315.64032554232523,
      y: -399.5,
      type: "leaf",
      text: "Couple",
      id: "aad8232e-2cdf-3d40-4640-519e0c8d7bcb",
      seed: 10.389420408253672,
      color: "#9ed36a",
      icon: "💑",
      height: 100,
      width: 100,
      angle: 4.71238898038469,
    },
    {
      x: -370.19992598074487,
      y: -593.5,
      type: "leaf",
      text: "Travail",
      id: "8539d628-b0b1-e1f9-e11e-710a5fd7b83d",
      seed: 95.3064045915299,
      color: "#9ed36a",
      icon: "💼",
      height: 100,
      width: 100,
      angle: 4.71238898038469,
    },
    {
      x: -424.7595264191645,
      y: -462.5,
      type: "leaf",
      text: "Sexualité",
      id: "2c889a24-6a8d-3fa0-faf7-da76f234e17e",
      seed: 82.95301739477236,
      color: "#9ed36a",
      icon: "♥️",
      height: 100,
      width: 100,
      angle: 4.71238898038469,
    },
    {
      x: 453.01270189221935,
      y: 440,
      type: "category",
      text: "Parcours de soins",
      id: "09ba93ac-d9db-163a-86c3-9b7cb58b459e",
      seed: 26.774279150734948,
      color: "black",
      icon: "",
      height: 42.046171875,
      width: 323.0833435058594,
      font: "40px comic sans ms",
      angle: 0,
      actualBoundingBoxAscent: 31.1328125,
    },
    {
      x: -821.0127018922194,
      y: 115.00000000000003,
      type: "category",
      text: "Mes reins fatiguent",
      id: "01501366-4d4b-3a8e-322c-c17bacc18688",
      seed: 27.10841585184267,
      color: "black",
      icon: "",
      height: 54.3284765625,
      width: 368,
      font: "40px comic sans ms",
      angle: 0,
      actualBoundingBoxAscent: 31.23046875,
    },
    {
      x: 453.01270189221935,
      y: -209.99999999999997,
      type: "category",
      text: "Mon quotidien",
      id: "dc0def03-b0c8-fa22-30b8-0f373b5d5284",
      seed: 72.59326097621539,
      color: "black",
      icon: "",
      height: 54.001953125,
      width: 259.5,
      font: "40px comic sans ms",
      angle: 0,
      actualBoundingBoxAscent: 31.1328125,
    },
    {
      x: -710.92935838636,
      y: -535,
      type: "category",
      text: "Ma vie sociale",
      id: "c436f7ef-6cfa-fde0-2ca3-c3ee58d8ca22",
      seed: 48.803311922830794,
      color: "black",
      icon: "",
      height: 42.49828125,
      width: 257.9166564941406,
      font: "40px comic sans ms",
      angle: 0,
      actualBoundingBoxAscent: 31.42578125,
    },
  ],
  downPoint: { x: 0, y: 0 },
};

//https://stackoverflow.com/a/6860916/14536535
export function guidGenerator() {
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

export type Element = {
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
  fontColor?: string;
  categoryId?: string;
  angle?: number;
  weTalkedAboutIt?: boolean;
  iconSize?: number;
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

export function hitTestButton(
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

export function hitTest(x: number, y: number, element: Element) {
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

export const LEAF_WIDTH = 100;
export const LEAF_HEIGHT = 100;
export const colors = ["#fff", "#676767", "#ff7f00", "#9ed36a"];
export const RC_WIDTH = 100;

function drawGrid(ctx: CanvasRenderingContext2D) {
  try {
    const textBaseline = ctx.textBaseline;
    const font = ctx.font;
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
    ctx.font = font;
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
  element: Element,
  image: HTMLImageElement,
  isSelected: boolean
) {
  const {
    x,
    y,
    text,
    angle = 0,
    width = 0,
    height = 0,
    fontColor = "black",
    icon = "",
    iconSize = 22,
    weTalkedAboutIt,
  } = element;
  drawImage(rc, ctx, image, x, y, isSelected, angle, width!, height!);
  //TODO find a more generic way
  const isRight = angle < Math.PI / 2;
  printAtWordWrap(
    ctx,
    text,
    x + width / 2 + (isRight ? 5 : 0),
    y + height / 2 - 10,
    15,
    width - 15,
    fontColor,
    icon,
    iconSize
  );
  const font = ctx.font;
  const weTalkedAboutItSize = 18;
  ctx.font = `${weTalkedAboutItSize}px arial`;
  if (weTalkedAboutIt) {
    if (isRight)
      ctx.fillText(
        "💭",
        x + element.width! / 2,
        y + element.height! / 2 - weTalkedAboutItSize - 4
      );
    else {
      ctx.fillText(
        "💭",
        x + element.width! / 2 - weTalkedAboutItSize,
        y + element.height! / 2 - weTalkedAboutItSize - 4
      );
    }
  }
  ctx.font = font;
}

const getLeafNumbers = (nbOfBranches: number) =>
  new Array(nbOfBranches).fill(0).map((_) => getRandomArbitrary(4, 8));

function drawTronc(
  rc: RoughCanvas,
  startX: number,
  startY: number,
  endX: number,
  endY: number
) {
  // +300 pour faire descendre le tronc plus bas.
  rc.line(startX, startY + 300, endX, endY, {
    strokeWidth: 50,
    roughness: 5,
    seed: 2,
    stroke: "rgb(90,50,25)",
  });
}

// Constants
const branchColors = Array(10)
  .fill(0)
  .map((_) => "rgb(" + ((Math.random() * 64 + 64) >> 0) + ",50,25)");
const BRANCH_WIDTH = 25;
const BUTTON_SIZE = 30;
const SPACE_BETWEEN_LINES = 3;
export const NUMBER_OF_BRANCHES = 4;
//const leafNumbers = getLeafNumbers(NUMBER_OF_BRANCHES);
const BRANCH_LENGTH = 500;
//TODO replace 5 with dynamic nb of branches
const END_TREE_Y = -100 - LEAF_HEIGHT * 5;
export const BASE_TREE_X = 0;
export const BASE_TREE_Y = 800;

export const MAX_ZOOM = 5;
export const MIN_ZOOM = 0.1;
export const SCROLL_SENSITIVITY = 0.0005;
let INITIAL_ZOOM = 1;

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
  printAtWordWrap(ctx, el.text, el.x, el.y, 15, el.width! - 15, "black", "");
}

export function getRandomArbitrary(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function translate(x: number, y: number, ctx: CanvasRenderingContext2D) {
  matrix[4] += matrix[0] * x + matrix[2] * y;
  matrix[5] += matrix[1] * x + matrix[3] * y;
  ctx.translate(x, y);
}

export function addText(context: CanvasRenderingContext2D) {
  //TODO type it
  const element: any = {
    x: 0,
    y: 0,
    type: "category",
    id: guidGenerator(),
    color: "black",
  };
  let text = prompt("What text do you want?");
  if (text === null) {
    return;
  }

  element.text = text;
  element.font = "20px comic sans ms";
  const font = context.font;
  context.font = element.font;
  const { actualBoundingBoxAscent, actualBoundingBoxDescent, width } =
    context.measureText(text);
  element.actualBoundingBoxAscent = actualBoundingBoxAscent;
  context.font = font;
  const height = (actualBoundingBoxAscent + actualBoundingBoxDescent) * 1.286;
  element.width = width;
  element.height = height;
  return element;
}

export function updateText(
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
  context.font = element.font || "20px comic sans ms";
  const lines = text.split("\n");
  //TODO fix for words with low baseline
  if (lines.length === 1) {
    const { actualBoundingBoxAscent, actualBoundingBoxDescent, width } =
      context.measureText(text);
    element.actualBoundingBoxAscent = actualBoundingBoxAscent;
    const height = (actualBoundingBoxAscent + actualBoundingBoxDescent) * 1.286;
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
  const fillStyle = ctx.fillStyle;
  ctx.fillStyle = category.color;
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
  ctx.fillStyle = fillStyle;
}

function scale(x: number, y: number, ctx: CanvasRenderingContext2D) {
  matrix[0] *= x;
  matrix[1] *= x;
  matrix[2] *= y;
  matrix[3] *= y;
  ctx.scale(x, y);
}

export function getBranchEndpoint(
  height: number,
  nbOfBranches = NUMBER_OF_BRANCHES
) {
  const baseTreeY = BASE_TREE_Y;
  const xys = [];
  //Draw Branch
  let startX = BASE_TREE_X;
  let startY = baseTreeY - 100;
  let spaceBetweenBranches =
    (height + Math.abs(END_TREE_Y) - 100) / nbOfBranches;
  for (let i = 0; i < nbOfBranches; ++i) {
    let { endX, endY } = getLineFromAngle(
      startX,
      startY,
      BRANCH_LENGTH,
      getAngle(i)
    );
    xys.push({ startX, startY, endX, endY });
    startY -= spaceBetweenBranches;
  }
  return xys;
}

function computeBranchCoords(
  nbOfLeaf: number,
  startX: number,
  startY: number,
  angle: number,
  isRight: boolean
) {
  const endPoints = [];
  let divider = nbOfLeaf;
  if (nbOfLeaf < 7) divider = 7;
  let dLeaf = Math.ceil((BRANCH_LENGTH - 60) / divider);
  let { endX: nStartX, endY: nStartY } = getLineFromAngle(
    startX,
    startY,
    60,
    angle
  );
  for (let j = 0; j < nbOfLeaf; ++j) {
    let length = dLeaf * j;
    let { endX, endY } = getLineFromAngle(nStartX, nStartY, length, angle);
    let x = endX;
    let y = endY;
    if (!isRight) {
      x -= LEAF_WIDTH;
    }
    if (j % 2 === 0) {
      // bas
      y -= BRANCH_WIDTH / 2 + LEAF_HEIGHT * 1.5;
    }
    endPoints.push({ x, y, isRight });
  }
  return endPoints;
}

export function draw(
  canvas: HTMLCanvasElement,
  cameraZoom: number,
  cameraOffset: { x: number; y: number },
  rc: RoughCanvas,
  elements: Element[],
  images: { color: string; image: HTMLImageElement }[],
  selectedId?: string,
  mode?: string,
  nbOfBranches = NUMBER_OF_BRANCHES
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
  const endTreeX = 0;
  const baseTreeX = BASE_TREE_X;
  const baseTreeY = BASE_TREE_Y;
  ctx.lineCap = "round";
  ctx.translate(canvas.width / 2, canvas.height / 2);

  //if (mode === "edit") drawGrid(ctx);
  drawTronc(rc, baseTreeX, baseTreeY, endTreeX, END_TREE_Y);

  //Draw Branch
  let branchesEndpoint = getBranchEndpoint(baseTreeY, nbOfBranches);
  let k = 0;
  for (const { startX, endX, startY, endY } of branchesEndpoint) {
    drawBranch(rc, startX, startY, endX, endY, k);
    ++k;
  }

  if (mode === "edit") {
    for (const { endX, endY } of branchesEndpoint) {
      drawAddButton(canvas, endX, endY);
    }
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
        element,
        images.find((c) => c.color === element.color)!.image,
        element.id === selectedId
      );
    }
  }
}

export function mousePosToCanvasPos(context: CanvasRenderingContext2D, e: any) {
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
  fitWidth: number,
  fontColor: string,
  icon: string,
  iconSize = 22
) {
  const fillStyle = context.fillStyle;
  const textAlign = context.textAlign;
  const baseLine = context.textBaseline;
  const font = context.font;
  context.textAlign = "center";
  context.fillStyle = fontColor;
  context.textBaseline = "middle";
  context.font = "bold 12px comic sans ms";
  fitWidth = fitWidth || 0;

  if (fitWidth <= 0) {
    context.fillText(text, x, y);
    context.fillStyle = fillStyle;
    context.textAlign = textAlign;
    context.textBaseline = baseLine;
    context.font = font;
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
  if (icon) {
    context.font = `bold ${iconSize}px comic sans ms`;
    context.fillText(icon, x, y + lineHeight * (currentLine + 1) + 8);
  }
  context.fillStyle = fillStyle;
  context.textAlign = textAlign;
  context.textBaseline = baseLine;
  context.font = font;
}

export function getMousePos(canvas: HTMLCanvasElement, evt: any) {
  const rect = canvas.getBoundingClientRect();
  if (evt.touches && evt.touches.length == 1) {
    return {
      x: evt.touches[0].clientX - rect.left,
      y: evt.touches[0].clientY - rect.top,
    };
  }
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top,
  };
}

export function adjust(color: string, amount: number) {
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

// Need to run on client
export function generateTreeFromModel(
  canvas: HTMLCanvasElement,
  branches: string[],
  leafs: { text: string; icon: string }[][]
) {
  const context = canvas.getContext("2d");
  const branchesStartPoints = getBranchEndpoint(BASE_TREE_Y, branches.length);
  const coords = [];
  const textElements: Element[] = [];
  for (let i = 0; i < branchesStartPoints.length; ++i) {
    const { startX, startY, endX, endY } = branchesStartPoints[i];
    const nbOfLeaf = leafs[i].length;
    coords.push(
      computeBranchCoords(nbOfLeaf, startX, startY, getAngle(i), i % 2 === 0)
    );
    const isRight = i % 2 === 0;
    const newTextElem = updateText(context!, branches[i], {
      x: isRight ? endX + 20 : endX,
      y: endY - 10,
      type: "category",
      text: branches[i],
      id: guidGenerator(),
      seed: getRandomArbitrary(1, 100),
      color: "black",
      icon: "",
      height: 0,
      width: 0,
      font: "40px comic sans ms",
      angle: 0,
    });
    if (!isRight) {
      newTextElem.x -= newTextElem.width! + 20;
    }
    textElements.push(newTextElem);
  }

  let elements: Element[] = coords
    .map((arr, i) => {
      return arr.map(({ x, y, isRight }, j) => ({
        x,
        y,
        type: "leaf" as any,
        text: leafs[i][j].text,
        id: guidGenerator(),
        seed: getRandomArbitrary(1, 100),
        color: colors[3],
        icon: leafs[i][j].icon,
        height: LEAF_HEIGHT,
        width: LEAF_WIDTH,
        angle: !isRight ? (3 * Math.PI) / 2 : 0,
      }));
    })
    .flat();
  elements = elements.concat(textElements);

  return elements;
}

function makeid(length: number) {
  let result = "";
  let characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
function getMid(startX: number, startY: number, endX: number, endY: number) {
  let midX = startX + (endX - startX) * 0.5;
  let midY = startY + (endY - startY) * 0.5;
  return [midX, midY];
}
