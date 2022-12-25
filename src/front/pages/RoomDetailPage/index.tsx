import { useEffect, useRef } from "react";
import { RoomStreamGetResponse } from "back/routes";
import { Room, Subscriber } from "back/lib";
import { call, read, PATH, useAppContext } from "front";
import GameRow from "./GameRow";
import "./index.css";

const { ROOM, VOTE_RESULT } = PATH;

const RoomDetailPage = () => {
  const { rooms, setRooms, router } = useAppContext();
  const { path, transition, params } = router;
  const { incomingPath, incomingParams } = transition;

  const init = useRef(false);

  const id =
    (path === ROOM
      ? params.get("id")
      : incomingPath === ROOM
      ? incomingParams.get("id")
      : "") || "";

  const room = rooms.get(id);

  useEffect(() => {
    if (path === ROOM && !init.current && id) {
      init.current = true;
      const paramString = new URLSearchParams({ id }).toString();
      const streamingPath = "/api/room-stream?" + paramString;
      read<RoomStreamGetResponse>(
        streamingPath,
        ({ data }) => {
          if (!data) return;
          const { pathname } = window.location;
          const isInThisPage = pathname === "/" + ROOM || pathname === "/" + VOTE_RESULT;
          if (!isInThisPage) return;
          const urlRoomId = new URLSearchParams(window.location.search).get("id");
          if (urlRoomId !== id) return;
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

  if (!room) return <div>Not Found</div>;

  const { games } = room;
  const gameRows = games.map((game) => (
    <GameRow key={`gameRow_${game.id}`} room_id={id} game={game} />
  ));

  const seeResult = () => router.go(PATH.VOTE_RESULT, { params });

  return (
    <div className="RoomDetailPage">
      <h2>
        <span>Vote in {room.name}</span>
      </h2>
      <div className="gameRows">{gameRows}</div>
      <div className="floatingBox">
        <button className="green shadow big" onClick={seeResult}>
          See Result
        </button>
      </div>
    </div>
  );
};

export default RoomDetailPage;
