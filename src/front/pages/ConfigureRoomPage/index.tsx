import { useState, useEffect } from "react";
import { Game, Room } from "back/lib";
import { NewRoomGetResponse } from "back/routes";
import { call, PATH, useAppContext, BggGame, useLocalStorage } from "front";
import { GameInfo } from "front/components";
import "./index.css";

const DEFUALT_COLLECTION = "jordgames";
let apiCallThrottling = false;

const ConfigureRoomPage = () => {
  const { router, rooms, setRooms, bggCollections, setBggCollections, bggGameDetails } =
    useAppContext();
  const { path, params, transition } = router;
  const { incomingPath, incomingParams } = transition;
  const id =
    (path === PATH.CONFIGURE_ROOM
      ? params.get("id")
      : incomingPath === PATH.CONFIGURE_ROOM
      ? incomingParams.get("id")
      : "") || "";

  const room = rooms.get(id);

  const [nameInput, setNameInput] = useState(room?.name || "");
  const [minPlayersInput, setMinPlayersInput] = useState(room?.min_players || 0);
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);
  const [collectionUsernameInput, setCollectionUsernameInput] = useLocalStorage(
    "collectionUsernameInput",
    DEFUALT_COLLECTION
  );
  const [collectionUsername, setCollectionUsername] = useState(DEFUALT_COLLECTION);
  const [selectedGames, setSelectedGames] = useState<Map<string, BggGame>>(() => {
    if (!room) return new Map();
    return new Map(
      room.games.map(({ id }) => {
        const bggGameDetail = bggGameDetails.get(id);
        if (bggGameDetail) return [id, BggGame.fromDetail(bggGameDetail)];
        else return [id, new BggGame({ objectid: id })];
      })
    );
  });

  const bggCollection = bggCollections.get(collectionUsername);

  useEffect(() => {
    if (!room) return;
    setNameInput(room.name || "");
    setSelectedGames((oldValue) => {
      const newValue = new Map(oldValue);
      room.games.forEach(({ id }) => {
        const bggGameDetail = bggGameDetails.get(id);
        if (bggGameDetail) newValue.set(id, BggGame.fromDetail(bggGameDetail));
        else newValue.set(id, new BggGame({ objectid: id }));
      });
      return newValue;
    });
  }, [id, bggGameDetails, room]);

  useEffect(() => {
    if (path !== PATH.CONFIGURE_ROOM || apiCallThrottling) return;

    apiCallThrottling = true;

    type Items = { item: BggGame[] };
    type CollectionResponse = { items?: Items; message?: string };
    const paramString = new URLSearchParams({
      username: collectionUsername,
    }).toString();

    call.bgg
      .get<CollectionResponse>("/collection?" + paramString)
      .then((r) => {
        if (!r.items) return;
        setBggCollections((oldValue) => {
          const newValue = new Map(oldValue);
          const items = r.items as Items;
          newValue.set(collectionUsername, items.item);
          return newValue;
        });
      })
      .catch(console.error)
      .finally(() => {
        apiCallThrottling = false;
      });
  }, [path, collectionUsername, setBggCollections]);

  const selectedGamesArray = Array.from(selectedGames.values());

  const createRoom = async () => {
    const alerts = [];

    if (!nameInput) alerts.push("set the name of the room");
    const { size } = selectedGames;
    if (size < 3 || 100 < size) alerts.push("choose more than 2 & less than 100 games");
    if (alerts.length) return window.alert("Please " + alerts.join(" and ") + ".");

    const games = selectedGamesArray.map(
      ({ objectid: id, name }) => new Game({ id, name })
    );

    const min_players = minPlayersInput;

    let newRoom: Room | undefined;

    if (id) {
      newRoom = new Room({ id, name: nameInput, games, min_players });
    } else {
      await call.get<NewRoomGetResponse>("/api/new-room").then(({ status, data }) => {
        if (status === "success" && data) {
          newRoom = new Room({ id: data.id, name: nameInput, games, min_players });
        }
      });
    }

    if (!newRoom) return;

    call.post("/api/room", newRoom).then((r) => {
      if (r.status === "success") {
        setRooms((oldRooms) => {
          const newRooms = new Map(oldRooms);
          if (newRoom) newRooms.set(newRoom.id, newRoom);
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
        const newValue = new Map(oldValue);
        newValue.delete(objectid);
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
    !!bggCollection &&
    Array.from(bggCollection.values())
      .filter(({ objectid }) => !selectedGames.has(objectid))
      .map((e, i) => {
        const { name, objectid: id } = e;
        const addGame = () => {
          setSelectedGames((oldValue) => {
            const newValue = new Map(oldValue);
            newValue.set(id, e);
            return newValue;
          });
        };
        return (
          <div className="gameOption" key={i + "_" + name}>
            <GameInfo game={new Game({ name, id })} />
            <div>
              <button className="void" onClick={addGame}>
                Choose
              </button>
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
          {showAdvancedConfig ? "Use Default" : "Use Advanced"}
        </button>
      </h2>
      {showAdvancedConfig && (
        <div className="collectionUsername">
          <span>Collection:&nbsp;</span>
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
      <div className="roomName inputBox">
        <span>Room Name:&nbsp;</span>
        <input value={nameInput} onChange={(e) => setNameInput(e.target.value)}></input>
      </div>
      <div className="minPlayers inputBox">
        <span>Minimum Players:&nbsp;</span>
        <input
          type="number"
          value={minPlayersInput.toString()}
          onChange={(e) => setMinPlayersInput(+e.target.value)}
        ></input>
      </div>
      <div className="selectedGames">{selectedGameThumbnails}</div>
      <div>{gameOptions || ""}</div>
      <div className="floatingBox">
        <button onClick={createRoom}>Complete</button>
      </div>
    </div>
  );
};

export default ConfigureRoomPage;
