import { Room } from "back/lib";
import { PATH, useAppContext } from "front";
import { EditIcon, ImageCircle, PlayersIcon } from "front/components";

interface Props {
  room: Room;
}

const RoomRow = ({ room }: Props) => {
  const { router } = useAppContext();
  const { id, name, games } = room;

  const voters = new Set(games.flatMap(({ votes }) => votes.map(({ id }) => id)));

  const onClickEdit = () => {
    const params = new URLSearchParams({ id });
    router.go(PATH.CONFIGURE_ROOM, { params });
  };

  const onClickEnter = () => {
    const params = new URLSearchParams({ id });
    router.go(PATH.ROOM, { params });
  };

  const gameCircles = games.map(({ id, thumbnail }) => (
    <ImageCircle key={id} radius={30} url={thumbnail} />
  ));

  return (
    <div className="RoomRow">
      <div className="roomInfo">
        <div className="title">{name || "Unnamed"}</div>
        <div className="info">
          <PlayersIcon />
          <span>{voters.size} votes</span>
        </div>
        <div className="games">{gameCircles}</div>
      </div>
      <div className="joinButtonBox">
        <button className="blue" onClick={onClickEnter}>
          Join
        </button>
      </div>
      <div className="editButtonBox">
        <button className="icon" onClick={onClickEdit}>
          <EditIcon />
        </button>
      </div>
    </div>
  );
};

export default RoomRow;
