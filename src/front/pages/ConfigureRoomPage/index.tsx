import { useState, useEffect, useRef } from "react";
import { Game, Room } from "back/lib";
import { call, PATH, useAppContext, BggGame } from "front";
import { GameInfo } from "front/components";
import "./index.css";

const ConfigureRoomPage = () => {
  const { router, setRooms } = useAppContext();
  const { path, params, transition } = router;
  const { incomingPath, incomingParams } = transition;
  const id =
    (path === PATH.CONFIGURE_ROOM
      ? params.get("id")
      : incomingPath === PATH.CONFIGURE_ROOM
      ? incomingParams.get("id")
      : "") || "";

  const [nameInput, setNameInput] = useState("");
  const [selectedGames, setSelectedGames] = useState<Set<BggGame>>(new Set());
  const [gameCollection, setGameCollection] = useState<BggGame[]>([]);

  const init = useRef(false);

  useEffect(() => {
    if (path !== PATH.CONFIGURE_ROOM || init.current) return;
    init.current = true;

    type CollectionResponse = { items: { item: BggGame[] } };
    const paramString = new URLSearchParams({ username: "JordGames" }).toString();

    call.bgg.get<CollectionResponse>("/collection?" + paramString).then((r) => {
      setGameCollection(r.items.item);
    });
  }, [path]);

  const selectedGamesArray = Array.from(selectedGames.values());

  const createRoom = () => {
    if (!id || !nameInput || !selectedGames.size) return;
    const games = selectedGamesArray.map(
      ({ objectid: id, name }) => new Game({ id, name })
    );
    const newRoom = new Room({ id, name: nameInput, games });
    call.post("/api/room", newRoom).then((r) => {
      if (r.status === "success") {
        setRooms((oldRooms) => {
          const newRooms = new Map(oldRooms);
          newRooms.set(id, newRoom);
          return newRooms;
        });
        router.go(PATH.ROOMS);
      }
    });
  };

  const selectedGameThumbnails = selectedGamesArray.map((e) => {
    const { objectid, name, thumbnail } = e;
    const removeGame = () => {
      setSelectedGames((oldValue) => {
        const newValue = new Set(oldValue);
        newValue.delete(e);
        return newValue;
      });
    };
    return (
      <div key={`selectedGame_${objectid}`} onClick={removeGame}>
        <img src={thumbnail} alt={name} />
      </div>
    );
  });

  const gameOptions = gameCollection
    .filter((e) => !selectedGames.has(e))
    .map((e, i) => {
      const { name, objectid: id } = e;
      const addGame = () => {
        setSelectedGames((oldValue) => {
          const newValue = new Set(oldValue);
          newValue.add(e);
          return newValue;
        });
      };
      return (
        <div className="gameOption" key={i + "_" + name}>
          <GameInfo game={new Game({ name, id })} />
          <div>
            <button onClick={addGame}>Choose</button>
          </div>
        </div>
      );
    });

  return (
    <div className="ConfigureRoomPage">
      <h2>Configure Room</h2>
      <div className="roomName">
        <span>Room Name:&nbsp;</span>
        <input value={nameInput} onChange={(e) => setNameInput(e.target.value)}></input>
      </div>
      <div className="selectedGames">{selectedGameThumbnails}</div>
      <div>{gameOptions}</div>
      <div className="completeButton">
        <button onClick={createRoom}>Complete</button>
      </div>
    </div>
  );
};

export default ConfigureRoomPage;
