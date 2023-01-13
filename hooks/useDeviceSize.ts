import { useState, useEffect } from "react";

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

  export default useDeviceSize;