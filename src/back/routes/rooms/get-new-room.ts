import { Route, Room, rooms } from "back/lib";

export type NewRoomGetResponse = { id: string };

export const getNewRoomRoute = new Route<NewRoomGetResponse>(
  "GET",
  "/new-room",
  async (req, res) => {
    const newRoom = new Room();
    const { id } = newRoom;
    rooms.set(id, newRoom);

    return { status: "success", data: { id } };
  }
);
