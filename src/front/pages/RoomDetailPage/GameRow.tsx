import { useEffect, useRef } from "react";
import { Game } from "back/lib";
import { call, useLocalStorage, BggGameDetail } from "front";
import "./index.css";
import { useAppContext } from "front/lib";

interface Props {
  room_id: string;
  game: Game;
}

const GameRow = ({ room_id, game }: Props) => {
  const { user, setRooms } = useAppContext();
  const { id, votes } = game;

  const [bggGameDetail, setBggGameDetail] = useLocalStorage<BggGameDetail | undefined>(
    `bggGameDetail_${id}`,
    undefined
  );

  const init = useRef(false);

  useEffect(() => {
    if (init.current || bggGameDetail) return;
    init.current = true;
    const paramString = new URLSearchParams({ id, stats: "1" }).toString();
    type BggGameDetailResponse = { items: { item: BggGameDetail } };
    call.bgg.get<BggGameDetailResponse>("/thing?" + paramString).then((r) => {
      setBggGameDetail(new BggGameDetail(r.items.item));
    });
  }, [bggGameDetail, id, setBggGameDetail]);

  if (!bggGameDetail) return <></>;

  const {
    name,
    thumbnail,
    minplayers,
    maxplayers,
    minplaytime,
    maxplaytime,
    statistics,
  } = bggGameDetail || {};

  const safeName = Array.isArray(name) ? name[0].value : name.value;
  const complexity = +statistics?.ratings?.averageweight?.value || 0;

  const isVoted = game.votes.find((e) => e.id === user?.id);

  const onClickVote = () => {
    if (!user) return;

    setRooms((oldRooms) => {
      const newRooms = new Map(oldRooms);
      const newRoom = newRooms.get(room_id);
      if (!newRoom) return newRooms;

      newRoom.games = newRoom.games.map((e) => {
        if (e.id === id) {
          const newGame = new Game(e);
          if (isVoted) {
            newGame.votes.find((e, i) => {
              if (e.id === user.id) {
                newGame.votes.splice(i, 1);
                return true;
              }
              return false;
            });
          } else if (!newGame.votes.find((e) => e.id === user.id)) {
            newGame.votes.push(user);
          }
        }
        return new Game(e);
      });

      const games = newRooms.get(room_id)?.games.filter((e) => {
        return !!e.votes.find((f) => f.id === user.id);
      });

      call.post("/api/vote", { id: room_id, games });

      return newRooms;
    });
  };

  const users = votes.map(({ id, username }, i) => (
    <div key={`${id}_${i}`}>{username}</div>
  ));

  return (
    <div className="GameRow">
      <div className="gameInfo">
        <div>
          <img src={thumbnail} alt={safeName || game.id} />
        </div>
        <div>
          <div>{safeName}</div>
          <div>
            <span>
              {minplayers.value} - {maxplayers.value} players
            </span>
          </div>
          <div>
            <span>Complexity:&nbsp;</span>
            <span>{complexity.toFixed(1)} / 5</span>
          </div>
          <div>
            <span>
              {minplaytime.value} - {maxplaytime.value} mins
            </span>
          </div>
        </div>
      </div>
      <div>
        <button onClick={onClickVote}>Vote</button>
      </div>
      <div className="voters">{users}</div>
    </div>
  );
};

export default GameRow;
