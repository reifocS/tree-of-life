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
  cameraZoom: number
) {
  const context = canvas.getContext("2d")!;
  // Destructure to get the x and y values out of the transformed DOMPoint.
  //TODO Change mouse coord to canvas coord instead of the opposite
  if (element.type === "category") {
    const { x: newX, y: newY } = toCanvasCoord(element.x, element.y, context);
    return (
      x >= newX &&
      x <= newX + element.width! * cameraZoom &&
      y >= newY &&
      y <= newY + element.height! * cameraZoom
    );
  } else if (element.type === "circle") {
    const { x: newX, y: newY } = toCanvasCoord(element.x, element.y, context);
    const dx = x - newX;
    const dy = y - newY;
    const r = (element.width! * cameraZoom) / 2;
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
const sectors = ["gray", "orange", "blue", "yellow", "green", "purple"];

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
    rc.arc(x, y, rad, rad, ang, ang + arc, true, {
      fill: sectors[i],
      seed: 2,
    });
    // TEXT
    const length = rad / 4;
    const endX = x + length * Math.cos(-(ang + arc / 2));
    const endY = y - length * Math.sin(-(ang + arc / 2));
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.font = `bold ${50}px ${"comic sans ms"}`;
    ctx.fillText(sectors[i], endX, endY);
  };
  sectors.forEach((c, i) => drawSector(c, i));
}

function drawIt(
  rc: RoughCanvas,
  canvas: HTMLCanvasElement,
  elements: Element[]
) {
  const ctx = canvas.getContext("2d")!;
  //drawTreeSvg(rc, ctx);
  let radius = 2000;
  drawCircle(ctx, sectors, canvas.width / 2, canvas.height / 2, radius, rc);

  ctx.fillStyle = "black";
  for (const element of elements) {
    if (element.type === "category") {
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
  drawIt(roughCanvas, canvas, elements);
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
      hitTest(x, y, el, canvasRef.current!, cameraZoom)
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
      elements.find((el) => hitTest(x, y, el, canvasRef.current!, cameraZoom))
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
              if (hitTest(x, y, element, canvasRef.current!, cameraZoom)) {
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
