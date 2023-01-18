import { Others, BaseUserMeta } from "@liveblocks/client";
import { useLayoutEffect } from "react";
import { RoughCanvas } from "roughjs/bin/canvas";
import { draw, Element } from "../drawing";

export function useCanvas(
  mode: "view" | "edit",
  roughCanvas: RoughCanvas | null,
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>,
  width: number,
  height: number,
  cameraZoom: number,
  cameraOffsetX: number,
  cameraOffsetY: number,
  elements: Element[],
  images: {
    color: "#9ed36a" | "#fff" | "#ff7f00" | "#676767";
    image: HTMLImageElement;
  }[],
  selectedElement: Element | null,
  nbOfBranches: number,
  dummyUpdate: {}
) {
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
      images,
      selectedElement?.id,
      mode,
      nbOfBranches
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
    images,
    dummyUpdate,
    nbOfBranches,
    canvasRef,
    mode,
  ]);
}
