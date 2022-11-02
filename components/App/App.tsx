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
const savedState = {
  selectedElement: null,
  sectors: [],
  mode: "edit",
  cameraZoom: 1,
  scaleMultiplier: 0.8,
  cameraOffset: { x: 0, y: 0 },
  isDragging: false,
  dragStart: { x: 0, y: 0 },
  initialPinchDistance: null,
  draggedElement: null,
  elements: [
    {
      x: 37.00254037844397,
      y: 558.5,
      type: "leaf",
      text: "Projets",
      id: "37fa0c95-df62-f946-f63e-567ef478e8e8",
      seed: 22.413950913261708,
      color: "#676767",
      icon: "",
      height: 80,
      width: 80,
      angle: 0,
    },
    {
      x: 55.54447374173145,
      y: 659.5212125853509,
      type: "leaf",
      text: "Activités physiques",
      id: "c99a2f60-2cc9-c653-cb09-b69275f839eb",
      seed: 58.35104497367157,
      color: "#676767",
      icon: "",
      height: 100,
      width: 94,
      angle: 0,
    },
    {
      x: 212.28329686673692,
      y: 412.4459461270676,
      type: "leaf",
      text: "Alimentation",
      id: "8ae885d7-5798-7f02-582a-6db0b1e49943",
      seed: 75.98722877807045,
      color: "#676767",
      icon: "",
      height: 98,
      width: 106,
      angle: 0,
    },
    {
      x: 149.92531117237104,
      y: 619.8484860745125,
      type: "leaf",
      text: "Médicaments",
      id: "4009a677-3174-76ca-2e49-72dcae08c281",
      seed: 85.6412101405559,
      color: "#676767",
      icon: "",
      height: 96,
      width: 103,
      angle: 0,
    },
    {
      x: -137.3597341956284,
      y: 266.06323415279024,
      type: "leaf",
      text: "Assistante sociale",
      id: "ac6bdd7b-de1e-ce16-b0d8-654d2d846dcb",
      seed: 3.0408627624543962,
      color: "#676767",
      icon: "",
      height: 101,
      width: 102,
      angle: 5.1115,
    },
    {
      x: -141.88527458993138,
      y: 424.6814887899961,
      type: "leaf",
      text: "Psychologue",
      id: "b8eebe40-7d9c-e666-7606-56f823f316ed",
      seed: 88.93156647065636,
      color: "#676767",
      icon: "",
      height: 106,
      width: 103,
      angle: 4.9901,
    },
    {
      x: -240.73466099101688,
      y: 210.19723063139068,
      type: "leaf",
      text: "Néphrologue",
      id: "77f1b125-1a02-7900-f281-0a8a9b303bd6",
      seed: 62.925700223585075,
      color: "#676767",
      icon: "",
      height: 107,
      width: 96,
      angle: 5.0873,
    },
    {
      x: -341.1281292110204,
      y: 338,
      type: "leaf",
      text: "Infirmière",
      id: "2ae11396-f2be-091b-2c3a-b1c7b981deab",
      seed: 1.1923845959709112,
      color: "#676767",
      icon: "",
      height: 98,
      width: 93,
      angle: 5.0144,
    },
    {
      x: -339.94737603694955,
      y: 167.7325720617976,
      type: "leaf",
      text: "Diététicien",
      id: "0e830b48-5db0-821d-78a9-f2cc308835e7",
      seed: 56.58209344029932,
      color: "#676767",
      icon: "",
      height: 104,
      width: 91,
      angle: 5.1358,
    },
    {
      x: 47.603686063863194,
      y: 61.413057862307085,
      type: "leaf",
      text: "Travail",
      id: "9352f6d0-44ec-aa63-f866-3faac9d662fe",
      seed: 91.42134486445663,
      color: "#676767",
      icon: "",
      height: 80,
      width: 80,
      angle: 0,
    },
    {
      x: 86.4050807568878,
      y: 179.40000000000003,
      type: "leaf",
      text: "Amis",
      id: "24f3fcc9-15cd-3624-ce7e-a795cf97db60",
      seed: 62.7689561691808,
      color: "#676767",
      icon: "",
      height: 80,
      width: 80,
      angle: 0,
    },
    {
      x: 238.86989170089237,
      y: -51.30481620099141,
      type: "leaf",
      text: "Couple",
      id: "ba8009f0-bd4e-2945-c154-716c49b0d2d1",
      seed: 58.50128342126369,
      color: "#676767",
      icon: "",
      height: 80,
      width: 80,
      angle: 0,
    },
    {
      x: 192.01016151377542,
      y: 124.99999999999997,
      type: "leaf",
      text: "Famille",
      id: "68d52a22-d4e8-599f-1c78-3f70d19baaaa",
      seed: 95.44683233661469,
      color: "#676767",
      icon: "",
      height: 80,
      width: 80,
      angle: 0,
    },
    {
      x: -133.3853916803306,
      y: -199.57142986894468,
      type: "leaf",
      text: "Dialyse péritonéale",
      id: "ac439209-d398-3739-307f-d802c45816af",
      seed: 43.677399154151516,
      color: "#676767",
      icon: "",
      height: 100,
      width: 101,
      angle: 4.71238898038469,
    },
    {
      x: -187.54789606407883,
      y: -64.06927366542598,
      type: "leaf",
      text: "Mémodialyse",
      id: "7ba87e8f-d9c8-2df7-b22d-95940057e47e",
      seed: 12.586314395170776,
      color: "#676767",
      icon: "",
      height: 103,
      width: 106,
      angle: 4.553,
    },
    {
      x: -259.38778211669046,
      y: -275.66406254406803,
      type: "leaf",
      text: "Traitement conservateur",
      id: "f1355609-73bd-205c-23fe-ebe074a9c269",
      seed: 92.89395276737373,
      color: "#676767",
      icon: "",
      height: 106,
      width: 106,
      angle: 4.71238898038469,
    },
    {
      x: -287.3422123213444,
      y: -120.19999999999996,
      type: "leaf",
      text: "Greffe",
      id: "42088386-da7f-73b4-6983-173113079408",
      seed: 99.3347190502882,
      color: "#676767",
      icon: "",
      height: 80,
      width: 80,
      angle: 4.71238898038469,
    },
    {
      x: 42.047404107115014,
      y: -411.2999999999999,
      type: "leaf",
      text: "",
      id: "5892cd92-14dd-7d74-626b-d1ddfb9169ef",
      seed: 19.288485611998922,
      color: "#9ed36a",
      icon: "",
      height: 80,
      width: 80,
      angle: 0,
    },
    {
      x: 188.68993184473274,
      y: -355.8682933637176,
      type: "leaf",
      text: "",
      id: "6901a6af-e09c-54c3-6dd7-e61edd0a1533",
      seed: 57.49772761528651,
      color: "#9ed36a",
      icon: "",
      height: 80,
      width: 80,
      angle: 0,
    },
    {
      x: 144.32757763037023,
      y: -482.10975646064924,
      type: "leaf",
      text: "",
      id: "92018fc1-c199-de82-13f9-76ea5b4d241f",
      seed: 79.85095594967143,
      color: "#9ed36a",
      icon: "",
      height: 80,
      width: 80,
      angle: 0,
    },
    {
      x: 324.8101615137756,
      y: 413.8,
      type: "category",
      text: "Mon quotidien",
      id: "e18f58a1-fef3-9421-fba7-e84cda3ab8e2",
      seed: 33.815403924994456,
      color: "#676767",
      icon: "",
      height: 43,
      width: 259.4921875,
      font: "40px comic sans ms",
      angle: 0,
      actualBoundingBoxAscent: 32,
    },
    {
      x: -608.6917453987903,
      y: 169.28370722997028,
      type: "category",
      text: "Mon parcours\n   de soins",
      id: "fcd4edaa-2a54-6c95-b740-1db6048e77c3",
      seed: 40.69743364776008,
      color: "#676767",
      icon: "",
      height: 77,
      width: 251.38671875,
      font: "40px comic sans ms",
      angle: 0,
      actualBoundingBoxAscent: 30,
    },
    {
      x: 340.8101615137756,
      y: -87.39999999999989,
      type: "category",
      text: "Ma vie\nsociale",
      id: "bd0d9b46-ce24-9c71-2801-7fa3bc84d4e6",
      seed: 20.993982017938457,
      color: "#676767",
      icon: "",
      height: 67,
      width: 125.60546875,
      font: "40px comic sans ms",
      angle: 0,
      actualBoundingBoxAscent: 30,
    },
    {
      x: -573.4703177637755,
      y: -284.79999999999995,
      type: "category",
      text: "Mes reins \nfatiguent",
      id: "3a745b4b-6535-3b51-d13d-3f7fb94970f1",
      seed: 25.563496973941554,
      color: "#676767",
      icon: "",
      height: 77,
      width: 193.359375,
      font: "40px comic sans ms",
      angle: 0,
      actualBoundingBoxAscent: 32,
    },
    {
      id: "273b2378-20bd-3729-d585-04bf3e9ae5f9",
      x: 309.20000000000005,
      y: 46.19999999999993,
      color: "#676767",
      seed: 5473.239555189746,
      text: "Loisirs",
      icon: "",
      type: "leaf",
      width: 80,
      height: 80,
    },
    {
      id: "226adbbe-9228-413a-b5fc-5c61160bbeef",
      x: -245.85697875488177,
      y: 381.38577515172057,
      color: "#676767",
      seed: 1771.5225767814243,
      text: "Mes bilans biologiques",
      icon: "",
      type: "leaf",
      width: 108,
      height: 114,
      angle: 4.8869,
    },
    {
      id: "1508652b-5d35-0ee9-6be5-610ff9ca9d48",
      x: 262.60600394256846,
      y: 560.658605749132,
      color: "#676767",
      seed: 4036.0311971166807,
      text: "Poids",
      icon: "",
      type: "leaf",
      width: 80,
      height: 80,
    },
    {
      id: "c3fd8557-f2e3-2c8a-6ef7-169fef53a202",
      x: 127.66054716399242,
      y: 493.0707261117914,
      color: "#676767",
      seed: 8905.356546399338,
      text: "Tension artérielle",
      icon: "",
      type: "leaf",
      width: 80,
      height: 80,
    },
    {
      id: "afc369eb-5dc3-d39d-9a59-f91e971a02cc",
      x: -458.8531327047661,
      y: 274.7343498344899,
      color: "#676767",
      seed: 2843.219373071966,
      text: "Association de patients",
      icon: "",
      type: "leaf",
      width: 113,
      height: 126,
      angle: 4.9416,
    },
    {
      id: "720fd322-4980-11b0-e669-92ae0bb5f9aa",
      x: 355.52912845011775,
      y: 507.9190881126956,
      color: "#676767",
      seed: 6335.093711221045,
      text: "Finances",
      icon: "",
      type: "leaf",
      width: 80,
      height: 80,
    },
    {
      id: "aab0fe8f-a940-3029-465d-c20fb859a34c",
      x: 142.3365112878747,
      y: 2.378145041011493,
      color: "#676767",
      seed: 2058.4767297360236,
      text: "Sexualité",
      icon: "",
      type: "leaf",
      width: 80,
      height: 80,
    },
  ],
  downPoint: { x: 0, y: 0 },
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
const LEAF_WIDTH = 80;
const LEAF_HEIGHT = 80;
const colors = ["#676767", "#ff7f00", "#9ed36a"];

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
  printAtWordWrap(
    ctx,
    text,
    x + width / 2,
    y + height / 2 - 10,
    15,
    width - 15
  );
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
  rc.line(startX, startY, endX, endY, {
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
//const NUMBER_OF_BRANCHES = Math.round(getRandomArbitrary(4, 8));
const NUMBER_OF_BRANCHES = 5;
//const leafNumbers = getLeafNumbers(NUMBER_OF_BRANCHES);
const leafNumbers = [4, 5, 4, 6, 3];
const BRANCH_LENGTH = 400;
const END_TREE_Y = -100 - LEAF_HEIGHT * NUMBER_OF_BRANCHES;
const BASE_TREE_X = 0;
const BASE_TREE_Y = 800;

let MAX_ZOOM = 5;
let MIN_ZOOM = 0.1;
let SCROLL_SENSITIVITY = 0.0005;
let INITIAL_ZOOM = 1;

//TODO hauteur d'arbre fixe pour avoir les mêmes rendu peut importe l'écran?

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
    color: "black",
  };
  let text = prompt("What text do you want?");
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

function getBranchEndpoint(height: number) {
  const baseTreeY = BASE_TREE_Y;
  const xys = [];
  //Draw Branch
  let startX = BASE_TREE_X;
  let startY = baseTreeY - 100;
  let spaceBetweenBranches =
    (height + Math.abs(END_TREE_Y) - 100) / NUMBER_OF_BRANCHES;
  for (let i = 0; i < NUMBER_OF_BRANCHES; ++i) {
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
      y -= BRANCH_WIDTH / 2 + LEAF_HEIGHT * 1.5;
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
  const endTreeX = 0;
  const baseTreeX = BASE_TREE_X;
  const baseTreeY = BASE_TREE_Y;
  ctx.lineCap = "round";
  ctx.translate(canvas.width / 2, canvas.height / 2);

  if (mode === "edit") drawGrid(ctx);
  drawTronc(rc, baseTreeX, baseTreeY, endTreeX, END_TREE_Y);

  //Draw Branch
  let branchesEndpoint = getBranchEndpoint(baseTreeY);
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
  }
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
  const textAlign = context.textAlign;
  const font = context.font;
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
  context.textAlign = textAlign;
  context.font = font;
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

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [width, height /*devicePixelRatio*/] = useDeviceSize();
  const [roughCanvas, setRoughCanvas] = useState<RoughCanvas | null>(null);
  const [appState, setAppState] = useState<AppState>(() => {
    return savedState as AppState;
    /*return {
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
    };*/
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

  const buttonEndpoints = useMemo(() => getBranchEndpoint(BASE_TREE_Y), []);

  useEffect(() => {
    /*
    const branchesStartPoints = buttonEndpoints;
    const coords = [];
    const textElements: Element[] = [];
    const sectors = new Array(branchesStartPoints.length)
      .fill(0)
      .map(() => makeid(getRandomArbitrary(4, 15)));
    for (let i = 0; i < branchesStartPoints.length; ++i) {
      const { startX, startY, endX, endY } = branchesStartPoints[i];
      const nbOfLeaf = leafNumbers[i];
      coords.push(
        computeBranchCoords(nbOfLeaf, startX, startY, getAngle(i), i % 2 === 0)
      );
      const [x, y] = getMid(startX, startY, endX, endY);
      const isRight = i % 2 === 0;
      const newTextElem = updateText(
        canvasRef.current!.getContext("2d")!,
        sectors[i],
        {
          x: isRight ? endX + 20 : endX,
          y: endY - 10,
          type: "category",
          text: sectors[i],
          id: guidGenerator(),
          seed: getRandomArbitrary(1, 100),
          color: "black",
          icon: "",
          height: 0,
          width: 0,
          font: "40px comic sans ms",
          angle: 0,
        }
      );
      if (!isRight) {
        newTextElem.x -= newTextElem.width! + 20;
      }
      textElements.push(newTextElem);
    }
    let elements: Element[] = coords.flat().map(({ x, y, isRight }, i) => ({
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

    elements = elements.concat(textElements);
    setAppState((prev) => ({
      ...prev,
      elements,
    }));
    */
  }, [buttonEndpoints]);

  const focusRef = useCallback((node: HTMLTextAreaElement) => {
    node?.focus();
    node?.select();
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
                      icon: "",
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
                    color
                    <input
                      value={
                        elements.find((el) => el.id === selectedElement.id)
                          ?.color!
                      }
                      onChange={(e) => {
                        setAppState((prev) => ({
                          ...prev,
                          elements: prev.elements.map((el) => {
                            if (el.id === selectedElement.id) {
                              return { ...el, color: e.target.value };
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
                  key={selectedElement.id}
                  ref={focusRef}
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
                      icon: "",
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
          Switch to {appState.mode === "edit" ? "view" : "developer"} mode
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
