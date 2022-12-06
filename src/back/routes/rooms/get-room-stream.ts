import {
  Route,
  rooms,
  getRandomId,
  Subscriber,
  getJsonableRoom,
  JsonableRoom,
} from "back/lib";

export interface RoomStreamGetResponse {
  token?: string;
  room?: JsonableRoom;
}

export const getRoomStreamRoute = new Route<RoomStreamGetResponse>(
  "GET",
  "/room-stream",
  async (req, res, stream) => {
    const { id: room_id } = req.query;
    const room = rooms.get(room_id as string);

    if (!room) {
      return {
        status: "failed",
        info: "Can not find room to subscribe",
      };
    }

    const { user } = req.session;

    if (!user) {
      return {
        status: "failed",
        info: "User is not logged in",
      };
    }

    if (room.subscribers.has(user.id)) {
      return {
        status: "failed",
        info: "User is already subscribing this room",
      };
    }

    const subscriber = new Subscriber(user, room_id as string, stream);
    room.subscribers.set(subscriber.id, subscriber);
    stream({ status: "streaming", data: { room: getJsonableRoom(room) } });

    try {
      return new Promise((res) => {
        const recur = () => {
          const subscriber = room.subscribers.get(user.id);
          if (!subscriber) return res();
          const token = getRandomId();
          subscriber.token = token;
          stream({ status: "streaming", data: { token } });
          setTimeout(() => {
            recur();
          }, 3001);
        };

        recur();
      });
    } catch (error: any) {
      console.error(`Failed to update a room: ${room_id}`);
      throw new Error(error);
    }
  }
);
