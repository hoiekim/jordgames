import { useEffect, useRef } from "react";
import { Game } from "back/lib";
import { call, useLocalStorage, BggGameDetail } from "front";
import "./index.css";

interface Props {
  game: Game;
}

const GameThumbnail = ({ game }: Props) => {
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

  const { name, thumbnail } = bggGameDetail || {};

  const safeName = Array.isArray(name) ? name[0].value : name.value;

  const users = votes.map(({ id, username }, i) => (
    <div key={`${id}_${i}`}>{username}</div>
  ));

  return (
    <div className="GameThumbnail">
      <div className="gameInfo">
        <div className="title">{safeName}</div>
        <div className="imageDiv">
          <img src={thumbnail} alt={safeName || game.id} />
        </div>
      </div>
      <div className="voters">{users}</div>
    </div>
  );
};

export default GameThumbnail;
