import { nameFormat, Route, User } from "back/lib";

export const postLoginRoute = new Route<User>("POST", "/login", async (req) => {
  const { username } = req.body;
  const formattedName = nameFormat(username);
  if (!formattedName) {
    return {
      status: "failed",
      info: "Username should contain at least 1 non-space character.",
    };
  }
  const newUser = new User({ username: formattedName });
  req.session.user = newUser;
  return { status: "success", data: newUser };
});
