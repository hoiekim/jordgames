import { Game } from "back/lib";
import { getColor, useAppContext, Player } from "front";
import { ImageCircle } from "front/components";
import "./index.css";

interface Props {
  game: Game;
  players: Map<string, Player>;
}

const ResultGameCard = ({ game, players }: Props) => {
  const { bggGameDetails } = useAppContext();
  const bggGameDetail = bggGameDetails.get(game.id);

  if (!bggGameDetail) return <></>;

  const { name, thumbnail } = bggGameDetail || {};

  const safeName = Array.isArray(name) ? name[0].value : name.value;

  const voters = Array.from(players.values()).map(({ id, username }, i) => {
    const backgroundColor = `var(--${getColor(parseInt(id, 16) % 5)})`;
    return (
      <div key={`${id}_${i}`} style={{ backgroundColor }}>
        {username}
      </div>
    );
  });

  return (
    <div className="ResultGameCard">
      <div className="title">{safeName}</div>
      <div className="image">
        <ImageCircle url={thumbnail} radius={69} />
      </div>
      <div></div>
    </div>
  );
};

export default ResultGameCard;
