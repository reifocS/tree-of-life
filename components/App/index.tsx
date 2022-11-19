import dynamic from "next/dynamic";
import Head from "next/head";
import { Suspense } from "react";

const DynamicComponentWithNoSSR = dynamic(import("./App"), {
  ssr: false,
});

export default function CanvasComponentWrapper(props: any) {
  return (
    <>
      <Head>
        <title>L&apos;arbre de vie des reins</title>
      </Head>
      <Suspense fallback={`Loading...`}>
        <DynamicComponentWithNoSSR {...props} />
      </Suspense>
    </>
  );
}
