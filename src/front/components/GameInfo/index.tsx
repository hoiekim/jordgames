import { useEffect } from "react";
import { Game } from "back/lib";
import { call, BggGameDetail } from "front";
import { useAppContext } from "front/lib";
import "./index.css";

interface Props {
  game: Game;
  vertical?: boolean;
}

const fetchJobs = new Map<string, true>();

const GameInfo = ({ game, vertical }: Props) => {
  const { id } = game;
  const { bggGameDetails, setBggGameDetails } = useAppContext();
  const bggGameDetail = bggGameDetails.get(game.id);

  useEffect(() => {
    if (bggGameDetail || fetchJobs.has(game.id)) return;
    const paramString = new URLSearchParams({ id, stats: "1" }).toString();
    type BggGameDetailResponse = { items: { item: BggGameDetail } };
    call.bgg.get<BggGameDetailResponse>("/thing?" + paramString).then((r) => {
      setBggGameDetails((oldValue) => {
        const newValue = new Map(oldValue);
        newValue.set(game.id, new BggGameDetail(r.items.item));
        return newValue;
      });
    });
    fetchJobs.set(game.id, true);
  }, [bggGameDetail, id, setBggGameDetails, game.id]);

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

  if (vertical)
    return (
      <div className="GameInfo vertical">
        <div className="title">{safeName}</div>
        <div className="image">
          <img src={thumbnail} alt={safeName || game.id} />
        </div>
        <div>
          <div className="line">
            <span>
              {minplayers.value} - {maxplayers.value} players
            </span>
          </div>
          <div className="line">
            <span>Complexity:&nbsp;</span>
            <span>{complexity.toFixed(1)} / 5</span>
          </div>
          <div className="line">
            <span>
              {minplaytime.value} - {maxplaytime.value} mins
            </span>
          </div>
        </div>
      </div>
    );

  return (
    <div className="GameInfo">
      <div>
        <img src={thumbnail} alt={safeName || game.id} />
      </div>
      <div>
        <div className="title">{safeName}</div>
        <div className="line">
          <span>
            {minplayers.value} - {maxplayers.value} players
          </span>
        </div>
        <div className="line">
          <span>Complexity:&nbsp;</span>
          <span>{complexity.toFixed(1)} / 5</span>
        </div>
        <div className="line">
          <span>
            {minplaytime.value} - {maxplaytime.value} mins
          </span>
        </div>
      </div>
    </div>
  );
};

export default GameInfo;
