import { useState } from "react";
import { User, nameFormat } from "back/lib";
import { useAppContext, call, PATH } from "front";
import { Logo } from "front/components";
import "./index.css";

const LoginPage = () => {
  const { setUser, router } = useAppContext();

  const [usernameInput, setUsernameInput] = useState("");

  const onClick = () => {
    const formattedName = nameFormat(usernameInput);
    if (!formattedName) {
      window.alert("Username should contain at least 1 non-space character.");
      return;
    }
    const user = { username: formattedName };
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
      <div className="flexBox">
        <div className="logo">
          <Logo />
        </div>
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
    </div>
  );
};

export default LoginPage;
