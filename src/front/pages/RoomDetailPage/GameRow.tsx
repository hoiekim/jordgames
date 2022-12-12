import { Game } from "back/lib";
import { useAppContext, call } from "front";
import { GameInfo } from "front/components";

interface Props {
  room_id: string;
  game: Game;
}

const GameRow = ({ room_id, game }: Props) => {
  const { user, setRooms } = useAppContext();
  const { id, votes } = game;

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

  const voters = votes.map(({ id, username }, i) => (
    <div key={`${id}_${i}`}>{username}</div>
  ));

  return (
    <div className="GameRow">
      <GameInfo game={game} />
      {!!voters.length && <div className="voters">{voters}</div>}
      <div>
        <button className="void" onClick={onClickVote}>
          Vote
        </button>
      </div>
    </div>
  );
};

export default GameRow;
