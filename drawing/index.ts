import { RoughCanvas } from "roughjs/bin/canvas";

type MyPoint = {
  x: number;
  y: number;
};

export type AppState = {
  cameraZoom: number;
  scaleMultiplier: number;
  cameraOffset: MyPoint;
  isDragging: boolean;
  dragStart: MyPoint;
  initialPinchDistance: null | number;
  elements: Element[];
  draggedElement: Element | null;
  downPoint?: MyPoint;
  selectedElement: Element | null;
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
  type: "leaf" | "category";
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
/**
 * The rotate function takes in four coordinates (x1, y1, x2, y2) and an angle,
 * and returns an array of two rotated coordinates (x, y).
 * It uses a mathematical formula to perform the rotation of a point around another point (x2,y2)
 * by the given angle.
 * @param x1
 * @param y1
 * @param x2
 * @param y2
 * @param angle
 * @returns
 */
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
  buttons: { endX: number; endY: number }[],
  buttonWidth = BUTTON_SIZE,
  buttonHeight = BUTTON_SIZE
) {
  for (let { endX: x1, endY: y1 } of buttons) {
    x1 -= buttonWidth / 2;
    y1 -= buttonHeight / 2;
    let x2 = x1 + buttonWidth;
    let y2 = y1 + buttonHeight;
    let hit = x > x1 && x < x2 && y > y1 && y < y2;
    if (hit) return { x1, x2 };
  }
}
/*
The hitTest function takes in a set of coordinates, 
which represent a pointer (e.g. a cursor on a screen), 
and an element object, which represents a shape on the screen. 
The function needs to determine whether the pointer is within the bounds of the shape.
One complication is that the shape may be rotated by some angle. 
To correctly check if the pointer is within the bounds of the shape, 
the function needs to reverse the rotation of the pointer so that it is 
in the same frame of reference as the shape.
The rotate function is used to perform this reverse rotation by passing in 
the pointer's coordinates, the center of rotation (which is the center of the shape) 
and the negation of the angle of rotation of the shape. 
This gives the pointer's coordinates in the frame of reference of the unrotated shape.
*/
export function hitTest(x: number, y: number, element: Element) {
  if (element.type === "leaf") {
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

export const LEAF_WIDTH = 130;
export const LEAF_HEIGHT = 130;
type Green = "#9ed36a";
type White = "#fff";
type Orange = "#ff7f00";
type Gray = "#676767";
type Color = Green | White | Orange | Gray;
const green: Color = "#9ed36a";
export const white: Color = "#fff";
const orange: Color = "#ff7f00";
const gray: Color = "#676767";
type Colors = Color[];
export const colors: Colors = ["#fff", "#9ed36a", "#ff7f00", "#676767"];
const FONT_TEXT_LEAF = "bold 16px comic sans ms";

export const colorsMeaning: Record<Color, string> = {
  [white]: "Je n'ai pas abordé le sujet",
  [green]: "Je souhaite en parler",
  [orange]: "Je ne suis pas à l'aise pour en parler",
  [gray]: "Je préfère éviter le sujet",
};

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
export const DELETE_BUTTON_SIZE = 190;
export const DELETE_BUTTON_HEIGHT = 80;

const SPACE_BETWEEN_LINES = 3;
export const NUMBER_OF_BRANCHES = 4;
//const leafNumbers = getLeafNumbers(NUMBER_OF_BRANCHES);
const BRANCH_LENGTH = 600;
//TODO replace 5 with dynamic nb of branches
const END_TREE_Y = -100 - LEAF_HEIGHT * 5;
export const BASE_TREE_X = 0;
export const BASE_TREE_Y = 800;

export const MAX_ZOOM = 5;
export const MIN_ZOOM = 0.1;
export const SCROLL_SENSITIVITY = 0.0005;
export const SCROLL_SENSITIVITY_TOUCHPAD = 0.003;

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

function drawDeleteButton(
  canvas: HTMLCanvasElement,
  rc: RoughCanvas,
  x: number,
  y: number
) {
  const ctx = canvas.getContext("2d")!;
  const textAlign = ctx.textAlign;
  const textColor = ctx.fillStyle;
  const textBaseline = ctx.textBaseline;
  const font = ctx.font;
  ctx.fillStyle = "#E53E3E";
  ctx.fillRect(
    x - DELETE_BUTTON_SIZE / 2,
    y - DELETE_BUTTON_HEIGHT / 2,
    DELETE_BUTTON_SIZE,
    DELETE_BUTTON_HEIGHT
  );
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#eeee";
  ctx.font = "20px comic sans ms";
  ctx.fillText("Supprimer branche", x, y);
  ctx.textAlign = textAlign;
  ctx.textBaseline = textBaseline;
  ctx.fillStyle = textColor;
  ctx.font = font;
}

export function getRandomArbitrary(min: number, max: number) {
  return Math.random() * (max - min) + min;
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

export const deleteButtonOffsetX = (i: number) => (i % 2 === 0 ? 200 : -200);
export const deleteButtonOffsetY = 100;

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
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(cameraZoom, cameraZoom);
  ctx.translate(
    -canvas.width / 2 + cameraOffset.x,
    -canvas.height / 2 + cameraOffset.y
  );
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Drawing
  const endTreeX = 0;
  const baseTreeX = BASE_TREE_X;
  const baseTreeY = BASE_TREE_Y;
  ctx.lineCap = "round";

  // draw everything from center of the screen
  // to keep coordinates absolute across windows size
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
    let i = 0;
    for (const { endX, endY } of branchesEndpoint) {
      drawAddButton(canvas, endX, endY);
      drawDeleteButton(
        canvas,
        rc,
        endX + deleteButtonOffsetX(i),
        endY + deleteButtonOffsetY
      );
      i++;
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

/**
 * This gives the mouse position in the untransformed coordinate system
 * of the canvas and returns an object with the new x and y position.
 * @param context
 * @param e
 * @returns
 */
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

/**
 * This function is useful to convert the coordinates of a point on the canvas
 * to the corresponding coordinates on the screen, taking into account
 * the current transformation matrix.
 * @param ctx
 * @param xy
 * @returns
 */
export function canvasPosToScreenPos(
  ctx: CanvasRenderingContext2D,
  xy: MyPoint
) {
  const transform = ctx.getTransform();
  // Destructure to get the x and y values out of the transformed DOMPoint.
  const { x, y } = transform.transformPoint(new DOMPoint(xy.x, xy.y));
  return { x, y };
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
  context.font = FONT_TEXT_LEAF;
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
      words = words.splice(idx - 1);
      if (words.length > 0) {
        currentLine++;
      }
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

/*
function measureRequiredWidth(
  ctx: CanvasRenderingContext2D,
  leafWidth: number,
  text: string,
  fontText: string
) {
  const words = text.split(" ");
  let maxWidth = 0;
  const font = ctx.font;
  ctx.font = fontText;
  for (const word of words) {
    const { width } = ctx.measureText(word);
    if (width > maxWidth) maxWidth = width;
  }
  ctx.font = font;
  return { needMoreSpace: maxWidth > leafWidth, neededSpace: maxWidth };
}
*/

// Need to run on client
// Branches and leafs are associated by their index
// Leafs for branches 0 are at leafs[0]
// example: leafs[0][3] is the third leaf of branches[0]
export function generateTreeFromModel(
  canvas: HTMLCanvasElement,
  branches: string[],
  leafs: { text: string; icon: string; categoryTitle: string }[][]
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

  const getAngleForLeaf = (index: number, isRight: boolean) => {
    if (!isRight) {
      if (index % 2 !== 0) {
        return 3.6;
      }
      return (3 * Math.PI) / 2;
    }
    if (index % 2 !== 0) {
      return 1;
    }
    return 0;
  };

  // coords is a 2D array, each array contains all the xy of the leafs.
  // order needs to be preserved.
  let elements: Element[] = coords
    .map((arr, i) => {
      return arr.map(({ x, y, isRight }, j) => {
        let width = LEAF_WIDTH;
        return {
          x,
          y,
          type: "leaf" as any,
          text: leafs[i][j].text,
          id: guidGenerator(),
          seed: getRandomArbitrary(1, 100),
          color: white,
          icon: leafs[i][j].icon,
          height: width,
          width,
          angle: getAngleForLeaf(j, isRight),
          categoryId: textElements.find(
            (te) => te.text === leafs[i][j].categoryTitle
          )?.id,
        };
      });
    })
    .flat();
  elements = elements.concat(textElements);

  return elements;
}

// Todo
// Factorise with generateTreeFromModel
// dont have the time yet
export function updateTreeFromModel(
  canvas: HTMLCanvasElement,
  branches: { text: string; id: string }[],
  leafs: { text: string; icon: string; categoryId?: string; id: string }[][]
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
    const newTextElem = updateText(context!, branches[i].text, {
      x: isRight ? endX + 20 : endX,
      y: endY - 10,
      type: "category",
      text: branches[i].text,
      id: branches[i].id,
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

  const getAngleForLeaf = (index: number, isRight: boolean) => {
    if (!isRight) {
      if (index % 2 !== 0) {
        return 3.6;
      }
      return (3 * Math.PI) / 2;
    }
    if (index % 2 !== 0) {
      return 1;
    }
    return 0;
  };

  // coords is a 2D array, each array contains all the xy of the leafs.
  // order needs to be preserved.
  let elements: Element[] = coords
    .map((arr, i) => {
      return arr.map(({ x, y, isRight }, j) => {
        let width = LEAF_WIDTH;
        return {
          x,
          y,
          type: "leaf" as any,
          text: leafs[i][j].text,
          id: leafs[i][j].id,
          seed: getRandomArbitrary(1, 100),
          color: white,
          icon: leafs[i][j].icon,
          height: width,
          width,
          angle: getAngleForLeaf(j, isRight),
          categoryId: leafs[i][j].categoryId,
        };
      });
    })
    .flat();
  elements = elements.concat(textElements);

  return elements;
}

export function getClosestPoint(points: Element[], pointer: MyPoint) {
  let closestPoint;
  let closestDistance = Infinity;
  for (let point of points) {
    let distance = Math.sqrt(
      Math.pow(pointer.x - point.x, 2) + Math.pow(pointer.y - point.y, 2)
    );
    if (distance < closestDistance) {
      closestDistance = distance;
      closestPoint = point;
    }
  }
  return closestPoint;
}
