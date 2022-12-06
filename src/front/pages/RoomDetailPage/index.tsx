import { useEffect, useRef, useState } from "react";
import { RoomStreamGetResponse } from "back/routes";
import { Room, Subscriber } from "back/lib";
import { read, PATH, useAppContext } from "front";
import { call } from "front/lib";
import GameRow from "./GameRow";

const RoomDetailPage = () => {
  const { rooms, setRooms, router } = useAppContext();
  const { path, transition, params } = router;
  const { incomingPath, incomingParams } = transition;
  const [isResultOpen, setIsResultOpen] = useState(false);

  const id =
    (path === PATH.ROOM
      ? params.get("id")
      : incomingPath === PATH.ROOM
      ? incomingParams.get("id")
      : "") || "";

  const init = useRef(false);

  useEffect(() => () => setIsResultOpen(false), []);

  useEffect(() => {
    if (path === PATH.ROOM && !init.current && id) {
      init.current = true;
      const paramString = new URLSearchParams({ id }).toString();
      const streamingPath = "/api/room-stream?" + paramString;
      read<RoomStreamGetResponse>(
        streamingPath,
        ({ data }) => {
          const isInThisPage = window.location.pathname === "/" + PATH.ROOM;
          if (!data || !isInThisPage) return;
          const { token, room: newRoom } = data;
          if (token) {
            const paramObj = { token, id: params.get("id") || "" };
            const paramString = new URLSearchParams(paramObj).toString();
            call("/api/room-ping?" + paramString, { log: false }).then(({ info }) => {
              const isUnsubscriged = info === "User is not subscribing this room";
              if (isUnsubscriged) {
                if (window.confirm("You're kicked out of the room! Try again?")) {
                  window.location.reload();
                } else {
                  router.go(PATH.ROOMS);
                }
              }
            });
          }
          if (newRoom) {
            setRooms((oldRooms) => {
              const newRooms = new Map(oldRooms);
              const subscribers = new Map<string, Subscriber>();
              newRoom.subscribers.forEach((e) => subscribers.set(e.id, e));
              newRooms.set(newRoom.id, new Room({ ...newRoom, subscribers }));
              return newRooms;
            });
          }
        },
        { log: false }
      );
    }
  }, [params, path, setRooms, id, router]);

  const room = rooms.get(id);
  if (!room) return <div>Not Found</div>;

  const { games } = room;
  const gameRows = games.map((game) => (
    <GameRow
      key={`gameRow_${game.id}`}
      room_id={id}
      game={game}
      isResultOpen={isResultOpen}
    />
  ));

  const seeResult = () => setIsResultOpen((s) => !s);

  return (
    <div className="RoomDetailPage">
      <h2>
        <span>{room.name}</span>
        <button onClick={seeResult}>{isResultOpen ? "Vote Again" : "See Result"}</button>
      </h2>
      <div className="gameRows">{gameRows}</div>
    </div>
  );
};

export default RoomDetailPage;
