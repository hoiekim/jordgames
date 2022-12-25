import { useEffect, useState } from "react";
import { Game } from "back/lib";
import { useAppContext, Player } from "front";
import ResultGameCard from "./ResultGameCard";

interface Props {
  combo: Game[];
}

const Report = ({ combo }: Props) => {
  const { bggGameDetails } = useAppContext();
  const [players, setPlayers] = useState<Map<string, Player>[]>(
    combo.map(() => new Map())
  );

  useEffect(() => {
    setPlayers((_oldValue) => {
      const allPlayers = new Map<string, Player>();

      combo.forEach((game) => {
        const { votes } = game;
        votes.forEach((user) => {
          const player = allPlayers.get(user.id) || new Player(user, false);
          if (!allPlayers.has(user.id)) allPlayers.set(user.id, player);
          else player.flexible = true;
          player.votedGames.push(game);
          return [user.id, player];
        });
      });

      const newValue = combo.map(() => new Map());

      const pushPlayer = () => {
        for (let i = 0; i < combo.length; i++) {
          const game = combo[i];
          const gameDetail = bggGameDetails.get(game.id);
          if (!gameDetail) continue;
          const players = newValue[i];
          if (+gameDetail.minplayers.value <= players.size) continue;
          const playerToAdd = Array.from(allPlayers.values()).find(({ votedGames }) => {
            if (votedGames.find(({ id }) => id === game.id)) return true;
            return false;
          });
          if (!playerToAdd) throw new Error("Failed to create report.");
          players.set(playerToAdd.id, playerToAdd);
          allPlayers.delete(playerToAdd.id);
        }
      };

      pushPlayer();

      return newValue;
    });
  }, [combo, bggGameDetails]);

  const comboId = combo.map(({ id }) => id).join("_");

  const playersTag = players.map((player) =>
    Array.from(player.values())
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
          <div key={`${comboId}_${id}`} className={classes.join(" ")} onClick={onClick}>
            {username}
          </div>
        );
      })
  );

  const gameInfos = combo.map((game, i) => (
    <ResultGameCard key={game.id} game={game} players={players[i]} />
  ));

  return <div className="Report">{gameInfos}</div>;
};

export default Report;
