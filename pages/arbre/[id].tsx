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
  const { id, room } = router.query;
  const [models] = useLocalStorage<Model[]>("models", []);
  let treeFromModel = models.find((m) => m.id === id);
  // We only keep the elements in the live storage as it is the only
  // thing that can change.

  if (!room) {
    return <p>Room not defined</p>;
  }
  return (
    <RoomProvider
      id={room as string}
      initialPresence={{ cursor: null }}
      initialStorage={{ elements: new LiveList(treeFromModel?.elements) }}
    >
      <ClientSideSuspense
        fallback={
          <div
            style={{
              color: "black",
              fontWeight: 600,
              height: "100vh",
              width: "100vw",
              backgroundColor: "#87ceeb",
            }}
          >
            Loading...
          </div>
        }
      >
        {() => <DynamicComponentWithNoSSR />}
      </ClientSideSuspense>
    </RoomProvider>
  );
};

export default Arbre;
