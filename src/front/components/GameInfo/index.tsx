import { useEffect, useState } from "react";
import { Game } from "back/lib";
import { call, BggGameDetail, getColor, useAppContext, BggLinkData } from "front";
import { ChevronDownIcon, ImageCircle, PlayersIcon, TimeIcon } from "front/components";
import "./index.css";

interface Props {
  game: Game;
  vertical?: boolean;
  showVoters?: boolean;
}

const fetchJobs = new Map<string, true>();

const GameInfo = ({ game, vertical, showVoters }: Props) => {
  const { id, votes } = game;
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

  const { boardgamecategory, boardgamemechanic } = new BggLinkData(link);

  const voters = votes.map(({ id, username }, i) => {
    const backgroundColor = `var(--${getColor(parseInt(id, 16) % 5)})`;
    return (
      <div key={`${id}_${i}`} style={{ backgroundColor }}>
        {username}
      </div>
    );
  });

  return (
    <div className="GameInfo">
      <div className="flexBox">
        <div className="inlineBlock">
          <ImageCircle url={thumbnail} radius={69} />
        </div>
        <div className="inlineBlock">
          <div
            onClick={() => {
              if (boardgamecategory || boardgamemechanic) {
                setIsDetailOpen((s) => !s);
              }
            }}
            className="title"
          >
            <span>{safeName}</span>
            <div
              className="foldIcon"
              style={isDetailOpen ? { transform: "rotate(180deg)" } : undefined}
            >
              <ChevronDownIcon />
            </div>
          </div>
          <div className="line">
            <div>
              <TimeIcon />
              <span>
                {minplaytime.value} - {maxplaytime.value} min
              </span>
            </div>
            <div>
              <PlayersIcon />
              <span>
                {minplayers.value} - {maxplayers.value}
              </span>
            </div>
          </div>
        </div>
      </div>
      {isDetailOpen && (!!boardgamecategory || !!boardgamemechanic) && (
        <div className="detail">
          <div>
            <div className="title">Complexity:&nbsp;</div>
            <div>{complexity.toFixed(1)} / 5</div>
          </div>
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
      {!!showVoters && !!voters.length && <div className="voters">{voters}</div>}
    </div>
  );
};

export default GameInfo;
