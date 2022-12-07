import { useEffect, useRef, useState } from "react";
import { RoomStreamGetResponse } from "back/routes";
import { Room, Subscriber } from "back/lib";
import { call, read, PATH, useAppContext, useCombos } from "front";
import GameRow from "./GameRow";
import Report from "./Report";
import "./index.css";

const RoomDetailPage = () => {
  const { rooms, setRooms, router } = useAppContext();
  const { path, transition, params } = router;
  const { incomingPath, incomingParams } = transition;
  const [isResultOpen, setIsResultOpen] = useState(false);

  const init = useRef(false);

  const id =
    (path === PATH.ROOM
      ? params.get("id")
      : incomingPath === PATH.ROOM
      ? incomingParams.get("id")
      : "") || "";

  const room = rooms.get(id);
  const gameCombos = useCombos(room);

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

  if (!room) return <div>Not Found</div>;

  const { games } = room;
  const gameRows = games.map((game) => (
    <GameRow key={`gameRow_${game.id}`} room_id={id} game={game} />
  ));

  const gameComboRows = gameCombos?.map((combo) => {
    return <Report key={`${combo[0]?.id}_${combo[1]?.id}`} combo={combo} />;
  });

  const seeResult = () => {
    console.log(room);
    console.log(gameCombos);
    setIsResultOpen((s) => !s);
  };

  return (
    <div className="RoomDetailPage">
      <h2>
        <span>{room.name}</span>
        <button onClick={seeResult}>{isResultOpen ? "Vote Again" : "See Result"}</button>
      </h2>
      {isResultOpen ? (
        <div className="gameComboRows">{gameComboRows}</div>
      ) : (
        <div className="gameRows">{gameRows}</div>
      )}
    </div>
  );
};

export default RoomDetailPage;
