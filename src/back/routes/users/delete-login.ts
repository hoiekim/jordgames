import { Route, rooms } from "back/lib";

export const deleteLoginRoute = new Route("DELETE", "/login", async (req) => {
  const { user } = req.session;
  if (!user) {
    return {
      status: "failed",
      info: "User is not logged in.",
    };
  }

  rooms.forEach(({ subscribers }) =>
    subscribers.forEach(({ id }) => {
      if (id === user.id) subscribers.delete(id);
    })
  );

  req.session.user = undefined;

  return {
    status: "success",
    info: "Logged out.",
  };
});
