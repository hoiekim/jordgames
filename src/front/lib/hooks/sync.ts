import { useCallback, useMemo } from "react";
import { RoomsGetResponse } from "back/routes";
import { Subscriber } from "back/lib";
import { useAppContext, call, Rooms } from "front";

export const useSync = () => {
  const { user, setRooms } = useAppContext();
  const userLoggedIn = !!user;

  type SyncRooms = () => void;
  const syncRooms: SyncRooms = useCallback(() => {
    if (!userLoggedIn) return;

    call.get<RoomsGetResponse>("/api/rooms").then(({ data }) => {
      if (!data) return;
      const { rooms } = data;

      setRooms(() => {
        const newRooms: Rooms = new Map();
        rooms.forEach((e) => {
          const { id } = e;
          const subscribers = new Map<string, Subscriber>();
          e.subscribers.forEach((f) => subscribers.set(f.id, f));
          newRooms.set(id, { ...e, subscribers });
        });
        return newRooms;
      });
    });
  }, [userLoggedIn, setRooms]);

  type SyncAll = () => void;

  const syncAll = useCallback(() => {
    syncRooms();
  }, [syncRooms]);

  type Sync = {
    all: SyncAll;
    rooms: SyncRooms;
  };

  const sync: Sync = useMemo(
    () => ({
      all: syncAll,
      rooms: syncRooms,
    }),
    [syncAll, syncRooms]
  );

  const clean = useCallback(() => {
    setRooms(new Map());
  }, [setRooms]);

  return { sync, clean };
};
