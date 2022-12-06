import { useState } from "react";
import { useAppContext, call, PATH } from "front";
import { User } from "back/lib";
import "./index.css";

const LoginPage = () => {
  const { setUser, router } = useAppContext();

  const [usernameInput, setUsernameInput] = useState("");

  const onClick = () => {
    const user = { username: usernameInput };
    call.post<User>("/api/login", user).then((r) => {
      if (r.status === "success") {
        router.go(PATH.ROOMS);
        setUser(r.data);
        setUsernameInput("");
      }
    });
  };

  return (
    <div className="LoginPage">
      <h2>What is your name?</h2>
      <div className="inputArea">
        <div>
          <input
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            onKeyUp={(e) => e.key === "Enter" && onClick()}
          ></input>
        </div>
        <div>
          <button onClick={onClick}>Enter</button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
