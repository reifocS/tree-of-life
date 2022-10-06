import React, {useEffect, useReducer, useRef, useState} from "react";
// @ts-ignore
import rough from "roughjs/bundled/rough.cjs.js";
import {RoughCanvas} from "roughjs/bin/canvas";

type ExcaliburElement = ReturnType<typeof newElement>;
type ExcaliburTextElement = ExcaliburElement & {
    type: "text";
    font: string;
    text: string;
    actualBoundingBoxAscent: number;
};

// https://stackoverflow.com/a/6853926/232122
function distanceBetweenPointAndSegment(
    x: number,
    y: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number
) {
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSquare = C * C + D * D;
    let param = -1;
    if (lenSquare !== 0) {
        // in case of 0 length line
        param = dot / lenSquare;
    }

    let xx, yy;
    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    const dx = x - xx;
    const dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
}

function hitTest(element: ExcaliburElement, x: number, y: number): boolean {
    // For shapes that are composed of lines, we only enable point-selection when the distance
    // of the click is less than x pixels of any of the lines that the shape is composed of
    const lineThreshold = 10;

    if (
        element.type === "rectangle" ||
        // There doesn't seem to be a closed form solution for the distance between
        // a point and an ellipse, let's assume it's a rectangle for now...
        element.type === "ellipse"
    ) {
        const x1 = getElementAbsoluteX1(element);
        const x2 = getElementAbsoluteX2(element);
        const y1 = getElementAbsoluteY1(element);
        const y2 = getElementAbsoluteY2(element);

        // (x1, y1) --A-- (x2, y1)
        //    |D             |B
        // (x1, y2) --C-- (x2, y2)
        return (
            distanceBetweenPointAndSegment(x, y, x1, y1, x2, y1) < lineThreshold || // A
            distanceBetweenPointAndSegment(x, y, x2, y1, x2, y2) < lineThreshold || // B
            distanceBetweenPointAndSegment(x, y, x2, y2, x1, y2) < lineThreshold || // C
            distanceBetweenPointAndSegment(x, y, x1, y2, x1, y1) < lineThreshold // D
        );
    } else if (element.type === "arrow") {
        let [x1, y1, x2, y2, x3, y3, x4, y4] = getArrowPoints(element);
        // The computation is done at the origin, we need to add a translation
        x -= element.x;
        y -= element.y;

        return (
            //    \
            distanceBetweenPointAndSegment(x, y, x3, y3, x2, y2) < lineThreshold ||
            // -----
            distanceBetweenPointAndSegment(x, y, x1, y1, x2, y2) < lineThreshold ||
            //    /
            distanceBetweenPointAndSegment(x, y, x4, y4, x2, y2) < lineThreshold
        );
    } else if (element.type === "text") {
        const x1 = getElementAbsoluteX1(element);
        const x2 = getElementAbsoluteX2(element);
        const y1 = getElementAbsoluteY1(element);
        const y2 = getElementAbsoluteY2(element);

        return x >= x1 && x <= x2 && y >= y1 && y <= y2;
    } else {
        throw new Error("Unimplemented type " + element.type);
    }
}

function newElement(
    type: string,
    x: number,
    y: number,
    strokeColor: string,
    backgroundColor: string,
    width = 0,
    height = 0
) {
    const element = {
        type: type,
        x: x,
        y: y,
        width: width,
        height: height,
        isSelected: false,
        strokeColor: strokeColor,
        backgroundColor: backgroundColor,
        draw(rc: RoughCanvas, context: CanvasRenderingContext2D) {
        }
    };
    return element;
}

function renderScene(
    rc: RoughCanvas,
    context: CanvasRenderingContext2D,
    // null indicates transparent bg
    viewBackgroundColor: string | null, canvas: HTMLCanvasElement,
    elements: Array<ExcaliburElement>
) {
    const fillStyle = context.fillStyle;
    if (typeof viewBackgroundColor === "string") {
        context.fillStyle = viewBackgroundColor;
        context.fillRect(-0.5, -0.5, canvas.width, canvas.height);
    } else {
        context.clearRect(-0.5, -0.5, canvas.width, canvas.height);
    }
    context.fillStyle = fillStyle;

    elements.forEach(element => {
        element.draw(rc, context);
        if (element.isSelected) {
            const margin = 4;

            const elementX1 = getElementAbsoluteX1(element);
            const elementX2 = getElementAbsoluteX2(element);
            const elementY1 = getElementAbsoluteY1(element);
            const elementY2 = getElementAbsoluteY2(element);
            const lineDash = context.getLineDash();
            context.setLineDash([8, 4]);
            context.strokeRect(
                elementX1 - margin,
                elementY1 - margin,
                elementX2 - elementX1 + margin * 2,
                elementY2 - elementY1 + margin * 2
            );
            context.setLineDash(lineDash);
        }
    });
}


function rotate(x1: number, y1: number, x2: number, y2: number, angle: number) {
    // 𝑎′𝑥=(𝑎𝑥−𝑐𝑥)cos𝜃−(𝑎𝑦−𝑐𝑦)sin𝜃+𝑐𝑥
    // 𝑎′𝑦=(𝑎𝑥−𝑐𝑥)sin𝜃+(𝑎𝑦−𝑐𝑦)cos𝜃+𝑐𝑦.
    // https://math.stackexchange.com/questions/2204520/how-do-i-rotate-a-line-segment-in-a-specific-point-on-the-line
    return [
        (x1 - x2) * Math.cos(angle) - (y1 - y2) * Math.sin(angle) + x2,
        (x1 - x2) * Math.sin(angle) + (y1 - y2) * Math.cos(angle) + y2
    ];
}

// Casting second argument (DrawingSurface) to any,
// because it is requred by TS definitions and not required at runtime
const generator = rough.generator();

function isTextElement(
    element: ExcaliburElement
): element is ExcaliburTextElement {
    return element.type === "text";
}

function getArrowPoints(element: ExcaliburElement) {
    const x1 = 0;
    const y1 = 0;
    const x2 = element.width;
    const y2 = element.height;

    const size = 30; // pixels
    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    // Scale down the arrow until we hit a certain size so that it doesn't look weird
    const minSize = Math.min(size, distance / 2);
    const xs = x2 - ((x2 - x1) / distance) * minSize;
    const ys = y2 - ((y2 - y1) / distance) * minSize;

    const angle = 20; // degrees
    const [x3, y3] = rotate(xs, ys, x2, y2, (-angle * Math.PI) / 180);
    const [x4, y4] = rotate(xs, ys, x2, y2, (angle * Math.PI) / 180);

    return [x1, y1, x2, y2, x3, y3, x4, y4];
}

function generateDraw(element: ExcaliburElement) {
    if (element.type === "selection") {
        element.draw = (rc, context) => {
            const fillStyle = context.fillStyle;
            console.log({rc, context, draw: "draw"})
            context.fillStyle = "rgba(0, 0, 255, 0.10)";
            context.fillRect(element.x, element.y, element.width, element.height);
            context.fillStyle = fillStyle;
        };
    } else if (element.type === "rectangle") {
        const shape = generator.rectangle(0, 0, element.width, element.height, {
            stroke: element.strokeColor,
            fill: element.backgroundColor
        });
        element.draw = (rc, context) => {
            context.translate(element.x, element.y);
            rc.draw(shape);
            context.translate(-element.x, -element.y);
        };
    } else if (element.type === "ellipse") {
        const shape = generator.ellipse(
            element.width / 2,
            element.height / 2,
            element.width,
            element.height,
            {stroke: element.strokeColor, fill: element.backgroundColor}
        );
        element.draw = (rc, context) => {
            context.translate(element.x, element.y);
            rc.draw(shape);
            context.translate(-element.x, -element.y);
        };
    } else if (element.type === "arrow") {
        const [x1, y1, x2, y2, x3, y3, x4, y4] = getArrowPoints(element);
        const shapes = [
            //    \
            generator.line(x3, y3, x2, y2, {stroke: element.strokeColor}),
            // -----
            generator.line(x1, y1, x2, y2, {stroke: element.strokeColor}),
            //    /
            generator.line(x4, y4, x2, y2, {stroke: element.strokeColor})
        ];

        element.draw = (rc, context) => {
            context.translate(element.x, element.y);
            shapes.forEach(shape => rc.draw(shape));
            context.translate(-element.x, -element.y);
        };
        return;
    } else if (isTextElement(element)) {
        element.draw = (rc, context) => {
            const font = context.font;
            context.font = element.font;
            const fillStyle = context.fillStyle;
            context.fillStyle = element.strokeColor;
            context.fillText(
                element.text,
                element.x,
                element.y + element.actualBoundingBoxAscent
            );
            context.fillStyle = fillStyle;
            context.font = font;
        };
    } else {
        throw new Error("Unimplemented type " + element.type);
    }
}

// If the element is created from right to left, the width is going to be negative
// This set of functions retrieves the absolute position of the 4 points.
// We can't just always normalize it since we need to remember the fact that an arrow
// is pointing left or right.
function getElementAbsoluteX1(element: ExcaliburElement) {
    return element.width >= 0 ? element.x : element.x + element.width;
}

function getElementAbsoluteX2(element: ExcaliburElement) {
    return element.width >= 0 ? element.x + element.width : element.x;
}

function getElementAbsoluteY1(element: ExcaliburElement) {
    return element.height >= 0 ? element.y : element.y + element.height;
}

function getElementAbsoluteY2(element: ExcaliburElement) {
    return element.height >= 0 ? element.y + element.height : element.y;
}

function setSelection(selection: ExcaliburElement, elements: ExcaliburElement[]) {
    const selectionX1 = getElementAbsoluteX1(selection);
    const selectionX2 = getElementAbsoluteX2(selection);
    const selectionY1 = getElementAbsoluteY1(selection);
    const selectionY2 = getElementAbsoluteY2(selection);
    elements.forEach(element => {
        const elementX1 = getElementAbsoluteX1(element);
        const elementX2 = getElementAbsoluteX2(element);
        const elementY1 = getElementAbsoluteY1(element);
        const elementY2 = getElementAbsoluteY2(element);
        element.isSelected =
            element.type !== "selection" &&
            selectionX1 <= elementX1 &&
            selectionY1 <= elementY1 &&
            selectionX2 >= elementX2 &&
            selectionY2 >= elementY2;
    });
}

function clearSelection(setElements: (cb: (p: ExcaliburElement[]) => ExcaliburElement[]) => void) {
    setElements((prev: ExcaliburElement[]) => prev.map(el => ({...el, isSelected: false})))
}


type AppState = {
    draggingElement: ExcaliburElement | null;
    elementType: string;
    exportBackground: boolean;
    exportVisibleOnly: boolean;
    exportPadding: number;
    currentItemStrokeColor: string;
    currentItemBackgroundColor: string;
    viewBackgroundColor: string;
};

const KEYS = {
    ARROW_LEFT: "ArrowLeft",
    ARROW_RIGHT: "ArrowRight",
    ARROW_DOWN: "ArrowDown",
    ARROW_UP: "ArrowUp",
    ESCAPE: "Escape",
    DELETE: "Delete",
    BACKSPACE: "Backspace"
};

function isArrowKey(keyCode: string) {
    return (
        keyCode === KEYS.ARROW_LEFT ||
        keyCode === KEYS.ARROW_RIGHT ||
        keyCode === KEYS.ARROW_DOWN ||
        keyCode === KEYS.ARROW_UP
    );
}

const ELEMENT_SHIFT_TRANSLATE_AMOUNT = 5;
const ELEMENT_TRANSLATE_AMOUNT = 1;

function Option({
                    selected,
                    type,
                    children,
                    setState,
                    setElements,
                    elements
                }: {
    selected: string,
    type: string;
    children: React.ReactNode;
    setState: any;
    setElements: any;
    elements: ExcaliburElement[]
}) {
    return (
        <label>
            <input
                type="radio"
                checked={selected === type}
                onChange={() => {
                    setState((prev: any) => ({...prev, elementType: type}));
                    clearSelection(setElements);
                }}
            />
            {children}
        </label>
    );
}

function Home() {
    const [, forceUpdate] = useReducer(x => x + 1, 0);
    const [elements, setElements] = useState<Array<ExcaliburElement>>([])
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const roughCanvasRef = useRef<RoughCanvas | null>(null);
    const [state, setState] = useState<AppState>({
        draggingElement: null,
        elementType: "selection",
        exportBackground: false,
        exportVisibleOnly: true,
        exportPadding: 10,
        currentItemStrokeColor: "#000000",
        currentItemBackgroundColor: "#ffffff",
        viewBackgroundColor: "#ffffff"
    })

    /*
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if ((event.target as HTMLElement).nodeName === "INPUT") {
                return;
            }

            if (event.key === KEYS.ESCAPE) {
                clearSelection();
                forceUpdate();
                event.preventDefault();
            } else if (event.key === KEYS.BACKSPACE || event.key === KEYS.DELETE) {
                deleteSelectedElements();
                forceUpdate();
                event.preventDefault();
            } else if (isArrowKey(event.key)) {
                const step = event.shiftKey
                    ? ELEMENT_SHIFT_TRANSLATE_AMOUNT
                    : ELEMENT_TRANSLATE_AMOUNT;
                elements.forEach(element => {
                    if (element.isSelected) {
                        if (event.key === KEYS.ARROW_LEFT) element.x -= step;
                        else if (event.key === KEYS.ARROW_RIGHT) element.x += step;
                        else if (event.key === KEYS.ARROW_UP) element.y -= step;
                        else if (event.key === KEYS.ARROW_DOWN) element.y += step;
                    }
                });
                forceUpdate();
                event.preventDefault();
            } else if (event.key === "a" && event.metaKey) {
                elements.forEach(element => {
                    element.isSelected = true;
                });
                forceUpdate();
                event.preventDefault();
            }
        };
        document.addEventListener("keydown", onKeyDown, false);


        return () => document.removeEventListener("keydown", onKeyDown, false);

    }, [])
    */

    useEffect(() => {
        roughCanvasRef.current = rough.canvas(canvasRef.current);
    }, [])


    useEffect(() => {
        const canvas = canvasRef.current
        const rc = roughCanvasRef.current;
        const context = canvas!.getContext("2d")!;
        renderScene(rc!, context, state.viewBackgroundColor, canvas!, elements);
    })

    return (
        <div
            onCut={e => {
                e.clipboardData.setData(
                    "text/plain",
                    JSON.stringify(elements.filter(element => element.isSelected))
                );
                //deleteSelectedElements(elements);
                e.preventDefault();
            }}
            onCopy={e => {
                e.clipboardData.setData(
                    "text/plain",
                    JSON.stringify(elements.filter(element => element.isSelected))
                );
                e.preventDefault();
            }}
            onPaste={e => {
                const paste = e.clipboardData.getData("text");
                let parsedElements;
                try {
                    parsedElements = JSON.parse(paste);
                } catch (e) {
                }
                if (
                    Array.isArray(parsedElements) &&
                    parsedElements.length > 0 &&
                    parsedElements[0].type // need to implement a better check here...
                ) {
                    clearSelection(setElements);
                    parsedElements.forEach(parsedElement => {
                        parsedElement.x += 10;
                        parsedElement.y += 10;
                        generateDraw(parsedElement);
                        setElements(prev => [...prev, parsedElement])
                    });
                }
                e.preventDefault();
            }}
        >
            <fieldset>
                <legend>Shapes</legend>
                <Option selected={state.elementType} type={"rectangle"} setState={setState}
                        elements={elements}
                        setElements={setElements}>Rectangle</Option>
                <Option selected={state.elementType}
                        elements={elements}
                        type={"ellipse"} setState={setState}
                        setElements={setElements}>Ellipse</Option>
                <Option
                    elements={elements}
                    selected={state.elementType} type={"arrow"} setState={setState}
                    setElements={setElements}>Arrow</Option>
                <Option elements={elements}
                        selected={state.elementType} type={"text"} setState={setState}
                        setElements={setElements}>Text</Option>
                <Option selected={state.elementType} elements={elements}
                        type={"selection"} setState={setState}
                        setElements={setElements}>Selection</Option>
            </fieldset>
            <canvas
                id="canvas"
                ref={canvasRef}
                width={800}
                height={800 - 200}
                onMouseDown={e => {
                    const x = e.clientX - (e.target as HTMLElement).offsetLeft;
                    const y = e.clientY - (e.target as HTMLElement).offsetTop;
                    const element = newElement(
                        state.elementType,
                        x,
                        y,
                        state.currentItemStrokeColor,
                        state.currentItemBackgroundColor
                    );
                    let isDraggingElements = false;
                    const cursorStyle = document.documentElement.style.cursor;
                    if (state.elementType === "selection") {
                        const hitElement = elements.find(element => {
                            return hitTest(element, x, y);
                        });

                        // If we click on something
                        if (hitElement) {
                            if (hitElement.isSelected) {
                                // If that element is not already selected, do nothing,
                                // we're likely going to drag it
                            } else {
                                // We unselect every other elements unless shift is pressed
                                if (!e.shiftKey) {
                                    clearSelection(setElements);
                                }
                                // No matter what, we select it
                                hitElement.isSelected = true;
                            }
                        } else {
                            // If we don't click on anything, let's remove all the selected elements
                            clearSelection(setElements);
                        }

                        isDraggingElements = elements.some(element => element.isSelected);

                        if (isDraggingElements) {
                            document.documentElement.style.cursor = "move";
                        }
                    }

                    if (isTextElement(element)) {
                        const text = prompt("What text do you want?");
                        if (text === null) {
                            return;
                        }
                        const canvas = canvasRef.current!
                        const context = canvas.getContext("2d")!;
                        element.text = text;
                        element.font = "20px Virgil";
                        const font = context.font;
                        context.font = element.font;
                        const {
                            actualBoundingBoxAscent,
                            actualBoundingBoxDescent,
                            width
                        } = context.measureText(element.text);
                        element.actualBoundingBoxAscent = actualBoundingBoxAscent;
                        context.font = font;
                        const height = actualBoundingBoxAscent + actualBoundingBoxDescent;
                        // Center the text
                        element.x -= width / 2;
                        element.y -= actualBoundingBoxAscent;
                        element.width = width;
                        element.height = height;
                    }

                    generateDraw(element);
                    setElements(prev => [...prev, element])
                    if (state.elementType === "text") {
                        setState(prev => ({
                            ...prev,
                            draggingElement: null,
                            elementType: "selection"
                        }));
                        element.isSelected = true;
                    } else {
                        setState(prev => ({...prev, draggingElement: element}));
                    }

                    let lastX = x;
                    let lastY = y;

                    const onMouseMove = (e: MouseEvent) => {
                        const target = e.target;
                        if (!(target instanceof HTMLElement)) {
                            return;
                        }

                        if (isDraggingElements) {
                            setElements(prev => {
                                return prev.map(el => {
                                    if (el.isSelected) {
                                        const x = e.clientX - target.offsetLeft;
                                        const y = e.clientY - target.offsetTop;
                                        return {
                                            ...el,
                                            x: x + x - lastX,
                                            y: y + y - lastY
                                        }
                                    } else {
                                        return el;
                                    }
                                })
                            })
                            lastX = x;
                            lastY = y;
                            return;
                        }
                        // It is very important to read this.state within each move event,
                        // otherwise we would read a stale one!
                        const draggingElement = state.draggingElement;
                        if (!draggingElement) return;
                        let width = e.clientX - target.offsetLeft - draggingElement.x;
                        let height = e.clientY - target.offsetTop - draggingElement.y;
                        draggingElement.width = width;
                        // Make a perfect square or circle when shift is enabled
                        draggingElement.height = e.shiftKey ? width : height;

                        generateDraw(draggingElement);

                        if (state.elementType === "selection") {
                            setSelection(draggingElement, elements);
                        }
                        forceUpdate();
                    };

                    const onMouseUp = (e: MouseEvent) => {
                        const {draggingElement, elementType} = state;

                        window.removeEventListener("mousemove", onMouseMove);
                        window.removeEventListener("mouseup", onMouseUp);

                        document.documentElement.style.cursor = cursorStyle;

                        // if no element is clicked, clear the selection and redraw
                        if (draggingElement === null) {
                            clearSelection(setElements);
                            forceUpdate();
                            return;
                        }

                        if (elementType === "selection") {
                            if (isDraggingElements) {
                                isDraggingElements = false;
                            }
                            elements.pop();
                        } else {
                            draggingElement.isSelected = true;
                        }

                        setState(prev => ({
                            ...prev,
                            draggingElement: null,
                            elementType: "selection"
                        }));
                    };

                    window.addEventListener("mousemove", onMouseMove);
                    window.addEventListener("mouseup", onMouseUp);

                }
                }
            />
            <fieldset>
                <legend>Colors</legend>
                <label>
                    <input
                        type="color"
                        value={state.viewBackgroundColor}
                        onChange={e => {
                            setState(prev => ({...prev, viewBackgroundColor: e.target.value}));
                        }}
                    />
                    Background
                </label>
                <label>
                    <input
                        type="color"
                        value={state.currentItemStrokeColor}
                        onChange={e => {
                            setState(prev => ({...prev, currentItemStrokeColor: e.target.value}));
                        }}
                    />
                    Shape Stroke
                </label>
                <label>
                    <input
                        type="color"
                        value={state.currentItemBackgroundColor}
                        onChange={e => {
                            setState(prev => ({...prev, currentItemBackgroundColor: e.target.value}));
                        }}
                    />
                    Shape Background
                </label>
            </fieldset>
        </div>
    );
}


export default Home
