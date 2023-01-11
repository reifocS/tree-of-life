import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

const client = createClient({
  publicApiKey:
    "pk_dev_leijKDtkwyqdAw8KP_KQt3YwEYho23NZVpt2BCFjUcxE1RoGMoheiTdwaGh_5ohg",
});
export type Presence = {
  cursor: { x: number; y: number } | null;
};

export const {
  suspense: { RoomProvider, useOthers, useUpdateMyPresence, useOther },
} = createRoomContext<Presence, any>(client);
