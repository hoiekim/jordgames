import { useEffect, useState } from "react";
import { Game, User } from "back/lib";
import { useAppContext } from "front";
import { GameInfo } from "front/components";

interface Props {
  combo: Game[];
}

class Player extends User {
  flexible: boolean;
  constructor(user: User, flexible: boolean) {
    super(user);
    this.flexible = flexible;
  }
}

const Report = ({ combo }: Props) => {
  const [gameA, gameB] = combo;
  const { bggGameDetails } = useAppContext();
  const [players, setPlayers] = useState<Map<string, Player>[]>([new Map(), new Map()]);

  useEffect(() => {
    const [gameA, gameB] = combo;

    const playersA = new Map(
      gameA.votes.map((user) => [user.id, new Player(user, false)])
    );
    const playersB = new Map(
      gameB.votes
        .filter((user) => {
          const foundInA = playersA.get(user.id);
          if (foundInA) {
            foundInA.flexible = true;
            return false;
          }
          return true;
        })
        .map((user) => [user.id, new Player(user, false)])
    );

    const minplayersB = +(bggGameDetails.get(gameB.id)?.minplayers.value || 0);

    const iterator = playersA.values();
    let e = iterator.next();

    while (minplayersB > playersB.size && !e.done) {
      const player = e.value;
      if (player.flexible) {
        playersB.set(player.id, new Player(player, true));
        playersA.delete(player.id);
      }
      e = iterator.next();
    }

    setPlayers([playersA, playersB]);
  }, [combo, bggGameDetails]);

  const playersTagA = Array.from(players[0].values())
    .sort((a, b) => +a.flexible - +b.flexible)
    .map((player) => {
      const { id, username, flexible } = player;
      const classes = ["player"];
      if (flexible) classes.push("flexible");
      const onClick = () => {
        if (!flexible) return;
        setPlayers(([playersA, playersB]) => {
          const newplayersA = new Map(playersA);
          const newplayersB = new Map(playersB);
          newplayersA.delete(id);
          newplayersB.set(id, player);
          return [newplayersA, newplayersB];
        });
      };
      return (
        <div
          key={`${gameA.id}_${gameB.id}_${id}`}
          className={classes.join(" ")}
          onClick={onClick}
        >
          {username}
        </div>
      );
    });

  const playersTagB = Array.from(players[1].values())
    .sort((a, b) => +a.flexible - +b.flexible)
    .map((player) => {
      const { id, username, flexible } = player;
      const classes = ["player"];
      if (flexible) classes.push("flexible");
      const onClick = () => {
        if (!flexible) return;
        setPlayers(([playersA, playersB]) => {
          const newplayersA = new Map(playersA);
          const newplayersB = new Map(playersB);
          newplayersB.delete(id);
          newplayersA.set(id, player);
          return [newplayersA, newplayersB];
        });
      };
      return (
        <div
          key={`${gameA.id}_${gameB.id}_${id}`}
          className={classes.join(" ")}
          onClick={onClick}
        >
          {username}
        </div>
      );
    });

  return (
    <div className="Report">
      <div>
        <GameInfo game={gameA} vertical={true} />
        <GameInfo game={gameB} vertical={true} />
      </div>
      <div>
        <div className="voters">{playersTagA}</div>
        <div className="voters">{playersTagB}</div>
      </div>
    </div>
  );
};

export default Report;
