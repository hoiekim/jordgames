import { Route } from "back/lib";

export const deleteLoginRoute = new Route("DELETE", "/login", async (req) => {
  req.session.user = undefined;
  return {
    status: "success",
    info: "Logged out",
  };
});
