import { useEffect, useState } from "react";
import { Game } from "back/lib";
import { call, BggGameDetail } from "front";
import { getColor, useAppContext, BggLinkData } from "front/lib";
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

  const [isDetailOpen, setIsDetailOpen] = useState(false);

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
    link,
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

  const colorCode = 1 + (parseInt(id) % 4);
  const borderBottomColor = `var(--${getColor(colorCode, 1)})`;

  const { boardgamecategory, boardgamemechanic } = new BggLinkData(link);

  return (
    <div className="GameInfo">
      <div className="flexBox">
        <div className="inlineBlock">
          <img src={thumbnail} alt={safeName || game.id} />
        </div>
        <div className="inlineBlock">
          <div
            onClick={() => {
              if (boardgamecategory || boardgamemechanic) {
                setIsDetailOpen((s) => !s);
              }
            }}
            className="title"
            style={{ borderBottomColor }}
          >
            <span>{safeName}</span>
            <div
              className="foldIcon"
              style={{
                transform: isDetailOpen ? "rotate(-90deg)" : "rotate(90deg)",
              }}
            >
              〉
            </div>
          </div>
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
      {isDetailOpen && (!!boardgamecategory || !!boardgamemechanic) && (
        <div className="detail">
          {!!boardgamecategory && (
            <div>
              <div className="title">Category</div>
              <div>{boardgamecategory.join(", ")}</div>
            </div>
          )}
          {!!boardgamemechanic && (
            <div>
              <div className="title">Mechanics</div>
              <div>{boardgamemechanic.join(", ")}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GameInfo;
