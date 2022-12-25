import { useEffect, useState } from "react";
import { Game } from "back/lib";
import { useAppContext, Player, getColor, ImageCircle } from "front";

interface Props {
  combo: Game[];
  minPlayersForRoom: number;
}

const Report = ({ combo, minPlayersForRoom }: Props) => {
  const { bggGameDetails, viewSize } = useAppContext();
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
        });
      });

      const newValue = combo.map(() => new Map());

      const pushPlayer = () => {
        for (let i = 0; i < combo.length; i++) {
          const game = combo[i];
          const gameDetail = bggGameDetails.get(game.id);
          if (!gameDetail) continue;

          const players = newValue[i];
          const minPlayers = Math.max(minPlayersForRoom, +gameDetail.minplayers.value);
          if (minPlayers <= players.size) continue;

          Array.from(allPlayers.values())
            .sort((a, b) => {
              return +a.flexible - +b.flexible;
            })
            .find((player) => {
              return !!player.votedGames.find(({ id }) => {
                if (id === game.id) {
                  players.set(player.id, player);
                  allPlayers.delete(player.id);
                  return true;
                }
                return false;
              });
            });
        }

        const gamesWithPlayersLessThanMin = combo.filter(({ id }, i) => {
          const gameDetail = bggGameDetails.get(id);
          if (!gameDetail) return false;
          const players = newValue[i];
          return +gameDetail.minplayers.value > players.size;
        });

        if (gamesWithPlayersLessThanMin.length) pushPlayer();
        else {
          const iterator = allPlayers.values();
          let e = iterator.next();
          while (!e.done) {
            const player = e.value;
            allPlayers.delete(player.id);
            combo.find((game, i) => {
              if (game.id === player.votedGames[0].id) {
                newValue[i].set(player.id, player);
                return true;
              }
              return false;
            });
            e = iterator.next();
          }
        }
      };

      pushPlayer();

      return newValue;
    });
  }, [combo, bggGameDetails, minPlayersForRoom]);

  const comboId = combo.map(({ id }) => id).join("_");

  const playersTag = players.map((player, i) =>
    Array.from(player.values())
      .sort((a, b) => +a.flexible - +b.flexible)
      .map((player) => {
        const { id, username, flexible } = player;
        const classes = ["player"];
        if (flexible) classes.push("flexible");
        const onClick = () => {
          if (!flexible) return;
          setPlayers((oldValue) => {
            const newValue = [...oldValue];
            let j = i + 1;
            if (j === newValue.length) j = 0;
            while (j !== i) {
              const game = combo[j];
              if (game.votes.find((voter) => voter.id === id)) {
                newValue[i].delete(id);
                newValue[j].set(id, player);
                break;
              }
              j++;
              if (j === newValue.length) j = 0;
            }
            return newValue;
          });
        };
        const backgroundColor = `var(--${getColor(parseInt(id, 16) % 5)})`;
        return (
          <div
            key={`${comboId}_${id}`}
            className={classes.join(" ")}
            onClick={onClick}
            style={{ backgroundColor }}
          >
            {username}
          </div>
        );
      })
  );

  const gameInfos = combo.map((game, i) => {
    const bggGameDetail = bggGameDetails.get(game.id);

    if (!bggGameDetail) return <></>;

    const { name, thumbnail } = bggGameDetail || {};
    const safeName = Array.isArray(name) ? name[0].value : name.value;

    return (
      <div key={game.id} className="resultGameCard">
        <div className="title">{safeName}</div>
        <div className="image">
          <ImageCircle url={thumbnail} radius={69} />
        </div>
        <div className="players">{playersTag[i]}</div>
      </div>
    );
  });

  const smallScreen = viewSize.width < 440;

  if (gameInfos.length % 2 && smallScreen) gameInfos.push(<div key="placeholder" />);

  return <div className="Report">{gameInfos}</div>;
};

export default Report;
