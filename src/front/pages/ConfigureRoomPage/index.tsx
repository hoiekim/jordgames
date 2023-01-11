import { useState, useEffect } from "react";
import { Game, Room } from "back/lib";
import { NewRoomGetResponse } from "back/routes";
import { call, PATH, useAppContext, BggGame, useLocalStorage } from "front";
import { GameInfo, ImageCircle } from "front/components";
import "./index.css";

const COLLECTION_JORDGAMES = "jordgames";
const COLLECTION_IMANTIS = "imantis";
const COLLECTION_OTHER = "_other";
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

  const { name, min_players, number_of_games } = room || new Room();

  const [nameInput, setNameInput] = useState(name);
  const [minPlayersInput, setMinPlayersInput] = useState(min_players);
  const [numberOfGamesInput, setNumberOfGamesInput] = useState(number_of_games);
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);
  const [collectionUsernameInput, setCollectionUsernameInput] = useLocalStorage(
    "collectionUsernameInput",
    COLLECTION_JORDGAMES
  );
  const [collectionUsername, setCollectionUsername] = useState(collectionUsernameInput);
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
        setTimeout(() => {
          apiCallThrottling = false;
        }, 5000);
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
      ({ objectid: id, name, thumbnail }) => new Game({ id, name, thumbnail })
    );

    const min_players = minPlayersInput;
    const number_of_games = numberOfGamesInput;

    let idFetchedIfNotExists = id;

    if (!idFetchedIfNotExists) {
      await call.get<NewRoomGetResponse>("/api/new-room").then(({ status, data }) => {
        if (status === "success" && data) {
          idFetchedIfNotExists = data.id;
        }
      });
    }

    if (!idFetchedIfNotExists) return;

    const newRoom = new Room({
      id: idFetchedIfNotExists,
      name: nameInput,
      games,
      min_players,
      number_of_games,
    });

    call.post("/api/room", newRoom).then((r) => {
      if (r.status === "success") {
        setRooms((oldRooms) => {
          const newRooms = new Map(oldRooms);
          newRooms.set(newRoom.id, newRoom);
          return newRooms;
        });
        router.go(PATH.ROOMS);
      }
    });
  };

  const selectedGameThumbnails = selectedGamesArray.map((e) => {
    const { objectid, thumbnail } = e;
    const removeGame = () => {
      setSelectedGames((oldValue) => {
        const newValue = new Map(oldValue);
        newValue.delete(objectid);
        return newValue;
      });
    };
    return (
      <div key={`selectedGame_${objectid}`} onClick={removeGame}>
        <ImageCircle radius={30} url={thumbnail} />
      </div>
    );
  });

  const gameOptions =
    !!bggCollection &&
    Array.from(bggCollection.values())
      .filter(({ objectid }) => objectid && !selectedGames.has(objectid))
      .map((e, i) => {
        const { name, objectid: id, thumbnail } = e;
        const addGame = () => {
          setSelectedGames((oldValue) => {
            const newValue = new Map(oldValue);
            newValue.set(id, e);
            return newValue;
          });
        };
        return (
          <div className="gameOption" key={i + "_" + name}>
            <GameInfo game={new Game({ name, id, thumbnail })} />
            {!!bggGameDetails.get(id) && (
              <div className="buttonHolder">
                <button className="green shadow big" onClick={addGame}>
                  Add
                </button>
              </div>
            )}
          </div>
        );
      });

  return (
    <div className="ConfigureRoomPage">
      <h2>
        <span>Configure Room</span>
      </h2>
      <div className="inputArea">
        <div className="inputBox grow roomName">
          <span>Room Name:</span>
          <input value={nameInput} onChange={(e) => setNameInput(e.target.value)}></input>
        </div>
        <div className="inputBox grow collectionUsername">
          <span>Game List:&nbsp;</span>
          {showAdvancedConfig ? (
            <input
              value={collectionUsernameInput}
              onChange={(e) => setCollectionUsernameInput(e.target.value)}
              onBlur={() => setCollectionUsername(collectionUsernameInput)}
              onKeyUp={(e) =>
                e.key === "Enter" && setCollectionUsername(collectionUsernameInput)
              }
            ></input>
          ) : (
            <select
              value={collectionUsernameInput}
              onChange={(e) => {
                const { value } = e.target;
                if (value === COLLECTION_OTHER) setShowAdvancedConfig(true);
                else {
                  setCollectionUsernameInput(value);
                  setCollectionUsername(value);
                }
              }}
            >
              <option value={COLLECTION_JORDGAMES}>JordGames</option>
              <option value={COLLECTION_IMANTIS}>Imantis</option>
              <option value={COLLECTION_OTHER}>Other...</option>
            </select>
          )}
        </div>
        <div className="inputBox numberOfStuff">
          <span># of Games:</span>
          <select
            value={numberOfGamesInput.toString()}
            onChange={(e) => setNumberOfGamesInput(+e.target.value)}
          >
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
          </select>
          <span>&nbsp;Players / Game ≥</span>
          <select
            value={minPlayersInput.toString()}
            onChange={(e) => setMinPlayersInput(+e.target.value)}
          >
            <option value={0}>0</option>
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
          </select>
        </div>
        {!!selectedGameThumbnails.length && (
          <div className="selectedGames noScrollBar">{selectedGameThumbnails}</div>
        )}
      </div>
      <div>{gameOptions || ""}</div>
      <div className="floatingBox">
        <button className="blue shadow big" onClick={createRoom}>
          Open Room
        </button>
      </div>
    </div>
  );
};

export default ConfigureRoomPage;
