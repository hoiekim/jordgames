import { PATH, useAppContext, useCombos } from "front";
import Report from "./Report";
import "./index.css";

const { VOTE_RESULT } = PATH;

const VoteResultPage = () => {
  const { rooms, router } = useAppContext();
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

  return (
    <div className="VoteResultPage">
      <h2>
        <span>Results for {room.name}</span>
      </h2>
      <div className="gameComboCarousel">{gameComboHorses}</div>
      <div className="floatingBox">
        <button className="green shadow big" onClick={seeResult}>
          Vote Again
        </button>
      </div>
    </div>
  );
};

export default VoteResultPage;
