import { Route, User } from "back/lib";

export const postLoginRoute = new Route<User>("POST", "/login", async (req) => {
  const { username } = req.body;
  const newUser = new User({ username });
  req.session.user = newUser;
  return { status: "success", data: newUser };
});
