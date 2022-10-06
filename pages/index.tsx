import type {NextPage} from 'next'
import {useEffect, useRef, useState} from "react";

const useDeviceSize = () => {

    const [width, setWidth] = useState(0)
    const [height, setHeight] = useState(0)
    const [devicePixelRatio, setDevicePixelRatio] = useState(0)

    const handleWindowResize = () => {
        setWidth(window.innerWidth);
        setHeight(window.innerHeight);
        // this tells the browser how many of the screen's actual pixels should be used to draw a single CSS pixel.
        setDevicePixelRatio(window.devicePixelRatio);
    }

    useEffect(() => {
        // component is mounted and window is available
        handleWindowResize();
        window.addEventListener('resize', handleWindowResize);
        // unsubscribe from the event on component unmount
        return () => window.removeEventListener('resize', handleWindowResize);
    }, []);

    return [width, height, devicePixelRatio]

}

const Home: NextPage = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [w, h, devicePixelRatio] = useDeviceSize();

    return (
        <div>
            <h1>Codage non stop</h1>
            <canvas ref={canvasRef}
                    width={w}
                    height={h}
                    onWheel={(e) => {
                        let scale = 1;
                        let originx = 0;
                        let originy = 0;
                        let visibleWidth = width;
                        let visibleHeight = height;



// Begin the animation loop.
                        dr

                        canvas.onwheel = function (event){
                            event.preventDefault();
                            // Get mouse offset.
                            const mousex = event.clientX - canvas.offsetLeft;
                            const mousey = event.clientY - canvas.offsetTop;
                            // Normalize mouse wheel movement to +1 or -1 to avoid unusual jumps.
                            const wheel = event.deltaY < 0 ? 1 : -1;

                            // Compute zoom factor.
                            const zoom = Math.exp(wheel * zoomIntensity);

                            // Translate so the visible origin is at the context's origin.
                            context.translate(originx, originy);

                            // Compute the new visible origin. Originally the mouse is at a
                            // distance mouse/scale from the corner, we want the point under
                            // the mouse to remain in the same place after the zoom, but this
                            // is at mouse/new_scale away from the corner. Therefore we need to
                            // shift the origin (coordinates of the corner) to account for this.
                            originx -= mousex/(scale*zoom) - mousex/scale;
                            originy -= mousey/(scale*zoom) - mousey/scale;

                            // Scale it (centered around the origin due to the trasnslate above).
                            context.scale(zoom, zoom);
                            // Offset the visible origin to it's proper position.
                            context.translate(-originx, -originy);

                            // Update scale and others.
                            scale *= zoom;
                            visibleWidth = width / scale;
                            visibleHeight = height / scale;
                        }
                    }}

            />
        </div>
    )
}

export default Home
