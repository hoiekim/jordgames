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

  if (rooms.size) {
    return (
      <div className="RoomsTable">
        <div>{roomRows}</div>
        <div className="floatingBox">
          <button className="addButton green big shadow" onClick={onClickAdd}>
            Create New
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="RoomsTable">
      <div className="placeholder">
        There aren't any rooms right now: how about creating one?
      </div>
      <div className="inPageButtonBox">
        <button className="addButton green big shadow" onClick={onClickAdd}>
          Create New
        </button>
      </div>
    </div>
  );
};

export default RoomsTable;
