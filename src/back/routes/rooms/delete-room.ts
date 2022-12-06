import { Route, rooms } from "back/lib";

export const deleteRoomRoute = new Route("DELETE", "/room", async (req) => {
  const id = req.query.id as string;

  if (!id) {
    return {
      status: "failed",
      info: "id is required but not provided.",
    };
  }

  return { status: "success", data: rooms.delete(id) };
});
