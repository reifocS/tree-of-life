import dynamic from "next/dynamic";
import Head from "next/head";
import { Suspense } from "react";

const DynamicComponentWithNoSSR = dynamic(import("./Model"), {
  ssr: false,
});

export default function ModelComponentWrapper(props: any) {
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
