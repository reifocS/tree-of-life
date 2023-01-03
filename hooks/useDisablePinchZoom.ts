import { useEffect } from "react";

export default function useDisablePinchZoom() {
  //https://stackoverflow.com/a/61133028/14536535

  useEffect(() => {
    function disablePinch(event: any) {
      const { ctrlKey } = event;
      if (ctrlKey) {
        event.preventDefault();
        return;
      }
    }

    // Block pinch-zooming on iOS outside of the content area
    function disable(event: any) {
      // @ts-ignore
      if (event.scale !== 1) {
        event.preventDefault();
      }
    }
    document.addEventListener("touchmove", disable, { passive: false });
    document.addEventListener("wheel", disablePinch, { passive: false });

    return () => {
      document.removeEventListener("touchmove", disable);
      document.removeEventListener("wheel", disablePinch);
    };
  }, []);
}
