import { Route, rooms } from "back/lib";

export const postRoomRoute = new Route("POST", "/room", async (req) => {
  if (!req.body || !Object.keys(req.body).length) {
    return {
      status: "failed",
      info: "Request body is required but not provided.",
    };
  }

  const { id, name, games } = req.body;
  const room = rooms.get(id);

  if (!room) {
    return {
      status: "failed",
      info: "Can not find room to update",
    };
  }

  try {
    room.name = name;
    room.games = games;
    return { status: "success" };
  } catch (error: any) {
    console.error(`Failed to update a room: ${id}`);
    throw new Error(error);
  }
});
