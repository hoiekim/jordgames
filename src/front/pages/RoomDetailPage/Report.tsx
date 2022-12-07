import { Game, User } from "back/lib";
import { useAppContext } from "front";
import { useEffect, useState } from "react";
import GameInfo from "./GameInfo";

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

    const mapA = new Map(gameA.votes.map((user) => [user.id, new Player(user, false)]));
    const mapB = new Map(
      gameB.votes
        .filter((user) => {
          const foundInA = mapA.get(user.id);
          if (foundInA) {
            foundInA.flexible = true;
            return false;
          }
          return true;
        })
        .map((user) => [user.id, new Player(user, false)])
    );

    const minplayersB = +(bggGameDetails.get(gameB.id)?.minplayers.value || 0);

    const iterator = mapA.values();
    let e = iterator.next();

    while (minplayersB > mapB.size && !e.done) {
      const player = e.value;
      if (player.flexible) {
        mapB.set(player.id, new Player(player, true));
        mapA.delete(player.id);
      }
      e = iterator.next();
    }

    setPlayers([mapA, mapB]);
  }, [combo, bggGameDetails]);

  const playersTagA = Array.from(players[0].values()).map((player) => {
    const { id, username, flexible } = player;
    const classes = ["player"];
    if (flexible) classes.push("flexible");
    const onClick = () => {
      setPlayers(([mapA, mapB]) => {
        const newMapA = new Map(mapA);
        const newMapB = new Map(mapB);
        newMapA.delete(id);
        newMapB.set(id, player);
        return [newMapA, newMapB];
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

  const playersTagB = Array.from(players[1].values()).map((player) => {
    const { id, username, flexible } = player;
    const classes = ["player"];
    if (flexible) classes.push("flexible");
    const onClick = () => {
      setPlayers(([mapA, mapB]) => {
        const newMapA = new Map(mapA);
        const newMapB = new Map(mapB);
        newMapB.delete(id);
        newMapA.set(id, player);
        return [newMapA, newMapB];
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
        <GameInfo game={gameA} table={true} />
        <GameInfo game={gameB} table={true} />
      </div>
      <div>
        <div className="voters">{playersTagA}</div>
        <div className="voters">{playersTagB}</div>
      </div>
    </div>
  );
};

export default Report;
