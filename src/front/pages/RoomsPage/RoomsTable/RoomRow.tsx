import { PATH, useAppContext } from "front";
import { Room } from "back/lib";

interface Props {
  room: Room;
}

const RoomRow = ({ room }: Props) => {
  const { router } = useAppContext();
  const { id, name, games } = room;

  const onClickEdit = () => {
    const params = new URLSearchParams({ id });
    router.go(PATH.CONFIGURE_ROOM, { params });
  };

  const onClickEnter = () => {
    const params = new URLSearchParams({ id });
    router.go(PATH.ROOM, { params });
  };

  return (
    <div className="RoomRow">
      <div className="roomInfo">
        <div>{name || "Unnamed"}</div>
        <div>{games.length} games</div>
      </div>
      <div className="buttons">
        <button onClick={onClickEdit}>Edit</button>
        <button onClick={onClickEnter}>Enter</button>
      </div>
    </div>
  );
};

export default RoomRow;
