import { LiveList } from "@liveblocks/client";
import { ClientSideSuspense } from "@liveblocks/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { Model } from "../../components/App/Model";
import useLocalStorage from "../../hooks/useLocalStorage";
import { RoomProvider } from "../../liveblocks.config";

const DynamicComponentWithNoSSR = dynamic(
  import("../../components/App/CanvasMultiplayer"),
  {
    ssr: false,
  }
);

const Arbre = () => {
  const router = useRouter();
  const { id } = router.query;
  const [models] = useLocalStorage<Model[]>("models", []);
  const treeFromModel = models.find((m) => m.id === id);
  if (!treeFromModel) {
    //TODO redirect to 404
    return <p>Oups, l&apos;arbre n&apos;existe pas</p>;
  }
  // We only keep the elements in the live storage as it is the only
  // thing that can change.
  return (
    <RoomProvider
      id={id as string}
      initialPresence={{ cursor: null }}
      initialStorage={{ elements: new LiveList(treeFromModel.elements) }}
    >
      <ClientSideSuspense fallback={<div>Loading...</div>}>
        {() => <DynamicComponentWithNoSSR treeFromModel={treeFromModel} />}
      </ClientSideSuspense>
    </RoomProvider>
  );
};

export default Arbre;
