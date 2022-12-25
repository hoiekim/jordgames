import { PATH, useAppContext, useCombos } from "front";
import Report from "./Report";
import "./index.css";

const { VOTE_RESULT } = PATH;

const RoomDetailPage = () => {
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
    return <Report key={`${combo[0]?.id}_${combo[1]?.id}`} combo={combo} />;
  });

  const seeResult = () => router.back();

  return (
    <div className="RoomDetailPage">
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

export default RoomDetailPage;
