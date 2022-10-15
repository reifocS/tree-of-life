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
//TODO
//Remove magic variables (tree size for example)

const dState = '{"cameraZoom":1,"scaleMultiplier":0.8,"cameraOffset":{"x":0, "y":0},"isDragging":false,"dragStart":{"x":351.43799991453756,"y":-72.44875229308384},"initialPinchDistance":null,"draggedElement":null,"mode":"drag","elements":[{"x":675.2075242662087,"y":85.40465041041038,"seed":905.5909808585167,"color":"#82c91e","id":"f288ff26-c9c7-d869-2446-45567796dec9","text":"Loisirs","icon":"💪","type":"circle","width":100},{"id":"54d5a69c-7f47-42c1-b477-eb82f2dbd790","x":537.2757893463547,"y":99.65807589390477,"color":"#82c91e","seed":8811.258671040496,"text":"Médicaments","icon":"🦍","type":"circle","width":100},{"id":"d0cef24f-260b-3634-5b81-0d1bdf6dc051","x":481.66417374981467,"y":259.89110600829713,"color":"orange","seed":3333.9280333845422,"text":"Tension artérielle","icon":"🦍","type":"circle","width":100},{"id":"b76b7ac7-d548-1e11-3246-b7e38151f374","x":668.677165395256,"y":277.20712375324536,"color":"orange","seed":3753.0185677539907,"text":"Alimentation","icon":"🦍","type":"circle","width":100},{"id":"b52e11be-5747-46fe-f1c5-db9afdc6a6ce","x":1023.1178768022256,"y":244.33862761349334,"color":"orange","seed":8184.468572435464,"text":"","icon":"🦍","type":"circle","width":100},{"id":"ebf93e96-2d9d-b5ed-47eb-d45485e10148","x":891.3189688777178,"y":47.60937534382356,"color":"orange","seed":7063.317967328478,"text":"","icon":"🦍","type":"circle","width":100},{"id":"5e289118-9cef-c57b-c8b9-5b88951070bd","x":1061.8822614859046,"y":61.17690998311116,"color":"orange","seed":7912.385849210267,"text":"","icon":"🦍","type":"circle","width":100},{"id":"8c67694b-f56f-9746-2fdd-48e603deacd4","x":1137.4728116190781,"y":279.2265738288042,"color":"orange","seed":2862.52223786426,"text":"","icon":"🦍","type":"circle","width":100},{"id":"d6b27aaf-e2fc-be7c-6bd6-4e02ab09d555","x":855.461913045315,"y":287.9485603826319,"color":"orange","seed":13.836951464031252,"text":"","icon":"🦍","type":"circle","width":100},{"id":"9eb9ec83-502b-a665-6b8a-8d5c3bb5efad","x":568.6054663860921,"y":449.7898664369908,"color":"#82c91e","seed":5190.185108611817,"text":"","icon":"🦍","type":"circle","width":100},{"id":"6473d1cb-a83f-8afb-1d8b-4006b7b731ec","x":414.517037268469,"y":474.01760686429003,"color":"orange","seed":8019.879358396649,"text":"","icon":"🦍","type":"circle","width":100},{"id":"80f4fc52-e7d6-a12a-ef52-23dc2911ec89","x":682.9604012029445,"y":613.5693917255336,"color":"#82c91e","seed":7571.643283927932,"text":"","icon":"🦍","type":"circle","width":100},{"id":"b74ab532-ed86-260d-3ff9-883301194104","x":1007.612122928754,"y":426.53123562678354,"color":"#82c91e","seed":9384.01623454882,"text":"","icon":"🦍","type":"circle","width":100},{"id":"cc26bed7-e4a7-2f56-acaf-29bec2e958c0","x":1171.391648217297,"y":472.07938763010605,"color":"#82c91e","seed":5477.656705370557,"text":"","icon":"🦍","type":"circle","width":100}]}'

type Point = {
  x: number;
  y: number
}

export type AppState = {
  cameraZoom: number;
  scaleMultiplier: number;
  cameraOffset: Point;
  isDragging: boolean;
  dragStart: Point;
  initialPinchDistance: null | number;
  elements: Element[];
  draggedElement: Element | null;
  mode: string;
  downPoint?: Point;
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

const sectors = [{
  color: "red",
  text: "Mes reins fatiguent"
}, {
  color: "gray",
  text: "Mes ressources"
}, {
  color: "red",
  text: "Ma vie sociale"
}, {
  color: "red",
  text: "Mon parcours de soins"
}, {
  color: "gray",
  text: "Mes racines"
}, {
  color: "red",
  text: "Mon quotidien"
},
]

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
  const drawHead = () => {
    const length = rad / 2;
    const endX = x + length * Math.cos(PI / 2);
    const endY = y - length * Math.sin(PI / 2);
    rc.circle(endX, endY, 200, {
      fill: "red",
      seed: 2,
      fillStyle: "solid"
    })
    rc.circle(endX - 40, endY - 60, 15, {
      fill: "black",
      seed: 2,
      fillStyle: "solid"
    })
    rc.circle(endX + 40, endY - 60, 15, {
      fill: "black",
      seed: 2,
      fillStyle: "solid"
    })
  }
  drawHead();
  const drawSector = (i: number) => {
    const ang = arc * i;
    ctx.save();
    // COLOR
    rc.arc(x, y, rad, rad, ang, ang + arc, true, {
      fill: sectors[i].color,
      seed: 2,
      stroke: "black",
      strokeWidth: 0.2,
      fillStyle: "solid"
    });
    // TEXT
    const length = rad / 4;
    const endX = x + length * Math.cos(-(ang + arc / 2));
    const endY = y - length * Math.sin(-(ang + arc / 2));
    const font = ctx.font;
    ctx.fillStyle = "black";
    ctx.font = `bold ${25}px ${"comic sans ms"}`;
    printAt(ctx, sectors[i].text, endX, endY, 40, 300);
    ctx.font = font;
  };
  sectors.forEach((_, i) => drawSector(i));


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

function drawIt(
  rc: RoughCanvas,
  canvas: HTMLCanvasElement,
  elements: Element[],
  selectedId?: string
) {
  const ctx = canvas.getContext("2d")!;
  let radius = 2000;
  //drawGrid(ctx);

  drawCircle(ctx, sectors, canvas.width / 2, canvas.height / 2, radius, rc);

  ctx.fillStyle = "black";
  let i = 0;
  for (const element of elements) {
    if (element.type === "category") {
      drawCategory(element, ctx);
    } else {
      drawSector(element, ctx, rc, i++, element.id === selectedId);
    }
  }

  rc.circle(canvas.width / 2, canvas.height / 2, 20, {
    fill: "red",
    fillStyle: "solid",
    seed: 2
  })

  const { x, y } = geometricMedian(elements.map(e => ({ x: e.x, y: e.y })), elements.length)

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
  context.textAlign = "center";

  fitWidth = fitWidth || 0;

  if (fitWidth <= 0) {
    context.fillText(text, x, y);
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
      return;
    }
  }
  context.fillText(text, x, y);
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
  const [appState, setAppState] = useState<AppState>(() => JSON.parse(dState));

  useKeyboard(setAppState);
  const { cameraZoom, elements, cameraOffset, isDragging, draggedElement } =
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
      draggedElement?.id
    );
  }, [
    cameraOffsetX,
    cameraOffsetY,
    cameraZoom,
    elements,
    height,
    roughCanvas,
    width,
    draggedElement
  ]);

  function setMode(m: string) {
    setAppState((prev) => ({ ...prev, mode: m }));
  }
  const handlePointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = mousePosToCanvasPos(ctx, e);

    const el = elements.find((el) =>
      hitTest(x, y, el)
    );
    if (el && appState.mode === "drag") {
      setAppState((prev) => ({
        ...prev,
        draggedElement: el,
        downPoint: { x, y }
      }));
      return;
    } else if (!el && appState.mode === "drag") {
      setAppState((prev) => ({
        ...prev,
        isDragging: true,
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
      const canvas = canvasRef.current!;
      const context = canvas.getContext("2d")!;
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
      context.restore();
      setAppState((prev) => ({ ...prev, elements: newElems }));
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
      </div>d
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
        <input type="checkbox"
          onChange={() => setHide(prev => !prev)}
          checked={hide}></input>
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


