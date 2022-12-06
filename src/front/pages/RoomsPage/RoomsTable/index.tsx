import { call, PATH, useAppContext } from "front";
import RoomRow from "./RoomRow";
import "./index.css";
import { NewRoomGetResponse } from "back/routes";
import { Room } from "back/lib";

const RoomsTable = () => {
  const { rooms, setRooms, router } = useAppContext();

  const roomRows = Array.from(rooms.values()).map((room) => (
    <RoomRow key={room.id} room={room} />
  ));

  const onClickAdd = () => {
    call.get<NewRoomGetResponse>("/api/new-room").then((r) => {
      if (r.status === "success") {
        const id = r.data?.id as string;
        setRooms((oldValue) => {
          const newValue = new Map(oldValue);
          newValue.set(id, new Room({ id }));
          return newValue;
        });
        const params = new URLSearchParams({ id });
        router.go(PATH.CONFIGURE_ROOM, { params });
      }
    });
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
