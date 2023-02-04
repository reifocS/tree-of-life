import { useEffect, useMemo } from "react";
import { adjust, colors, white } from "../drawing";

export function useLeafImages(forceUpdate: ({}) => void) {
  const leafImages = useMemo(() => {
    return colors.map((c) => {
      const image = new Image();
      // Need to set fix height and width for firefox, it's a known bug https://bugzilla.mozilla.org/show_bug.cgi?id=700533
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 511.845 511.845" 
          width="200px" height="200px"
          style="enable-background:new 0 0 511.845 511.845" xml:space="preserve">
          <path style="fill:${c}" d="M503.141 9.356c-.016 0-215.215-56.483-390.225 118.511C-31.579 272.371 96.155 416.35 96.155 416.35s143.979 127.742 288.476-16.775C559.64 224.588 503.156 9.388 503.141 9.356Z"/><g style="opacity:.2"><path style="fill:${
        c === white ? "black" : "#fff"
      }" d="m503.141 8.696-21.337-4.108c.016.031 56.499 219.339-118.495 394.326-48.172 48.203-96.299 66.104-139.052 68.572 47.705 2.75 104-12.184 160.374-68.572C559.64 223.928 503.156 8.728 503.141 8.696z"/></g>
          <path style="fill:${
            c === white ? "lightgray" : adjust(c, -20)
          }" d="M300.125 211.728c-4.154-4.17-10.918-4.17-15.074 0L3.122 493.635c-4.163 4.186-4.163 10.934 0 15.09 4.163 4.154 10.911 4.154 15.081 0l281.922-281.923c4.17-4.171 4.17-10.919 0-15.074z"/></svg>`;
      image.src = `data:image/svg+xml;base64,${window.btoa(svg)}`;
      return { color: c, image };
    });
  }, []);

  useEffect(() => {
    leafImages.forEach(({ image }) => {
      image.onload = () => {
        forceUpdate({});
      };
    });
  }, [forceUpdate, leafImages]);

  return leafImages;
}
