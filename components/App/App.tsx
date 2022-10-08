import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import rough from "roughjs/bin/rough";
import { RoughCanvas } from "roughjs/bin/canvas";

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

function drawBubble(
  canvas: HTMLCanvasElement,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) {
  const ctx = canvas.getContext("2d")!;
  const r = x + w;
  const b = y + h;
  ctx.beginPath();
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + radius / 2, y - 10);
  ctx.lineTo(x + radius * 2, y);
  ctx.lineTo(r - radius, y);
  ctx.quadraticCurveTo(r, y, r, y + radius);
  ctx.lineTo(r, y + h - radius);
  ctx.quadraticCurveTo(r, b, r - radius, b);
  ctx.lineTo(x + radius, b);
  ctx.quadraticCurveTo(x, b, x, b - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.fillText("hello world", x + 20, y + h / 2);
  ctx.stroke();
}
/*
function drawSpeechText(
  canvas: HTMLCanvasElement,
  originX = 75,
  originY = 25,
  width = 100,
  heigth = 75,
  color = "gray",
  cpx: number,
  cpy: number
) {
  const ctx = canvas.getContext("2d")!;
  const r = 25;
  ctx.beginPath();
  ctx.moveTo(originX, originY);
  ctx.quadraticCurveTo(originY, originY, originX - width / 2, originY + heigth / 2);
  //ctx.quadraticCurveTo(25, 100, originX - width / 2 + r, originY + heigth);
  //ctx.quadraticCurveTo(50, 120, originX - width / 2 + r - 20, heigth + originY + r);
  //ctx.quadraticCurveTo(60, 120, originX - width / 2 + r + 15, heigth + r);
  //ctx.quadraticCurveTo(125, 100, width + originX - width / 2, originY + heigth / 2);
  //ctx.quadraticCurveTo(125, 25, originX, originY);
  ctx.rect(originX - width / 2, originY, width, heigth)
  ctx.moveTo(originX, originY);
  ctx.fillText("hello world!", originX - 30, originY + heigth / 2);
  //ctx.fillStyle = color;
  //ctx.fill();
  ctx.stroke();
}*/

function drawLeaf(rc: RoughCanvas, canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  rc.circle(500, 150, 120, {
    fill: "rgb(10,150,10)",
    fillWeight: 3, // thicker lines for hachure,
    fillStyle: "solid",
    seed: 1
  });
  rc.path("M230 80 A 45 45, 0, 1, 0, 275 125 L 275 80 Z", {
    fill: "rgb(10,150,10)",
    fillStyle: "solid",
    seed: 2
  });
  ctx.font = "20px Comic Sans MS";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.fillText("Hello world", 500, 150);
}

function draw(
  canvas: HTMLCanvasElement,
  scale: number,
  translatePos: { x: number; y: number },
  roughCanvas: RoughCanvas
) {
  const context = canvas.getContext("2d")!;
  context.save();
  context.translate(translatePos.x, translatePos.y);
  context.scale(scale, scale);
  drawLeaf(roughCanvas, canvas)
  context.restore();
}

function getMousePos(canvas: HTMLCanvasElement, evt: any) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top,
  };
}
export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [width, height, devicePixelRatio] = useDeviceSize();
  const posRef = useRef<HTMLDivElement>(null);
  const [roughCanvas, setRoughCanvas] = useState<RoughCanvas | null>(null);
  const [appState, setAppState] = useState({
    scale: 1.0,
    scaleMultiplier: 0.8,
    translatePos: { x: width / 2, y: height / 2 },
    mouseDown: false,
    startDragOffset: { x: 0, y: 0 },
  });

  const { scale, translatePos, mouseDown, startDragOffset } = appState;
  const { x: translateX, y: translateY } = translatePos;
  const { x: startDragOffsetX, y: startDragOffsetY } = startDragOffset;

  const ref = useCallback((node: HTMLCanvasElement) => {
    if (node !== null) {
      setRoughCanvas(rough.canvas(node));
      canvasRef.current = node;
    }
  }, []);

  function handleZoomPlus() {
    setAppState((prev) => ({
      ...prev,
      scale: prev.scale / prev.scaleMultiplier,
    }));
  }

  function handleZoomMinus() {
    setAppState((prev) => ({
      ...prev,
      scale: prev.scale * prev.scaleMultiplier,
    }));
  }

  useLayoutEffect(() => {
    if (!roughCanvas) return;
    const canvas = canvasRef.current!;
    //const scale = devicePixelRatio;
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const context = canvas.getContext("2d")!;
    //context.scale(scale, scale);
    context.clearRect(0, 0, width, height);
    draw(canvas, scale, { x: translateX, y: translateY }, roughCanvas);
  }, [
    devicePixelRatio,
    height,
    roughCanvas,
    width,
    scale,
    translateX,
    translateY,
  ]);

  return (
    <div>
      <canvas
        onMouseMove={(e) => {
          const { x, y } = getMousePos(canvasRef.current!, e);
          posRef.current!.innerText = `x: ${x}, y:${y}`;
          if (appState.mouseDown) {
            setAppState((prev) => ({
              ...prev,
              translatePos: {
                x: e.clientX - prev.startDragOffset.x,
                y: e.clientY - prev.startDragOffset.y,
              },
            }));
          }
        }}
        onMouseDown={(e) => {
          //const { x, y } = getMousePos(canvasRef.current!, e);
          setAppState((prev) => ({
            ...prev,
            mouseDown: true,
            startDragOffset: {
              x: e.clientX - prev.translatePos.x,
              y: e.clientY - prev.translatePos.y,
            },
          }));
        }}
        onMouseUp={() => {
          setAppState((prev) => ({
            ...prev,
            mouseDown: false,
          }));
        }}
        onMouseOver={() => {
          setAppState((prev) => ({
            ...prev,
            mouseDown: false,
          }));
        }}
        onMouseOut={() => {
          setAppState((prev) => ({
            ...prev,
            mouseDown: false,
          }));
        }}
        ref={ref}
        width={width}
        height={height}
      />
      <div
        style={{
          position: "absolute",
          left: 300,
          bottom: 100,
        }}
        ref={posRef}
      ></div>
      <div id="buttonWrapper">
        <input onClick={handleZoomPlus} type="button" id="plus" value="+" />
        <input onClick={handleZoomMinus} type="button" id="minus" value="-" />
      </div>
    </div>
  );
}
