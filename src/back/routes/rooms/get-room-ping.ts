import { Route, rooms } from "back/lib";

export const getRoomPingRoute = new Route("GET", "/room-ping", async (req) => {
  const { token, id: room_id } = req.query;

  if (!token || !room_id) {
    return {
      status: "failed",
      info: "'token' and 'id' are required in parameter",
    };
  }

  const { user } = req.session;

  if (!user) {
    return {
      status: "failed",
      info: "User is not logged in",
    };
  }

  const room = rooms.get(room_id as string);

  if (!room) {
    return {
      status: "failed",
      info: "Can not find room with given id",
    };
  }

  const subscriber = room.subscribers.get(user.id);

  if (!subscriber) {
    return {
      status: "failed",
      info: "User is not subscribing this room",
    };
  }

  if (subscriber.token !== token) {
    return {
      status: "failed",
      info: "Invalid token",
    };
  }

  subscriber.updated = new Date();

  return { status: "success" };
});
