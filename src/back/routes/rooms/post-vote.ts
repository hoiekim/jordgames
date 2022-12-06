import { Route, rooms, Game, getJsonableRoom } from "back/lib";

export const postVoteRoute = new Route("POST", "/vote", async (req) => {
  if (!req.body || !Object.keys(req.body).length) {
    return {
      status: "failed",
      info: "Request body is required but not provided.",
    };
  }

  const { id: room_id, games: input_games } = req.body;
  const room = rooms.get(room_id);

  if (!room) {
    return {
      status: "failed",
      info: "Can not find room to update",
    };
  }

  const { user } = req.session;

  if (!user) {
    return {
      status: "failed",
      info: "User is not logged in",
    };
  }

  try {
    room.games.forEach(({ id, votes }) => {
      votes.forEach(({ id }, i) => {
        if (id === user.id) votes.splice(i, 1);
      });
      const isVoted = input_games.find(({ id: input_id }: Game) => id === input_id);
      if (isVoted) votes.push(user);
    });

    room.subscribers.forEach(({ id, stream }) => {
      if (id === user.id) return;
      stream({ status: "streaming", data: { room: getJsonableRoom(room) } });
    });

    return { status: "success" };
  } catch (error: any) {
    console.error(`Failed to update a room: ${room_id}`);
    throw new Error(error);
  }
});
