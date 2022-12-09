import { useState, useEffect, useRef } from "react";
import { Game, Room } from "back/lib";
import { call, PATH, useAppContext, BggGame } from "front";
import { GameInfo } from "front/components";
import "./index.css";
import { useLocalStorage } from "front/lib";

export type BggCollections = Map<string, BggGame[]>;

const DEFUALT_COLLECTION = "JordGames";

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
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);
  const [collectionUsernameInput, setCollectionUsernameInput] = useLocalStorage(
    "collectionUsernameInput",
    "JordGames"
  );
  const [collectionUsername, setCollectionUsername] = useState(DEFUALT_COLLECTION);
  const [selectedGames, setSelectedGames] = useState<Set<BggGame>>(new Set());
  const [bggCollections, setBggCollections] = useState<BggCollections>(new Map());

  const bggCollection = bggCollections.get(collectionUsername);

  useEffect(() => {
    if (path !== PATH.CONFIGURE_ROOM || bggCollection) return;

    type CollectionResponse = { items: { item: BggGame[] } };
    const paramString = new URLSearchParams({
      username: collectionUsername,
    }).toString();

    call.bgg.get<CollectionResponse>("/collection?" + paramString).then((r) => {
      setBggCollections((oldValue) => {
        const newValue = new Map(oldValue);
        newValue.set(collectionUsername, r.items.item);
        return newValue;
      });
    });
  }, [path, collectionUsername]);

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

  const gameOptions =
    bggCollection &&
    Array.from(bggCollection.values())
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
      <h2>
        <span>Configure Room</span>
        <button
          onClick={() => {
            if (showAdvancedConfig) {
              setCollectionUsernameInput(DEFUALT_COLLECTION);
              setCollectionUsername(DEFUALT_COLLECTION);
            }
            window.scrollTo(0, 0);
            setShowAdvancedConfig(!showAdvancedConfig);
          }}
        >
          Advanced
        </button>
      </h2>
      {showAdvancedConfig && (
        <div className="collectionUsername">
          <span>Collection Username:&nbsp;</span>
          <input
            value={collectionUsernameInput}
            onChange={(e) => setCollectionUsernameInput(e.target.value)}
            onBlur={() => setCollectionUsername(collectionUsernameInput)}
            onKeyUp={(e) =>
              e.key === "Enter" && setCollectionUsername(collectionUsernameInput)
            }
          ></input>
        </div>
      )}
      <div className="roomName">
        <span>Room Name:&nbsp;</span>
        <input value={nameInput} onChange={(e) => setNameInput(e.target.value)}></input>
      </div>
      <div className="selectedGames">{selectedGameThumbnails}</div>
      <div>{gameOptions || ""}</div>
      <div className="completeButton">
        <button onClick={createRoom}>Complete</button>
      </div>
    </div>
  );
};

export default ConfigureRoomPage;
