import { PATH, useAppContext } from "front";
import RoomRow from "./RoomRow";
import "./index.css";

const RoomsTable = () => {
  const { rooms, router } = useAppContext();

  const roomRows = Array.from(rooms.values()).map((room) => (
    <RoomRow key={room.id} room={room} />
  ));

  const onClickAdd = () => {
    router.go(PATH.CONFIGURE_ROOM);
  };

  return (
    <div className="RoomsTable">
      <div>{roomRows}</div>
      <div>
        <button className="addButton" onClick={onClickAdd}>
          +
        </button>
      </div>
    </div>
  );
};

export default RoomsTable;
