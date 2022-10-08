import dynamic from "next/dynamic";
import { Suspense } from "react";

const DynamicComponentWithNoSSR = dynamic(
  import("./App"), {
    ssr: false,
  }
);

export default function CanvasComponentWrapper(props: any) {
  return (
    <Suspense fallback={`Loading...`}>
      <DynamicComponentWithNoSSR {...props} />
    </Suspense>
  );
}
