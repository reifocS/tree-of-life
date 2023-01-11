import { createClient, LiveList } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";
import { Element } from "./drawing";

const client = createClient({
  publicApiKey:
    "pk_dev_leijKDtkwyqdAw8KP_KQt3YwEYho23NZVpt2BCFjUcxE1RoGMoheiTdwaGh_5ohg",
});

export type Presence = {
  cursor: { x: number; y: number } | null;
};
// Storage represents the shared document that persists in the Room, even after
// all Users leave. Fields under Storage typically are LiveList, LiveMap,
// LiveObject instances, for which updates are automatically persisted and
// synced to all connected clients.
export type Storage = {
  elements: LiveList<Element>;
};
export const {
  suspense: {
    RoomProvider,
    useOthers,
    useUpdateMyPresence,
    useOther,
    useStorage,
    useMutation,
  },
} = createRoomContext<Presence, Storage>(client);
