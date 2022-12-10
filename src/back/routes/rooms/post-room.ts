import { Route, rooms, nameFormat } from "back/lib";

export const postRoomRoute = new Route("POST", "/room", async (req) => {
  if (!req.body || !Object.keys(req.body).length) {
    return {
      status: "failed",
      info: "Request body is required but not provided.",
    };
  }

  const { id, name, games } = req.body;

  const formattedName = nameFormat(name);
  if (!formattedName) {
    return {
      status: "failed",
      info: "Room name should contain at least 1 non-space character.",
    };
  }

  if (games.length < 3 || 100 < games.length) {
    return {
      status: "failed",
      info: "Games should be more than 3 and less than 100.",
    };
  }

  const room = rooms.get(id);

  if (!room) {
    return {
      status: "failed",
      info: "Can not find room to update.",
    };
  }

  try {
    room.name = formattedName;
    room.games = games;
    return { status: "success" };
  } catch (error: any) {
    console.error(`Failed to update a room: ${id}`);
    throw new Error(error);
  }
});
