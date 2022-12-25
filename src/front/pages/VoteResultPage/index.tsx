import { PATH, useAppContext, useCombos } from "front";
import Report from "./Report";
import "./index.css";
import { useState } from "react";

const { VOTE_RESULT } = PATH;

const VoteResultPage = () => {
  const { rooms, router } = useAppContext();
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const { path, transition, params } = router;
  const { incomingPath, incomingParams } = transition;

  const id =
    (path === VOTE_RESULT
      ? params.get("id")
      : incomingPath === VOTE_RESULT
      ? incomingParams.get("id")
      : "") || "";

  const room = rooms.get(id);
  const gameCombos = useCombos(room);

  if (!room) return <div>Not Found</div>;

  const gameComboHorses = gameCombos?.map((combo) => {
    const comboId = combo.map(({ id }) => id).join("_");
    return <Report key={comboId} combo={combo} minPlayersForRoom={room.min_players} />;
  });

  const seeResult = () => router.back();

  const onClickHelp = () => setIsHelpOpen((s) => !s);

  return (
    <div className="VoteResultPage">
      <h2>
        <span>Results for {room.name}</span>
      </h2>
      {gameComboHorses.length ? (
        <div className="gameComboCarousel">{gameComboHorses}</div>
      ) : (
        <div className="gameComboPlaceholder">
          <span>
            The algorithm was unable to find a match according to the votes and room
            configuration.
          </span>
          <div className="buttonBox">
            <button className="blue" onClick={onClickHelp}>
              Having trouble?
            </button>
          </div>
          {isHelpOpen && (
            <div className="help">
              <div className="title">Make sure:</div>
              <div>
                1. The number of voters is enough to play the number of games you set (and
                not too many!)
              </div>
              <div>
                2. That each player voted for enough games. (At least 3 is a good start!)
              </div>
              <div>
                3. That the minimum number of players per game falls within the playable
                range for the games you selected (ex: three people can't play chess)
              </div>
            </div>
          )}
        </div>
      )}
      <div className="floatingBox">
        <button className="green shadow big" onClick={seeResult}>
          Vote Again
        </button>
      </div>
    </div>
  );
};

export default VoteResultPage;
