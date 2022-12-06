import { Route, getJsonableRooms, JsonableRoom } from "back/lib";

export interface RoomsGetResponse {
  rooms: JsonableRoom[];
}

export const getRoomsRoute = new Route<RoomsGetResponse>("GET", "/rooms", async () => {
  return {
    status: "success",
    data: { rooms: getJsonableRooms() },
  };
});
