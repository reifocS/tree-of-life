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
      y: 492.5,
      type: "leaf",
      text: "Mes bilans biologiques",
      id: "b2181630-2328-3d6d-d3cb-ac278f2dda82",
      seed: 84.90601359235511,
      color: "#fff",
      icon: "📝",
      height: 110,
      width: 110,
      angle: 0,
      fontColor: "black",
    },
    {
      x: 116.37334169774857,
      y: 645.8891627741971,
      type: "leaf",
      text: "Psychologue",
      id: "694b90e9-2b4a-bef4-9d4b-64eb1f7847af",
      seed: 83.31349390401876,
      color: "#fff",
      icon: "👥",
      height: 110,
      width: 110,
      angle: 1.2133,
      fontColor: "black",
    },
    {
      x: 161.0807251039056,
      y: 429.5,
      type: "leaf",
      text: "Assistance sociale",
      id: "4d4f1538-200c-ea1c-6057-e5bb2b400ce5",
      seed: 74.27989831740231,
      color: "#fff",
      icon: "🧑",
      height: 110,
      width: 110,
      angle: 0,
      fontColor: "black",
    },
    {
      x: 218.10337980039077,
      y: 587.8152712903284,
      type: "leaf",
      text: "Nephrologue",
      id: "c3c00b04-55d4-8a58-3915-2ea1500ca17e",
      seed: 75.62922866959165,
      color: "#fff",
      icon: "🧑‍⚕️",
      height: 110,
      width: 110,
      angle: 1.1638,
      fontColor: "black",
    },
    {
      x: 270.19992598074487,
      y: 366.5,
      type: "leaf",
      text: "Infirimière",
      id: "fe53e2f9-efd0-d509-a13e-4b33a17c42df",
      seed: 92.15459050043543,
      color: "#fff",
      icon: "🧑‍⚕️",
      height: 110,
      width: 110,
      angle: 0,
      fontColor: "black",
    },
    {
      x: 324.7595264191645,
      y: 512.5,
      type: "leaf",
      text: "Diéteticien",
      id: "aa386c65-ab25-d2a8-5cca-0c28640c8c74",
      seed: 83.67064023542027,
      color: "#fff",
      icon: "🧑‍⚕️",
      height: 110,
      width: 110,
      angle: 1.1143,
      fontColor: "black",
    },
    {
      x: 379.31912685758414,
      y: 303.5,
      type: "leaf",
      text: "Association de patients",
      id: "561d2aa6-8bdb-367c-d6d2-f4c4fdb5fb63",
      seed: 55.828849688265535,
      color: "#fff",
      icon: "🧑‍🤝‍🧑",
      height: 110,
      width: 110,
      angle: 0,
      fontColor: "black",
    },
    {
      x: -161.96152422706632,
      y: 155,
      type: "leaf",
      text: "Hémodialyse",
      id: "b8be8996-997c-3703-6e02-d355c05d16cb",
      seed: 85.7230953335066,
      color: "#fff",
      icon: "🩺",
      height: 110,
      width: 110,
      angle: 4.71238898038469,
      fontColor: "black",
    },
    {
      x: -223.9102874396828,
      y: 303.46305425806565,
      type: "leaf",
      text: "Dialyse péritonéale",
      id: "e703eb6c-4adc-7d53-f775-66983ec78475",
      seed: 72.76722849161703,
      color: "#fff",
      icon: "🩺",
      height: 110,
      width: 110,
      angle: 3.4913,
      fontColor: "black",
    },
    {
      x: -271.0807251039056,
      y: 92,
      type: "leaf",
      text: "Greffe",
      id: "135924e4-f212-8754-4baf-a1bc6d0034bf",
      seed: 71.56457121446046,
      color: "#fff",
      icon: "🩺",
      height: 110,
      width: 110,
      angle: 4.71238898038469,
      fontColor: "black",
    },
    {
      x: -347.8078138649162,
      y: 233.0738914838687,
      type: "leaf",
      text: "Traitement conservateur",
      id: "ce312fec-7963-7cb2-c1ec-718a50b33303",
      seed: 65.41677684663816,
      color: "#fff",
      icon: "🩺",
      height: 110,
      width: 110,
      angle: 3.6152,
      fontColor: "black",
    },
    {
      x: 51.96152422706632,
      y: -182.5,
      type: "leaf",
      text: "Tension artérielle",
      id: "1e226507-6fba-90d3-a470-de2ea72dc97f",
      seed: 65.52261507892119,
      color: "#fff",
      icon: "🩺",
      height: 110,
      width: 110,
      angle: 0,
      fontColor: "black",
    },
    {
      x: 95.56222084223185,
      y: -11.842466397678201,
      type: "leaf",
      text: "Poids",
      id: "c9fbbdeb-8c6a-0df3-7b56-62932ad8584b",
      seed: 24.088641963948785,
      color: "#fff",
      icon: "⚖️",
      height: 110,
      width: 110,
      angle: 1.3371,
      fontColor: "black",
    },
    {
      x: 161.0807251039056,
      y: -245.5,
      type: "leaf",
      text: "Activités physiques",
      id: "15924c51-6b04-7ea6-0f59-a2796bd4cc46",
      seed: 46.48315443546134,
      color: "#fff",
      icon: "🏋️",
      height: 110,
      width: 110,
      angle: 0,
      fontColor: "black",
    },
    {
      x: 214.27046256441832,
      y: -83.06164426511894,
      type: "leaf",
      text: "Médicaments",
      id: "cda2bf1c-c211-bb16-ced1-e46307fc0dc7",
      seed: 5.475167029824293,
      color: "#fff",
      icon: "💊",
      height: 110,
      width: 110,
      angle: 1.3619,
      fontColor: "black",
    },
    {
      x: 289.28365493097294,
      y: -313.9794519116271,
      type: "leaf",
      text: "Alimentation",
      id: "77593e85-131e-ee9c-84d1-52efdcc767a6",
      seed: 71.34333344278149,
      color: "#fff",
      icon: "🥕",
      height: 110,
      width: 110,
      angle: 0,
      fontColor: "black",
    },
    {
      x: 334.3485672645117,
      y: -141.95205533139855,
      type: "leaf",
      text: "Projets",
      id: "affe4d4f-a371-e451-6b88-28d058f60ec7",
      seed: 76.60329478252463,
      color: "#fff",
      icon: "💡",
      height: 110,
      width: 110,
      angle: 1.1885,
      fontColor: "black",
    },
    {
      x: 430.00405704013417,
      y: -203.00685371746812,
      type: "leaf",
      text: "Finances",
      id: "d92e1e38-6519-9ea2-1669-e723bde5a273",
      seed: 73.8150519321184,
      color: "#fff",
      icon: "💶",
      height: 110,
      width: 110,
      angle: 1.3619,
      fontColor: "black",
    },
    {
      x: -159.22179827125274,
      y: -513.1506851104662,
      type: "leaf",
      text: "Loisirs",
      id: "27023a94-4483-65b0-a0b0-02502bf31873",
      seed: 73.87496010158564,
      color: "#fff",
      icon: "🎲",
      height: 110,
      width: 110,
      angle: 5.0513,
      fontColor: "black",
    },
    {
      x: -217.89098764339263,
      y: -369.89041106627974,
      type: "leaf",
      text: "Famille",
      id: "eb2d5af0-112f-bc8b-f310-c8f88ee11af9",
      seed: 6.902064260125903,
      color: "#fff",
      icon: "👪",
      height: 110,
      width: 110,
      angle: 3.5161,
      fontColor: "black",
    },
    {
      x: -271.0807251039056,
      y: -583,
      type: "leaf",
      text: "Amis",
      id: "18ae0c82-fa76-8b7a-bab5-403126fc6176",
      seed: 41.65012222404828,
      color: "#fff",
      icon: "🧑‍🤝‍🧑",
      height: 110,
      width: 110,
      angle: 4.977,
      fontColor: "black",
    },
    {
      x: -325.64032554232523,
      y: -437,
      type: "leaf",
      text: "Couple",
      id: "a085d230-f6e8-2c8c-8fdb-3f7a48b6045f",
      seed: 99.7961860878947,
      color: "#fff",
      icon: "💑",
      height: 110,
      width: 110,
      angle: 3.6894,
      fontColor: "black",
    },
    {
      x: -380.19992598074487,
      y: -646,
      type: "leaf",
      text: "Travail",
      id: "62d97982-07ba-cb70-6c62-3fa90a129a7c",
      seed: 84.55621502543795,
      color: "#fff",
      icon: "💼",
      height: 110,
      width: 110,
      angle: 4.9523,
      fontColor: "black",
    },
    {
      x: -445.7184302424186,
      y: -495.8904110662797,
      type: "leaf",
      text: "Sexualité",
      id: "238e2a85-6681-e9b0-52d9-3d6ebf91f171",
      seed: 83.4140672522203,
      color: "#fff",
      icon: "♥️",
      height: 110,
      width: 110,
      angle: 3.6399,
      fontColor: "black",
    },
    {
      x: 465.76780426662066,
      y: 405.5612235891166,
      type: "category",
      text: "Parcours \n     de \n   soins",
      id: "feac5aec-40fc-74ca-bded-9220a1d5e660",
      seed: 58.8124628647302,
      color: "#fff",
      icon: "",
      height: 100.921875,
      width: 173.5625,
      font: "40px comic sans ms",
      angle: 0,
      actualBoundingBoxAscent: 31.1328125,
    },
    {
      x: -531.4718779933107,
      y: 166.27551187200626,
      type: "category",
      text: "    Mes \n   reins \nfatiguent",
      id: "99b7e8ec-f65b-2210-2289-b3f0589a256b",
      seed: 7.035306981271768,
      color: "#fff",
      icon: "",
      height: 110.47265625,
      width: 174.6041717529297,
      font: "40px comic sans ms",
      angle: 0,
      actualBoundingBoxAscent: 31.23046875,
    },
    {
      x: 455.75242784803294,
      y: -298.01369698371116,
      type: "category",
      text: "    Mon \nquotidien",
      id: "53237f1e-cc7b-0318-1552-391ec2d66557",
      seed: 98.1161170754753,
      color: "#fff",
      icon: "",
      height: 76.57421875,
      width: 170.25,
      font: "40px comic sans ms",
      angle: 0,
      actualBoundingBoxAscent: 31.1328125,
    },
    {
      x: -592.3069063044284,
      y: -564.8469385753592,
      type: "category",
      text: "Ma vie \nsociale",
      id: "8b08bb5d-ac53-3987-e4bd-c5f2efe58959",
      seed: 22.271414836113458,
      color: "#fff",
      icon: "",
      height: 67.296875,
      width: 132.2916717529297,
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

export const LEAF_WIDTH = 110;
export const LEAF_HEIGHT = 110;
export const colors = ["#fff", "#9ed36a", "#ff7f00", "#676767"];

export const RC_WIDTH = 100;

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
  let text = prompt("Quel texte doit on écrire ?");
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
  //TODO update leaf size accordingly
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
      color: "#fff",
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
